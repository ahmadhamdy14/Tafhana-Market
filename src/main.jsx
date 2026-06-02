import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ThemeProvider from "./context/ThemeContext";
import "./index.css";

import { registerSW } from "virtual:pwa-register";

// PWA Service Worker
registerSW({
  onNeedRefresh() {
    console.log("🔄 Update available");
  },
  onOfflineReady() {
    console.log("✅ App ready for offline use");
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);