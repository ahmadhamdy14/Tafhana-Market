import { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { db } from "../../firebase";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./MedicalServices.css";

// 📱 WhatsApp pharmacy/business number
const WHATSAPP_NUMBER = "201069199985";

// Default seed doctors in case database collection is empty
const DEFAULT_DOCTORS = [
  {
    name: "د. أحمد كمال",
    specialty: "أخصائي باطنة وجهاز هضمي",
    hours: "يومياً من 4 مساءً إلى 9 مساءً",
    fee: "150 EGP",
    image: "/doctors/dr-ahmed.png",
  },
  {
    name: "د. سارة المنشاوي",
    specialty: "أخصائية أطفال وحديثي الولادة",
    hours: "السبت إلى الأربعاء من 12 ظهراً إلى 5 مساءً",
    fee: "180 EGP",
    image: "/doctors/dr-sarah.png",
  },
  {
    name: "د. محمود عبد العزيز",
    specialty: "استشاري طب وجراحة العظام",
    hours: "الأحد والثلاثاء والخميس من 6 مساءً إلى 10 مساءً",
    fee: "200 EGP",
    image: "/doctors/dr-mahmoud.png",
  },
];

export default function MedicalServices() {
  const { user, userData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("medicine"); // "medicine" | "doctors"

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  /* ── Medicine Order State ── */
  const [medicineForm, setMedicineForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  /* ── Booking State ── */
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: "",
    phone: "",
    address: "",
  });

  /* ── Admin Doctor CRUD State ── */
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [doctorModalMode, setDoctorModalMode] = useState("add"); // "add" | "edit"
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    specialty: "",
    hours: "",
    fee: "",
    image: "",
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);

  /* ── Load Doctors from Firestore ── */
  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const snapshot = await getDocs(collection(db, "doctors"));
      let data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Seed default doctors if database is empty
      if (data.length === 0) {
        console.log("Doctors collection is empty, seeding default doctors...");
        const seedPromises = DEFAULT_DOCTORS.map(async (docData) => {
          const docRef = await addDoc(collection(db, "doctors"), docData);
          return { id: docRef.id, ...docData };
        });
        data = await Promise.all(seedPromises);
      }

      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("حدث خطأ أثناء تحميل بيانات الأطباء");
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ── Medicine Handlers ── */
  const handleMedicineChange = (e) => {
    setMedicineForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً لتتمكن من تقديم الطلب");
      return;
    }

    const { fullName, phone, address } = medicineForm;

    try {
      // 1. Save in Firestore orders collection exactly like a normal product order
      const items = [
        {
          id: "medicine_order_" + Date.now(),
          name: "💊 طلب دواء (ملاحظات وروشتة عبر واتساب)",
          qty: 1,
          price: 0,
          discount: 0,
          image: "/medical-card.png",
        }
      ];

      const orderId = await createOrder({
        userId: user.uid,
        customer: {
          firstName: fullName,
          lastName: "",
          email: user.email || "",
          phone: phone,
          address: address,
        },
        items,
        totalPrice: 0,
      });

      // 2. Format WhatsApp redirect message
      let message = `💊 *طلب دواء جديد* 📝\n`;
      message += `━━━━━━━━━━━━━━━\n`;
      message += `رقم الطلب: #${orderId.slice(0, 8).toUpperCase()}\n`;
      message += `👤 الاسم: ${fullName}\n`;
      message += `📞 الهاتف: ${phone}\n`;
      message += `📍 العنوان: ${address}\n`;
      message += `━━━━━━━━━━━━━━━\n`;
      message += `(سأقوم بإرسال تفاصيل طلب الدواء وصورة الروشتة في الرسالة التالية)`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      toast.success("تم إرسال البيانات وحفظ الطلب بنجاح!");
      setMedicineForm({ fullName: "", phone: "", address: "" });
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ الطلب. يرجى المحاولة مرة أخرى.");
    }
  };

  /* ── Booking Handlers ── */
  const handleBookingChange = (e) => {
    setBookingForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openBookingModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setSelectedDoctor(null);
    setShowBookingModal(false);
    setBookingForm({ patientName: "", phone: "", address: "" });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً لتتمكن من حجز موعد");
      return;
    }

    const { patientName, phone, address } = bookingForm;
    const feeNum = parseInt(selectedDoctor.fee) || 0;

    try {
      // 1. Save in Firestore orders collection exactly like a normal product order
      const items = [
        {
          id: "doctor_booking_" + selectedDoctor.id + "_" + Date.now(),
          name: `📅 حجز كشف: ${selectedDoctor.name} (${selectedDoctor.specialty})`,
          qty: 1,
          price: feeNum,
          discount: 0,
          image: selectedDoctor.image,
        }
      ];

      const orderId = await createOrder({
        userId: user.uid,
        customer: {
          firstName: patientName,
          lastName: "",
          email: user.email || "",
          phone: phone,
          address: address,
        },
        items,
        totalPrice: feeNum,
      });

      // 2. Format WhatsApp redirect message
      let message = `🩺 *حجز عيادة جديدة* 📅\n`;
      message += `━━━━━━━━━━━━━━━\n`;
      message += `رقم الحجز: #${orderId.slice(0, 8).toUpperCase()}\n`;
      message += `👤 المريض: ${patientName}\n`;
      message += `📞 الهاتف: ${phone}\n`;
      message += `📍 العنوان: ${address}\n`;
      message += `👨‍⚕️ الطبيب: ${selectedDoctor.name}\n`;
      message += `🏷️ التخصص: ${selectedDoctor.specialty}\n`;
      message += `💵 سعر الكشف: ${selectedDoctor.fee}\n`;
      message += `━━━━━━━━━━━━━━━\n`;
      message += `برجاء تأكيد الحجز وإرسال المواعيد المتاحة الكشف.`;

      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(waUrl, "_blank");
      toast.success("تم تسجيل طلب الحجز وحفظه بنجاح!");
      closeBookingModal();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تسجيل موعد الحجز. يرجى المحاولة مرة أخرى.");
    }
  };

  /* ── Admin Doctor CRUD Handlers ── */
  const handleDoctorChange = (e) => {
    setDoctorForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAddDoctorModal = () => {
    setDoctorForm({ name: "", specialty: "", hours: "", fee: "", image: "" });
    setDoctorModalMode("add");
    setShowDoctorModal(true);
  };

  const openEditDoctorModal = (doctor) => {
    setDoctorForm({
      name: doctor.name || "",
      specialty: doctor.specialty || "",
      hours: doctor.hours || "",
      fee: doctor.fee || "",
      image: doctor.image || "",
    });
    setEditingDoctorId(doctor.id);
    setDoctorModalMode("edit");
    setShowDoctorModal(true);
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    if (!doctorForm.name || !doctorForm.specialty) {
      toast.warning("يرجى ملء الحقول المطلوبة (الاسم والتخصص)");
      return;
    }

    const payload = {
      name: doctorForm.name,
      specialty: doctorForm.specialty,
      hours: doctorForm.hours || "غير محدد",
      fee: doctorForm.fee || "غير محدد",
      image: doctorForm.image || "/doctors/dr-ahmed.png", // default fallback
    };

    try {
      if (doctorModalMode === "add") {
        await addDoc(collection(db, "doctors"), payload);
        toast.success("تمت إضافة الطبيب بنجاح");
      } else {
        await updateDoc(doc(db, "doctors", editingDoctorId), payload);
        toast.success("تم تحديث بيانات الطبيب بنجاح");
      }
      setShowDoctorModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    }
  };

  const openDeleteDoctorModal = (id) => {
    setDeletingDoctorId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteDoctor = async () => {
    try {
      await deleteDoc(doc(db, "doctors", deletingDoctorId));
      toast.success("تم حذف الطبيب بنجاح");
      setShowDeleteModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
      toast.error("حدث خطأ أثناء حذف الطبيب");
    }
  };

  return (
    <div className="medical-services-container">
      {/* Page Header */}
      <div className="medical-header">
        <h1>الخدمات الطبية والرعاية الصحية</h1>
        <p>اطلب أدويتك الطبية أو احجز موعد كشف مباشر مع أفضل الأطباء المتخصصين</p>
      </div>

      {/* Tabs Switcher */}
      <div className="medical-tabs">
        <button
          className={`tab-btn ${activeTab === "medicine" ? "active" : ""}`}
          onClick={() => setActiveTab("medicine")}
        >
          💊 طلب الأدوية
        </button>
        <button
          className={`tab-btn ${activeTab === "doctors" ? "active" : ""}`}
          onClick={() => setActiveTab("doctors")}
        >
          🩺 حجز موعد طبيب
        </button>
      </div>

      {/* 🟢 TAB CONTENT: SIMPLIFIED MEDICINE FORM */}
      {activeTab === "medicine" && (
        <div className="medicine-section">
          <div className="medical-card-form">
            <h2>نموذج طلب الأدوية</h2>
            <p className="card-subtitle">أدخل بياناتك وسيتم تحويلك مباشرة للواتساب لإرسال تفاصيل الدواء أو صورة الروشتة</p>

            <form onSubmit={handleMedicineSubmit} className="medical-form">
              <div className="form-group">
                <label>الاسم بالكامل</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="أدخل اسمك بالكامل"
                  value={medicineForm.fullName}
                  onChange={handleMedicineChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف للتواصل</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="مثال: 01012345678"
                  value={medicineForm.phone}
                  onChange={handleMedicineChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>العنوان بالتفصيل 📍</label>
                <input
                  type="text"
                  name="address"
                  placeholder="أدخل عنوانك بالتفصيل"
                  value={medicineForm.address}
                  onChange={handleMedicineChange}
                  required
                />
              </div>

              <button type="submit" className="submit-btn primary-btn-green">
                إرسال عبر واتساب 💬
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔵 TAB CONTENT: DOCTOR APPOINTMENTS GRID */}
      {activeTab === "doctors" && (
        <div className="doctors-section">
          <div className="doctors-grid-title">
            <h2>الأطباء المتوفرون بالعيادات الخارجية</h2>
            <p>اختر الطبيب المتخصص المناسب واضغط على احجز الآن لتسجيل موعدك</p>
          </div>

          {loadingDoctors ? (
            <div style={{ textAlign: "center", padding: "40px", fontSize: "18px" }}>جاري تحميل الأطباء...</div>
          ) : (
            <div className="products-grid">
              {doctors.map((doctor) => (
                <div className="card" key={doctor.id}>
                  {/* Doctor Photo */}
                  <div className="doctor-photo-wrap">
                    <img src={doctor.image} alt={doctor.name} className="doctor-img" />
                  </div>

                  <div className="card-body">
                    <span className="category-badge">{doctor.specialty}</span>
                    <h3 style={{ margin: "5px 0" }}>{doctor.name}</h3>
                    
                    {/* Doctor Info Details */}
                    <div className="doctor-info-row">
                      <span className="info-icon">🕒</span>
                      <span className="info-text">{doctor.hours}</span>
                    </div>

                    <div className="doctor-info-row" style={{ marginBottom: "15px" }}>
                      <span className="info-icon">💵</span>
                      <span className="info-text">قيمة الكشف: <strong>{doctor.fee}</strong></span>
                    </div>

                    {/* Booking Button */}
                    <button
                      className="add-btn"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                      onClick={() => openBookingModal(doctor)}
                    >
                      احجز الآن 🩺
                    </button>

                    {/* Admin Actions */}
                    {userData?.role === "admin" && (
                      <div className="admin-actions">
                        <button className="edit-btn" onClick={() => openEditDoctorModal(doctor)}>
                          ✏️ تعديل
                        </button>
                        <button className="delete-btn" onClick={() => openDeleteDoctorModal(doctor.id)}>
                          🗑️ حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Admin Add Doctor Card */}
              {userData?.role === "admin" && (
                <div className="card add-card" onClick={openAddDoctorModal} style={{ cursor: "pointer" }}>
                  <div className="card-body add-card-body">
                    <span className="plus">+</span>
                    <h3>إضافة طبيب</h3>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ⚠️ PATIENT APPOINTMENT BOOKING MODAL */}
      {showBookingModal && selectedDoctor && (
        <div className="modal-overlay">
          <div className="modal-box booking-modal-box">
            <h3>تسجيل موعد كشف عند: {selectedDoctor.name}</h3>
            <p className="modal-subtitle">{selectedDoctor.specialty}</p>

            <form onSubmit={handleBookingSubmit} className="modal-booking-form">
              <div className="form-group align-right">
                <label>اسم المريض بالكامل</label>
                <input
                  type="text"
                  name="patientName"
                  placeholder="أدخل اسم المريض"
                  value={bookingForm.patientName}
                  onChange={handleBookingChange}
                  required
                />
              </div>

              <div className="form-group align-right">
                <label>رقم الهاتف للتواصل</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="مثال: 01012345678"
                  value={bookingForm.phone}
                  onChange={handleBookingChange}
                  required
                />
              </div>

              <div className="form-group align-right">
                <label>العنوان بالتفصيل 📍</label>
                <input
                  type="text"
                  name="address"
                  placeholder="أدخل عنوانك بالتفصيل"
                  value={bookingForm.address}
                  onChange={handleBookingChange}
                  required
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="submit" className="yes-btn" style={{ background: "#16a34a" }}>
                  تأكيد الحجز عبر واتساب 💬
                </button>
                <button type="button" className="no-btn" onClick={closeBookingModal}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛠️ ADMIN: ADD / EDIT DOCTOR MODAL */}
      {showDoctorModal && (
        <div className="modal-overlay">
          <div className="modal-box booking-modal-box">
            <h3>{doctorModalMode === "add" ? "➕ إضافة طبيب جديد" : "✏️ تعديل بيانات الطبيب"}</h3>

            <form onSubmit={handleDoctorSubmit} className="modal-booking-form">
              <div className="form-group align-right">
                <label>اسم الطبيب</label>
                <input
                  type="text"
                  name="name"
                  placeholder="الاسم بالكامل"
                  value={doctorForm.name}
                  onChange={handleDoctorChange}
                  required
                />
              </div>

              <div className="form-group align-right">
                <label>التخصص</label>
                <input
                  type="text"
                  name="specialty"
                  placeholder="مثال: أخصائي باطنة"
                  value={doctorForm.specialty}
                  onChange={handleDoctorChange}
                  required
                />
              </div>

              <div className="form-group align-right">
                <label>مواعيد العمل</label>
                <input
                  type="text"
                  name="hours"
                  placeholder="مثال: يومياً من 4 م إلى 9 م"
                  value={doctorForm.hours}
                  onChange={handleDoctorChange}
                />
              </div>

              <div className="form-group align-right">
                <label>قيمة الكشف</label>
                <input
                  type="text"
                  name="fee"
                  placeholder="مثال: 150 EGP"
                  value={doctorForm.fee}
                  onChange={handleDoctorChange}
                />
              </div>

              <div className="form-group align-right">
                <label>رابط صورة الطبيب (اختياري)</label>
                <input
                  type="text"
                  name="image"
                  placeholder="رابط الصورة أو مسارها"
                  value={doctorForm.image}
                  onChange={handleDoctorChange}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="submit" className="yes-btn" style={{ background: "#8b5cf6" }}>
                  {doctorModalMode === "add" ? "إضافة الطبيب" : "حفظ التعديلات"}
                </button>
                <button type="button" className="no-btn" onClick={() => setShowDoctorModal(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛠️ ADMIN: DELETE DOCTOR CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>هل أنت متأكد من حذف هذا الطبيب نهائياً؟</h3>
            <p style={{ color: "var(--sub)", fontSize: "14px", margin: "10px 0 20px" }}>لا يمكن التراجع عن هذا الإجراء.</p>

            <div className="modal-actions">
              <button className="yes-btn" onClick={confirmDeleteDoctor}>
                نعم، احذف
              </button>
              <button className="no-btn" onClick={() => setShowDeleteModal(false)}>
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
