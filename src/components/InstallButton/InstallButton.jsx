import { usePWA } from "../../context/PWAContext";
import "./InstallButton.css";

/**
 * InstallButton — visible to ALL users/roles as long as:
 *   • the app is not already installed, AND
 *   • the browser has not been confirmed as unsupported (iOS/Firefox).
 * Becomes fully clickable once beforeinstallprompt fires.
 *
 * Props:
 *   variant  "navbar" | "floating"   (default: "navbar")
 *   label    string                  (default: Arabic "ثبّت التطبيق")
 */
export default function InstallButton({
  variant = "navbar",
  label = "ثبّت التطبيق",
}) {
  const { isInstalled, isSupported, canInstall, triggerInstall } = usePWA();

  // Hide when already installed
  if (isInstalled) return null;
  // Hide on confirmed-unsupported browsers (iOS Safari, Firefox) after timeout
  if (isSupported === false) return null;

  return (
    <button
      className={`install-btn install-btn--${variant}${!canInstall ? " install-btn--pending" : ""}`}
      onClick={canInstall ? triggerInstall : undefined}
      aria-label="تثبيت التطبيق"
      title={canInstall ? "تثبيت التطبيق" : "جاري تحضير التثبيت…"}
      disabled={!canInstall}
    >
      <svg
        className="install-btn__icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 16l-4-4m4 4l4-4m-4 4V4" />
        <path d="M4 20h16" />
      </svg>
      <span className="install-btn__label">{label}</span>
    </button>
  );
}
