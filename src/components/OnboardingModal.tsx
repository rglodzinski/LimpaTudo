import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing } from "lucide-react";
import type { NotificationFrequency } from "../../electron/types";
import { FREQUENCIES } from "../lib/monitor";

interface OnboardingModalProps {
  open: boolean;
  /** Called with the user's answer; `enabled: false` means "not now". */
  onDecide: (choice: {
    enabled: boolean;
    launchAtLogin: boolean;
    notificationFrequency: NotificationFrequency;
  }) => void;
}

export function OnboardingModal({ open, onDecide }: OnboardingModalProps) {
  const { t } = useTranslation();
  const [launchAtLogin, setLaunchAtLogin] = useState(true);
  const [frequency, setFrequency] = useState<NotificationFrequency>("weekly");

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,32rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-xl bg-accent-soft p-2 text-accent">
                <BellRing size={20} />
              </span>
              <h2 className="text-lg font-bold">{t("onboarding.title")}</h2>
            </div>

            <p className="mb-5 text-sm text-text-muted">{t("onboarding.body")}</p>

            <label className="mb-3 flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
              <input
                type="checkbox"
                checked={launchAtLogin}
                onChange={(e) => setLaunchAtLogin(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              {t("onboarding.launchAtLogin")}
            </label>

            <label className="mb-6 block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                {t("onboarding.frequency")}
              </span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as NotificationFrequency)}
                className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm"
              >
                {FREQUENCIES.map((value) => (
                  <option key={value} value={value}>
                    {t(`frequency.${value}`)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() =>
                  onDecide({ enabled: false, launchAtLogin: false, notificationFrequency: frequency })
                }
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                {t("onboarding.skip")}
              </button>
              <button
                onClick={() =>
                  onDecide({ enabled: true, launchAtLogin, notificationFrequency: frequency })
                }
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
              >
                {t("onboarding.enable")}
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-text-muted">{t("onboarding.later")}</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
