import type { LimpaTudoAPI } from "../electron/preload";

declare global {
  interface Window {
    limpaTudo: LimpaTudoAPI;
  }
}
