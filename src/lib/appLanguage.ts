export type AppLanguage = "ja" | "en";

const STORAGE_KEY = "nanji_v2";

export function detectBrowserLanguage(): AppLanguage {
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ja")) {
    return "ja";
  }
  return "en";
}

export function readStoredLanguage(): AppLanguage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { settings?: { language?: string } };
    if (parsed.settings?.language === "ja") return "ja";
    if (parsed.settings?.language === "en") return "en";
  } catch {
    /* ignore */
  }
  return null;
}

export function getInitialLanguage(): AppLanguage {
  return readStoredLanguage() ?? detectBrowserLanguage();
}
