import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { syncAppHeight } from "./lib/syncAppHeight";
import "./styles/global.css";
import "./i18n";
import App from "./App";

syncAppHeight();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
