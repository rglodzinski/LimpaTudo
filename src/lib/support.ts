// Voluntary support (docs/10-monetizacao.md). Everything here is a no-op in
// the Mac App Store build: Apple's guideline 3.1.1 forbids pointing to other
// payment methods, so `npm run dist:mas` sets VITE_DISTRIBUTION=mas.
import type { Settings } from "../../electron/types";

export const SUPPORT_ENABLED = import.meta.env.VITE_DISTRIBUTION !== "mas";

const SUPPORT_PAGES: Record<Settings["language"], string> = {
  "pt-BR": "https://glodzinski.dev.br/apoie.html",
  "en-US": "https://glodzinski.dev.br/en/support.html",
  es: "https://glodzinski.dev.br/es/apoyo.html",
};

export function supportUrl(language: Settings["language"] | undefined): string {
  return SUPPORT_PAGES[language ?? "en-US"] ?? SUPPORT_PAGES["en-US"];
}

const ONE_GB = 1024 ** 3;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether to show the support card under a cleanup result. All must hold:
 * the cleanup freed at least 1 GB, it is not the first successful cleanup,
 * the last ask was 60+ days ago, the card was ignored fewer than 3 times,
 * and the user never chose "don't show again".
 * `support` is the state *before* this cleanup was counted.
 */
export function shouldAskForSupport(
  support: Settings["support"] | undefined,
  freedBytes: number,
  now = Date.now(),
): boolean {
  if (!SUPPORT_ENABLED || !support) return false;
  if (freedBytes < ONE_GB) return false;
  if (support.successfulCleanups < 1) return false;
  if (support.dismissedForever || support.shownWithoutClick >= 3) return false;
  if (support.lastAskedAt && now - new Date(support.lastAskedAt).getTime() < 60 * DAY_MS) return false;
  return true;
}
