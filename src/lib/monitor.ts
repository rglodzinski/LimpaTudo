import type { NotificationFrequency } from "../../electron/types";

/** Order shown in every frequency picker (tray menu mirrors this). */
export const FREQUENCIES: NotificationFrequency[] = [
  "never",
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

export const GIB = 1024 * 1024 * 1024;
