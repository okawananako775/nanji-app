import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { getInitialLanguage } from "../lib/appLanguage";
import en from "./en.json";
import ja from "./ja.json";

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
