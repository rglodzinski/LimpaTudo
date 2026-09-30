import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import type { ScanProgress } from "../../electron/types";
import { CircularProgress } from "./CircularProgress";

interface RemovingOverlayProps {
  open: boolean;
  progress: ScanProgress;
  cancelling: boolean;
  onCancel: () => void;
}

/** Full-screen progress while items are removed — blocks the UI so it never looks frozen. */
export function RemovingOverlay({ open, progress, cancelling, onCancel }: RemovingOverlayProps) {
  const { t } = useTranslation();
  const percent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg/95 backdrop-blur-sm"
        >
          <CircularProgress percent={percent} />
          <div className="text-center">
            <p className="text-base font-semibold">{t("selection.cleaning")}</p>
            <p className="text-sm text-text-muted">
              {t("selection.cleaningProgress", {
                completed: Math.min(progress.completed + 1, progress.total),
                total: progress.total,
              })}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
            disabled={cancelling}
            className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold hover:border-risk-high disabled:opacity-60"
          >
            {cancelling ? t("selection.interrupting") : t("selection.interrupt")}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
