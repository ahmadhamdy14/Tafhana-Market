import { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import "./InstallPrompt.css";

/* ─── Helpers ─────────────────────────────────────────── */
const STORAGE_KEY = "pwa_install_dismissed";

const isInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

/* ─── Component ───────────────────────────────────────── */
export default function InstallPrompt() {
  const { user } = useContext(AuthContext);

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible]             = useState(false);
  const [animOut, setAnimOut]             = useState(false);

  /* 1. Capture the browser's native install event */
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  /* 2. Show modal only when: user is logged in + not installed + not dismissed */
  useEffect(() => {
    if (!user)              return; // wait for login
    if (isInstalled())      return; // already installed
    if (!deferredPrompt)    return; // browser doesn't support / already installed
    if (localStorage.getItem(STORAGE_KEY)) return; // user dismissed before

    // Small delay so the page fully loads first
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, [user, deferredPrompt]);

  /* 3. Dismiss with exit animation */
  const dismiss = useCallback((persist = true) => {
    if (persist) localStorage.setItem(STORAGE_KEY, "1");
    setAnimOut(true);
    setTimeout(() => {
      setVisible(false);
      setAnimOut(false);
    }, 350);
  }, []);

  /* 4. Trigger native install */
  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      dismiss(false); // no need to persist — app is installed
    }
    // If dismissed by user inside the native dialog, keep our modal open or close quietly
    else {
      dismiss(true);
    }
  }, [deferredPrompt, dismiss]);

  /* Nothing to render */
  if (!visible) return null;

  return (
    <div
      className={`ip-backdrop${animOut ? " ip-backdrop--out" : ""}`}
      onClick={() => dismiss(true)}
      role="dialog"
      aria-modal="true"
      aria-label="تثبيت التطبيق"
    >
      {/* Stop click propagation so clicking inside the card doesn't close it */}
      <div
        className={`ip-card${animOut ? " ip-card--out" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close × */}
        <button
          className="ip-close"
          onClick={() => dismiss(true)}
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* Icon */}
        <div className="ip-icon-wrap">
          <img
            src="/pwa-192x192.png"
            alt="تفهنا ماركت"
            className="ip-icon"
            draggable="false"
          />
          <span className="ip-icon-ring" />
        </div>

        {/* Text */}
        <h2 className="ip-title">ثبّت تفهنا ماركت</h2>
        <p className="ip-desc">
          احصل على تجربة تسوق أسرع وأسهل — يعمل بدون إنترنت ويفتح مباشرةً من
          شاشتك الرئيسية مثل تطبيق حقيقي!
        </p>

        {/* Feature pills */}
        <ul className="ip-features">
          <li>⚡ سريع وخفيف</li>
          <li>📶 يعمل بدون نت</li>
          <li>🔔 إشعارات فورية</li>
        </ul>

        {/* Actions */}
        <div className="ip-actions">
          <button className="ip-btn ip-btn--install" onClick={handleInstall}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 16l-4-4m4 4l4-4m-4 4V4"/>
              <path d="M4 20h16"/>
            </svg>
            تثبيت التطبيق
          </button>
          <button className="ip-btn ip-btn--later" onClick={() => dismiss(true)}>
            ربما لاحقاً
          </button>
        </div>
      </div>
    </div>
  );
}
