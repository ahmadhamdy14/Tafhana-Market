import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ─── Constants ─────────────────────────────── */
const KEY_INSTALLED = "pwa_installed";

const isRunningInstalled = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

/* ─── Context ───────────────────────────────── */
export const PWAContext = createContext(null);

export function PWAProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(
    () => isRunningInstalled() || !!localStorage.getItem(KEY_INSTALLED)
  );
  /**
   * null  = still waiting (< 15 s since mount)
   * true  = browser fired beforeinstallprompt → install supported
   * false = timed out → browser does not support PWA install (iOS, Firefox)
   */
  const [isSupported, setIsSupported] = useState(() => {
    if (isRunningInstalled()) return true;
    return null;
  });

  /* Capture the native browser event — fires only once per page load */
  useEffect(() => {
    const handler = (e) => {
      // Prevent the default browser mini-infobar prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsSupported(true);   // browser confirmed install support
      // If we receive the beforeinstallprompt event, it means the app is NOT currently installed
      setIsInstalled(false);
    };

    /* If browser signals the app was installed through other means */
    const onAppInstalled = () => {
      localStorage.setItem(KEY_INSTALLED, "1");
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onAppInstalled);

    // Initial check: if already in standalone mode, PWA is installed and supported
    if (isRunningInstalled()) {
      setIsInstalled(true);
      setIsSupported(true);
    }

    /* After 15 s with no event → browser doesn't support PWA install */
    const unsupportedTimer = setTimeout(() => {
      setIsSupported((prev) => {
        if (prev === null) {
          return isRunningInstalled() ? true : false;
        }
        return prev;
      });
    }, 15_000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onAppInstalled);
      clearTimeout(unsupportedTimer);
    };
  }, []);

  /* Trigger install and handle the user's choice */
  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`[PWA] Install prompt choice: ${outcome}`);

      if (outcome === "accepted") {
        localStorage.setItem(KEY_INSTALLED, "1");
        setIsInstalled(true);
      }

      // Always reset deferredPrompt after prompt is triggered to prevent reusing a spent event
      setDeferredPrompt(null);

      return outcome === "accepted";
    } catch (err) {
      console.error("[PWA] Failed to prompt PWA install:", err);
      setDeferredPrompt(null);
      return false;
    }
  }, [deferredPrompt]);

  const value = {
    /** true when the app is running installed OR user already installed it */
    isInstalled,
    /** null=unknown | true=supported | false=unsupported (iOS/Firefox) */
    isSupported,
    /** true when the native install prompt is ready to be triggered */
    canInstall: !!deferredPrompt && !isInstalled,
    /** call this to show the native install dialog */
    triggerInstall,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

/** Convenience hook */
export const usePWA = () => useContext(PWAContext);
