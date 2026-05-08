import { useState, useEffect, useCallback, useRef } from "react";
import { usePWA } from "../context/PWAContext";
import "./InstallPrompt.css";

/* ─── Constants ───────────────────────────────── */
const REMIND_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const INITIAL_DELAY_MS   = 2000;            // 2 s after page load
const KEY_LAST_DISMISSED = "pwa_last_dismissed";

/* ─── Helpers ─────────────────────────────────── */
const isReminderDue = () => {
  const last = parseInt(localStorage.getItem(KEY_LAST_DISMISSED) || "0", 10);
  return Date.now() - last >= REMIND_INTERVAL_MS;
};

const msUntilNextReminder = () => {
  const last = parseInt(localStorage.getItem(KEY_LAST_DISMISSED) || "0", 10);
  return Math.max(0, REMIND_INTERVAL_MS - (Date.now() - last));
};

/* ─── Component ───────────────────────────────── */
export default function InstallPrompt() {
  const { canInstall, triggerInstall } = usePWA();

  const [visible, setVisible] = useState(false);
  const [animOut, setAnimOut] = useState(false);

  const showTimerRef   = useRef(null);
  const repeatTimerRef = useRef(null);

  /* ── Schedule the first show once canInstall becomes true ── */
  useEffect(() => {
    if (!canInstall) return;

    const delay = isReminderDue()
      ? INITIAL_DELAY_MS
      : msUntilNextReminder() + INITIAL_DELAY_MS;

    showTimerRef.current = setTimeout(() => setVisible(true), delay);

    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(repeatTimerRef.current);
    };
  }, [canInstall]);

  /* ── Schedule the next reminder 30 min after a dismiss ── */
  const scheduleRepeat = useCallback(() => {
    clearTimeout(repeatTimerRef.current);
    repeatTimerRef.current = setTimeout(() => {
      if (canInstall) setVisible(true);
      scheduleRepeat();
    }, REMIND_INTERVAL_MS);
  }, [canInstall]);

  /* ── Dismiss: animate out, optionally save timestamp & reschedule ── */
  const dismiss = useCallback(
    (saveDismissTime = true) => {
      setAnimOut(true);
      setTimeout(() => {
        setVisible(false);
        setAnimOut(false);
        if (saveDismissTime) {
          localStorage.setItem(KEY_LAST_DISMISSED, String(Date.now()));
          scheduleRepeat();
        }
      }, 350);
    },
    [scheduleRepeat]
  );

  /* ── Install: delegate to PWAContext, dismiss cleanly on any outcome ── */
  const handleInstall = useCallback(async () => {
    const accepted = await triggerInstall();
    // If accepted, canInstall becomes false → prompt disappears automatically.
    // If cancelled, treat as a dismissal so the 30-min cycle restarts.
    if (!accepted) dismiss(true);
    else dismiss(false);
  }, [triggerInstall, dismiss]);

  /* ── Nothing to show ── */
  if (!visible || !canInstall) return null;

  return (
    <div
      className={`ip-backdrop${animOut ? " ip-backdrop--out" : ""}`}
      onClick={() => dismiss(true)}
      role="dialog"
      aria-modal="true"
      aria-label="install-dialog"
    >
      <div
        className={`ip-card${animOut ? " ip-card--out" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button className="ip-close" onClick={() => dismiss(true)} aria-label="close">
          &#x2715;
        </button>

        {/* Icon */}
        <div className="ip-icon-wrap">
          <img
            src="/pwa-192x192.png"
            alt="tafhana"
            className="ip-icon"
            draggable="false"
          />
          <span className="ip-icon-ring" />
        </div>

        {/* Copy */}
        <h2 className="ip-title">{"ثبّت تفهنا ماركت"}</h2>
        <p className="ip-desc">
          {"احصل على تجربة تسوق أسرع وأسهل — يعمل بدون إنترنت ويفتح مباشرةً من شاشتك الرئيسية مثل تطبيق حقيقي!"}
        </p>

        {/* Feature pills */}
        <ul className="ip-features">
          <li>{"⚡ سريع وخفيف"}</li>
          <li>{"📶 يعمل بدون نت"}</li>
          <li>{"🔔 إشعارات فورية"}</li>
        </ul>

        {/* Actions */}
        <div className="ip-actions">
          <button className="ip-btn ip-btn--install" onClick={handleInstall}>
            <svg
              width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2"
              strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M12 16l-4-4m4 4l4-4m-4 4V4" />
              <path d="M4 20h16" />
            </svg>
            {"تثبيت التطبيق"}
          </button>

          <button className="ip-btn ip-btn--later" onClick={() => dismiss(true)}>
            {"ربما لاحقاً"}
          </button>
        </div>
      </div>
    </div>
  );
}
