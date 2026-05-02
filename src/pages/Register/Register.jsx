import "./Register.css";
import hero from "../../assets/1.jpeg";
import hero2 from "../../assets/2.jpeg";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeContext";
// 🔥 Firebase
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";



const Register = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    let newErrors = { ...errors };

    if (name === "firstName")
      newErrors.firstName = value ? "" : "الاسم الاول مطلوب";

    if (name === "lastName")
      newErrors.lastName = value ? "" : "الاسم الاخير مطلوب";

    if (name === "email") {
      if (!value) newErrors.email = "البريد الالكتروني مطلوب";
      else if (!/\S+@\S+\.\S+/.test(value))
        newErrors.email = "البريد الالكتروني غير صحيح";
      else newErrors.email = "";
    }

    if (newErrors.general) {
      delete newErrors.general;
    }

    if (name === "phone")
      newErrors.phone = value ? "" : "رقم الهاتف مطلوب";

    if (name === "password") {
      if (!value) newErrors.password = "كلمة المرور مطلوبة";
      else if (value.length < 8)
        newErrors.password = "كلمة المرور اقل من 8 حروف";
      else newErrors.password = "";
    }

    if (name === "confirmPassword") {
      if (!value)
        newErrors.confirmPassword = "كلمة المرور مطلوبة";
      else if (value !== updatedForm.password)
        newErrors.confirmPassword = "كلمة المرور غير متطابقة";
      else newErrors.confirmPassword = "";
    }

    if (name === "gender")
      newErrors.gender = value ? "" : "اختر الجنس";

    setErrors(newErrors);
  };

  const validate = () => {
    let newErrors = {};

    if (!form.firstName) newErrors.firstName = "الاسم الاول مطلوب";
    if (!form.lastName) newErrors.lastName = "الاسم الاخير مطلوب";

    if (!form.email) newErrors.email = "البريد الالكتروني مطلوب";

    if (!form.phone) newErrors.phone = "رقم الهاتف مطلوب";

    if (!form.password || form.password.length < 8)
      newErrors.password = "كلمة المرور مطلوبة";

    if (form.confirmPassword !== form.password)
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";

    if (!form.gender) newErrors.gender = "اختر الجنس";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      // 🔐 Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        gender: form.gender,
        email: form.email,
        uid: user.uid,
        role: "user",
        createdAt: new Date(),
      });

      toast.success("تم تسجيل الدخول بنجاح 🎉");
      navigate("/products");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("هذا البريد الالكتروني مسجل بالفعل . ");
        setErrors((prev) => ({ ...prev, general: "هذا البريد الالكتروني مسجل بالفعل ." }));
      } else if (error.code === "auth/weak-password") {
        toast.error("كلمة المرور اقل من 8 حروف");
        setErrors((prev) => ({ ...prev, general: "كلمة المرور اقل من 8 حروف" }));
      } else {
        toast.error("فشل التسجيل. حاول مرة اخرى ");
        setErrors((prev) => ({ ...prev, general: "فشل التسجيل. حاول مرة اخرى" }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">

      <div
        className="register-left"
        style={{ backgroundImage: `url(${theme === "light" ? hero : hero2})` }}
      />

      <div className="register-right">

        <h2>إنشاء حساب جديد</h2>

        <p className="sub-text">
          لديك حساب بالفعل؟ <Link to="/login" className="link">تسجيل الدخول</Link>
        </p>

        {/* FIRST NAME */}
        <div className="input-box">
          <label>الاسم الاول</label>
          <div className="input-with-icon">
            <FaUser className="icon" />
            <input name="firstName" onChange={handleChange} />
          </div>
          <span className="error">{errors.firstName}</span>
        </div>

        {/* LAST NAME */}
        <div className="input-box">
          <label>الاسم الاخير</label>
          <div className="input-with-icon">
            <FaUser className="icon" />
            <input name="lastName" onChange={handleChange} />
          </div>
          <span className="error">{errors.lastName}</span>
        </div>

        {/* EMAIL */}
        <div className="input-box">
          <label>البريد الالكتروني</label>
          <div className="input-with-icon">
            <FaEnvelope className="icon" />
            <input name="email" onChange={handleChange} />
          </div>
          <span className="error">{errors.email}</span>
        </div>

        {/* PHONE */}
        <div className="input-box">
          <label>رقم الهاتف</label>
          <div className="input-with-icon">
            <FaPhone className="icon" />
            <input name="phone" onChange={handleChange} />
          </div>
          <span className="error">{errors.phone}</span>
        </div>

        {/* PASSWORD */}
        <div className="input-box">
          <label>كلمة المرور</label>
          <div className="input-with-icon">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
            />
            <span onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <span className="error">{errors.password}</span>
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="input-box">
          <label>تأكيد كلمة المرور</label>
          <div className="input-with-icon">
            <FaLock className="icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              onChange={handleChange}
            />
            <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          <span className="error">{errors.confirmPassword}</span>
        </div>

        {/* GENDER */}
        <div className="input-box">
          <label>الجنس</label>

          <div className="gender-box">
            <label>
              <input type="radio" name="gender" value="male" onChange={handleChange} />
              ذكر
            </label>

            <label>
              <input type="radio" name="gender" value="female" onChange={handleChange} />
              انثى
            </label>
          </div>

          <span className="error">{errors.gender}</span>
        </div>

        {/* BUTTON */}
        <button className="register-btn" onClick={handleSubmit}>
          {loading ? "Loading..." : "Register"}
        </button>
        {errors.general && (
          <p className="error" style={{ textAlign: "center", marginTop: "10px", fontSize: "14px", fontWeight: "bold" }}>
            {errors.general}
          </p>
        )}
        <p className="sub-text" style={{ textAlign: "center" }}>
          امتلك حساب بالفعل؟ <Link to="/login" className="link">تسجيل الدخول</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;