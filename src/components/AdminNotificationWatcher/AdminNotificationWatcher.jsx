import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { listenToNewOrders } from "../../services/orderService";
import { toast } from "react-toastify";

const AdminNotificationWatcher = () => {
  const { user, userData } = useContext(AuthContext);
  const audioRef = useRef(null);

  // Initialize and preload audio
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/notification.wav");
      audioRef.current.preload = "auto";
      audioRef.current.volume = 0.9;
    }

    // Unlock browser autoplay policy on first user interaction anywhere
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current.load();
      }
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  // Listen to new incoming orders whenever the user is an admin
  useEffect(() => {
    if (!user || userData?.role !== "admin") return;

    const unsubscribe = listenToNewOrders((order) => {
      // 🔔 Play notification sound
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio("/notification.wav");
          audioRef.current.volume = 0.9;
        }
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Audio autoplay blocked by browser:", err);
          });
        }
      } catch (err) {
        console.error("Audio error:", err);
      }

      // 🔔 Show toast alert across any page
      const customerName = order.customer?.firstName
        ? ` من ${order.customer.firstName}`
        : "";
      toast.info(`🔔 طلب جديد وصل${customerName}!`, {
        position: "top-left",
        autoClose: 6000,
        style: { fontWeight: "bold", fontSize: "16px" },
      });
    });

    return () => unsubscribe();
  }, [user, userData]);

  return null;
};

export default AdminNotificationWatcher;
