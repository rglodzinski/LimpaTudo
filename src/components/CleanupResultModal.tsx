import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Heart } from "lucide-react";

export interface CleanupResult {
  /** "Freed: 3.2 GB" followed by any warnings (apps open, failures). */
  lines: string[];
  /** Show the voluntary support card under the result (see lib/support.ts). */
  askSupport: boolean;
}

interface CleanupResultModalProps {
  result: CleanupResult | null;
  /**
   * Called once when the modal closes. `supported` is true if the user clicked
   * "Support"; `dontAskAgain` mirrors the checkbox. Only meaningful when the
   * card was shown.
   */
  onClose: (outcome: { supported: boolean; dontAskAgain: boolean }) => void;
  onSupport: () => void;
}

/**
 * Result of a cleanup. Replaces the old alert(). The support card never
 * blocks: it closes with one click, has no countdown and offers
 * "don't show again" (docs/10-monetizacao.md, section 4).
 */
export function CleanupResultModal({ result, onClose, onSupport }: CleanupResultModalProps) {
  const { t } = useTranslation();
  const [dontAskAgain, setDontAskAgain] = useState(false);
  const [supported, setSupported] = useState(false);

  function close() {
    onClose({ supported, dontAskAgain });
    // Reset for the next result; the modal stays mounted between cleanups.
    setDontAskAgain(false);
    setSupported(false);
  }

  return (
    <AnimatePresence>
      {result && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-40 bg-black/40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cleanup-result-title"
            className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface p-6 shadow-xl"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-xl bg-accent-soft p-2 text-accent">
                <CheckCircle2 size={20} />
              </span>
              <h2 id="cleanup-result-title" className="text-lg font-bold">
                {result.lines[0]}
              </h2>
            </div>

            {result.lines.slice(1).map((line) => (
              <p key={line} className="mb-2 text-sm text-text-muted">
                {line}
              </p>
            ))}

            {result.askSupport && (
              <div className="mt-4 rounded-xl border border-border bg-surface-2 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Heart size={14} className="text-accent" />
                  {t("support.card.title")}
                </p>
                <p className="mt-1 text-sm text-text-muted">{t("support.card.body")}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setSupported(true);
                      onSupport();
                    }}
                    className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover"
                  >
                    {t("support.card.support")}
                  </button>
                  <label className="ml-auto flex items-center gap-2 text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={dontAskAgain}
                      onChange={(e) => setDontAskAgain(e.target.checked)}
                      className="h-3.5 w-3.5 accent-accent"
                    />
                    {t("support.card.dontAskAgain")}
                  </label>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={close}
                autoFocus
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface-2"
              >
                {result.askSupport ? t("support.card.notNow") : t("cleanupResult.ok")}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
