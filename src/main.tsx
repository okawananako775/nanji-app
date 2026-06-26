import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { syncAppHeight } from "./lib/syncAppHeight";
import { applyAppLanguage } from "./lib/syncAppLanguage";
import { getInitialLanguage } from "./lib/appLanguage";
import "./styles/global.css";
import "./i18n";
import App from "./App";

syncAppHeight();
applyAppLanguage(getInitialLanguage());

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
