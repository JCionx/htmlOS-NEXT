import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Buffer } from "buffer"; // Keep only one of these
import "./index.css";
import App from "./App.tsx";

// Use (window as any) to bypass the missing property error on the window object
(window as any).Buffer = (window as any).Buffer || Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
