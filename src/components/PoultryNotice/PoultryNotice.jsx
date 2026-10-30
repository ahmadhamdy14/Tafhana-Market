import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { toast } from "react-toastify";
import { FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import "./PoultryNotice.css";

export default function PoultryNotice({ isAdmin }) {
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    const docRef = doc(db, "categoryNotices", "poultry");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const savedText = data?.text || "";
          setText(savedText);
          setEditText(savedText);
        } else {
          setText("");
          setEditText("");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error loading poultry notice from Firestore:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleStartEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditText(text);
    setIsEditing(true);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setEditText(text);
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSaving(true);
    try {
      const docRef = doc(db, "categoryNotices", "poultry");
      await setDoc(
        docRef,
        {
          text: editText.trim(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setText(editText.trim());
      setIsEditing(false);
      toast.success("تم حفظ تنويه قسم الطيور بنجاح 🎉");
    } catch (error) {
      console.error("Error saving poultry notice:", error);
      toast.error("فشل في حفظ التنويه. يرجى التحقق من صلاحيات المدير والمحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  // If initial load is in progress and no text cached yet, render nothing
  if (loading && !text) {
    return null;
  }

  // Regular visitors: hide completely if no text is saved
  if (!isAdmin && (!text || !text.trim())) {
    return null;
  }

  // Admin view: if no text exists yet, show an "Add Notice" button
  if (isAdmin && (!text || !text.trim()) && !isEditing) {
    return (
      <div
        className="poultry-notice-wrapper poultry-notice-empty-admin"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className="poultry-add-btn"
          onClick={handleStartEdit}
          title="إضافة تنويه أو ملاحظة لقسم الطيور"
        >
          <FaEdit className="btn-icon" />
          <span>إضافة تنويه لقسم الطيور (المدير)</span>
        </button>
      </div>
    );
  }

  // Admin editing mode: Textarea with Save & Cancel
  if (isEditing) {
    return (
      <div
        className="poultry-notice-wrapper poultry-notice-editing"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="poultry-edit-header">
          <span className="edit-title">✏️ تعديل تنويه قسم الطيور</span>
          <span className="edit-hint">يدعم الأسطر المتعددة</span>
        </div>

        <textarea
          className="poultry-textarea"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder="اكتب التنويه أو التعليمات هنا (مثلاً: مواعيد الذبح الطازج، الأسعار اليومية، ملاحظات التوصيل...)"
          rows={4}
          dir="rtl"
          disabled={isSaving}
          autoFocus
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <div className="poultry-edit-actions">
          <button
            type="button"
            className="poultry-btn poultry-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            <FaCheck className="btn-icon" />
            <span>{isSaving ? "جاري الحفظ..." : "حفظ"}</span>
          </button>
          <button
            type="button"
            className="poultry-btn poultry-cancel-btn"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <FaTimes className="btn-icon" />
            <span>إلغاء</span>
          </button>
        </div>
      </div>
    );
  }

  // Display mode (All visitors & admin)
  return (
    <div
      className="poultry-notice-wrapper poultry-notice-display"
      onClick={(e) => {
        // Prevent clicking inside the notice box from triggering the parent card link navigation
        e.stopPropagation();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="poultry-notice-header">
        <div className="poultry-notice-title">
          <span className="notice-icon">📢</span>
          <span className="notice-label">تنويه وملاحظات:</span>
        </div>
        {isAdmin && (
          <button
            type="button"
            className="poultry-edit-icon-btn"
            onClick={handleStartEdit}
            title="تعديل هذا التنويه"
          >
            <FaEdit className="btn-icon" />
            <span>تعديل</span>
          </button>
        )}
      </div>

      <div className="poultry-notice-text">
        {text}
      </div>
    </div>
  );
}
