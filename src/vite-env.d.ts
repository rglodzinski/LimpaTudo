/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_WEBSITE?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_PIX_KEY?: string;
  readonly VITE_PIX_MERCHANT_NAME?: string;
  readonly VITE_PIX_MERCHANT_CITY?: string;
  /** "mas" in the Mac App Store build: hides every donation surface. */
  readonly VITE_DISTRIBUTION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
