import type { UserSettings } from "../store/types";

const MIN_DAYS = 3;
const MIN_ACTIONS = 3;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysSinceFirstOpen(firstOpenedAt: string, now = Date.now()): number {
  const opened = Date.parse(firstOpenedAt);
  if (Number.isNaN(opened)) return 0;
  return Math.floor((now - opened) / MS_PER_DAY);
}

/** Condition E: guide done + 3+ days + 3+ actions + still pending */
export function canAutoShowSurvey(settings: UserSettings, now = Date.now()): boolean {
  if (settings.surveyStatus !== "pending") return false;
  if (!settings.onboardingCompleted) return false;
  if (settings.contextualGuideStep < 4) return false;
  if (settings.usageActionCount < MIN_ACTIONS) return false;
  return daysSinceFirstOpen(settings.firstOpenedAt, now) >= MIN_DAYS;
}
