import i18n from "../i18n";
import type { AppLanguage } from "./appLanguage";

export function applyAppLanguage(language: AppLanguage): void {
  document.documentElement.lang = language;
  if (i18n.language !== language) {
    void i18n.changeLanguage(language);
  }
}
