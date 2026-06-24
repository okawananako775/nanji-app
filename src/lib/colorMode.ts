import type { UserSettings } from "../store/types";

export type ResolvedColorMode = "light" | "dark";

export function resolveColorMode(mode: UserSettings["colorMode"]): ResolvedColorMode {
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return mode;
}

export function applyColorMode(mode: UserSettings["colorMode"]) {
  document.documentElement.dataset.theme = resolveColorMode(mode);
}
