export type SlotTextColor = "light" | "dark";

export function defaultSlotTextColor(hour: number): SlotTextColor {
  if (hour >= 0 && hour <= 5) return "light";
  if (hour >= 6 && hour <= 17) return "dark";
  return "light";
}

export type BusinessSlotState = "active" | "inactive" | "offhour" | "none";

export function businessSlotState(
  hour: number,
  enabled: boolean,
  isNonBusinessDay = false,
): BusinessSlotState {
  if (!enabled) return "none";
  if (hour >= 9 && hour <= 16) return isNonBusinessDay ? "inactive" : "active";
  if ((hour >= 6 && hour <= 8) || (hour >= 17 && hour <= 21)) return "inactive";
  if (hour >= 22 || hour <= 5) return "offhour";
  return "none";
}
