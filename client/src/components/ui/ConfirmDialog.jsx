import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button.jsx";

export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", danger = false, loading = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="w-full max-w-sm rounded-card border border-border bg-surface p-5 shadow-card"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-text">{title}</h3>
            {description && <p className="mt-1.5 text-sm text-text-2">{description}</p>}
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
