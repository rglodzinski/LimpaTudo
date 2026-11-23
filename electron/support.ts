import { shell } from "electron";
import type { Settings } from "./types";

/**
 * "Support the project…" in the tray and the app menu. Hidden in the Mac App
 * Store build (`process.mas`): guideline 3.1.1 forbids pointing to other
 * payment methods. Mirrors src/lib/support.ts — the main process can't
 * import renderer code. Never used by the monitor or its notifications.
 */
export const SUPPORT_ENABLED = !process.mas;

const SUPPORT_PAGES: Record<Settings["language"], string> = {
  "pt-BR": "https://glodzinski.dev.br/apoie.html",
  "en-US": "https://glodzinski.dev.br/en/support.html",
  es: "https://glodzinski.dev.br/es/apoyo.html",
};

export function openSupportPage(language: Settings["language"]): void {
  void shell.openExternal(SUPPORT_PAGES[language] ?? SUPPORT_PAGES["en-US"]);
}
