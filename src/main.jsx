import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ThemeProvider from "./context/ThemeContext";
import "./index.css";

import { registerSW } from "virtual:pwa-register";
import { toast } from "react-toastify";

// PWA Service Worker with manual update prompt
const updateSW = registerSW({
  onNeedRefresh() {
    toast.info(
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <span style={{ fontWeight: "600", fontSize: "14px" }}>
          🔄 يتوفر تحديث جديد للتطبيق!
        </span>
        <button
          onClick={() => {
            updateSW(true);
          }}
          style={{
            background: "#16a34a",
            color: "#ffffff",
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            alignSelf: "flex-end",
            boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
            transition: "background 0.2s",
          }}
        >
          تحديث الآن
        </button>
      </div>,
      {
        position: "bottom-left",
        autoClose: false,
        closeOnClick: false,
        closeButton: true,
        draggable: false,
        theme: "colored",
        style: {
          direction: "rtl",
          fontFamily: "inherit",
        }
      }
    );
  },
  onOfflineReady() {
    toast.success("✅ التطبيق جاهز للعمل بدون اتصال بالإنترنت!", {
      position: "bottom-left",
      autoClose: 4000,
      style: {
        direction: "rtl",
        fontFamily: "inherit",
      }
    });
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);