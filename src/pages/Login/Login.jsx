import "./Login.css";
import hero from "../../assets/1.jpeg";
import hero2 from "../../assets/2.jpeg";
import { FaPhone, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ThemeContext } from "../../context/ThemeContext";

// 🔥 Firebase
import { auth, db, googleProvider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (!form.identifier || !form.password) {
      setError("جميع البيانات مطلوبة");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      let email = form.identifier.trim();

      // 🔍 Step 1: If it's not an email (doesn't contain @), assume it's a phone number
      if (!email.includes("@")) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phone", "==", email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          toast.error("البريد الإلكتروني أو رقم الهاتف غير مسجل");
          setLoading(false);
          return;
        }

        const userDoc = snapshot.docs[0];
        email = userDoc.data().email;
      }

      // 🔐 Step 2: Sign in with the email + entered password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        form.password
      );

      // 🔒 Step 3: Verify user still exists in Firestore (not deleted by admin)
      const userRef = doc(db, "users", userCredential.user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await signOut(auth);
        toast.error("تم حذف الحساب");
        return;
      }

      toast.success("تم تسجيل الدخول بنجاح 🎉");
      navigate("/");

    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password"
      ) {
        toast.error("البيانات المدخلة غير صحيحة");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // 🔒 Step 1: Check if user document already exists in Firestore for this UID
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      // 📝 Step 2: If first time logging in, check existing docs by email or create new
      if (!userSnap.exists()) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", user.email));
        const existingDocs = await getDocs(q);

        if (!existingDocs.empty) {
          const existingData = existingDocs.docs[0].data();
          await setDoc(userRef, {
            ...existingData,
            uid: user.uid,
            photoURL: user.photoURL || existingData.photoURL || "",
          });
        } else {
          const nameParts = (user.displayName || "").trim().split(" ");
          const firstName = nameParts[0] || user.email?.split("@")[0] || "مستخدم";
          const lastName = nameParts.slice(1).join(" ") || "";

          await setDoc(userRef, {
            firstName,
            lastName,
            email: user.email || "",
            phone: user.phoneNumber || "",
            gender: "",
            uid: user.uid,
            role: "user",
            photoURL: user.photoURL || "",
            createdAt: new Date(),
          });
        }
      }

      toast.success("تم تسجيل الدخول بنجاح 🎉");
      navigate("/");
    } catch (err) {
      if (err.code === "auth/account-exists-with-different-credential") {
        // 🔑 Account exists with password. Link Google provider to existing account without removing password.
        const pendingCred = GoogleAuthProvider.credentialFromError(err);
        const email = err.customData?.email || err.email;

        let passwordToUse = form.password;

        if (!passwordToUse || form.identifier.trim() !== email) {
          passwordToUse = window.prompt(
            `البريد الإلكتروني (${email}) مسجل بالفعل بكلمة مرور.\nيرجى إدخال كلمة المرور لربط حساب Google دون إزالة كلمة المرور:`
          );
        }

        if (passwordToUse) {
          try {
            const userCred = await signInWithEmailAndPassword(auth, email, passwordToUse);
            await linkWithCredential(userCred.user, pendingCred);
            toast.success("تم ربط حساب Google وتسجيل الدخول بنجاح 🎉");
            navigate("/");
            return;
          } catch (linkErr) {
            toast.error("كلمة المرور غير صحيحة. لم يتم ربط الحساب.");
          }
        } else {
          toast.info("تم إلغاء عملية الربط.");
        }
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.info("تم إغلاق نافذة تسجيل الدخول");
      } else if (err.code === "auth/cancelled-popup-request") {
        // popup request cancelled
      } else {
        toast.error("فشل تسجيل الدخول بواسطة Google");
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div
        className="login-left"
        style={{ backgroundImage: `url(${theme === "light" ? hero : hero2})` }}
      />

      <div className="login-right">
        <h2>تسجيل الدخول</h2>
        <p className="sub-text">
          ! ليس لديك حسابا{" "}
          <Link to="/register" className="link">
            اضغط هنا
          </Link>
        </p>

        {/* EMAIL OR PHONE */}
        <div className="input-box">
          <label>البريد الإلكتروني أو رقم الهاتف</label>
          <div className="input-with-icon">
            <FaPhone className="icon" />
            <input
              type="text"
              name="identifier"
              placeholder="ادخل البريد الإلكتروني أو رقم الهاتف"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* PASSWORD */}
        <div className="input-box">
          <label>كلمه المرور</label>
          <div className="input-with-icon">
            <FaLock className="icon" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="ادخل كلمه المرور"
              onChange={handleChange}
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="options">
          <label>
            <input type="checkbox" /> تذكرني
          </label>
          <Link to="/forgot-password" className="link" style={{ fontSize: "13px" }}>
            نسيت كلمه المرور؟
          </Link>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? "جاري التحميل..." : "تسجيل الدخول"}
        </button>

        <div className="divider">
          <span>أو</span>
        </div>

        <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
          <FcGoogle className="google-icon" />
          <span>المتابعة باستخدام Google</span>
        </button>

        <p className="sub-text" style={{ textAlign: "center" }}>
          ليس لديك حسابا؟ <Link to="/register" className="link">اضغط هنا</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;