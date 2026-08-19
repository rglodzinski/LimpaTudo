import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import { Globe, Mail, X } from "lucide-react";
import { LogoMark } from "./LogoMark";
import { CHANGELOG } from "../lib/changelog";
import { buildPixPayload } from "../lib/pix";

const APP_WEBSITE = "https://limpatudo.app.br";
const CONTACT_EMAIL = "rglodzinski@gmail.com";
const PIX_KEY = "04765662900"; // CPF
const PIX_MERCHANT_NAME = "Ricardo Glodzinski";
const PIX_MERCHANT_CITY = "Florianopolis";

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

export function AboutModal({ open, onClose }: AboutModalProps) {
  const { t } = useTranslation();
  const [version, setVersion] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    window.limpaTudo.getAppVersion().then(setVersion);

    const payload = buildPixPayload({
      key: PIX_KEY,
      merchantName: PIX_MERCHANT_NAME,
      merchantCity: PIX_MERCHANT_CITY,
    });
    QRCode.toDataURL(payload, { width: 180, margin: 1 }).then(setQrDataUrl);
  }, [open]);

  function openExternal(url: string) {
    window.limpaTudo.openExternal(url);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-xl"
            style={{ maxHeight: "85vh" }}
          >
            <button
              onClick={onClose}
              aria-label={t("about.close")}
              className="absolute right-4 top-4 rounded-lg border border-border p-1.5 hover:border-accent"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center">
              <LogoMark className="h-16 w-16" />
              <h2 className="mt-3 text-lg font-bold">{t("about.title")}</h2>
              <p className="mt-1 text-sm text-text-muted">{t("about.tagline")}</p>
              {version && (
                <p className="mt-2 text-xs font-medium tabular-nums text-text-muted">
                  {t("about.version", { version })}
                </p>
              )}
              <p className="text-xs text-text-muted">{t("about.author")}</p>
            </div>

            <div className="mt-5 space-y-2 text-sm">
              <button
                onClick={() => openExternal(APP_WEBSITE)}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left hover:border-accent"
              >
                <Globe size={14} className="text-accent" />
                <span className="flex-1 truncate">{t("about.website")}</span>
                <span className="text-xs text-text-muted">limpatudo.app.br</span>
              </button>
              <button
                onClick={() => openExternal(`mailto:${CONTACT_EMAIL}`)}
                className="flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-left hover:border-accent"
              >
                <Mail size={14} className="text-accent" />
                <span className="flex-1 truncate">{t("about.email")}</span>
                <span className="text-xs text-text-muted">{CONTACT_EMAIL}</span>
              </button>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-surface-2 p-4 text-center">
              <p className="text-sm font-semibold">{t("about.donate.title")}</p>
              <p className="mt-1 text-xs text-text-muted">{t("about.donate.subtitle")}</p>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={t("about.donate.title")}
                  className="mx-auto mt-3 h-40 w-40 rounded-lg bg-white p-2"
                />
              )}
            </div>

            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("about.changelog.title")}
              </p>
              <ul className="space-y-3">
                {CHANGELOG.map((entry) => (
                  <li key={entry.version} className="rounded-lg border border-border p-3 text-left">
                    <p className="text-sm font-semibold">
                      v{entry.version} <span className="text-xs text-text-muted">— {entry.date}</span>
                    </p>
                    <ul className="mt-1 list-inside list-disc text-xs text-text-muted">
                      {entry.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
