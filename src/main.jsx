import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

if (window.location.hostname === "127.0.0.1") {
  window.location.replace(
    `${window.location.protocol}//localhost:${window.location.port}${window.location.pathname}${window.location.search}${window.location.hash}`
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
