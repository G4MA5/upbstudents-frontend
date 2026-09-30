import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import { collapse } from "../../lib/motion";
import { readStorage, writeStorage } from "../../lib/storage";

const KEY = "upb_tips_vus";

function seen(): string[] {
  return readStorage<string[]>(KEY) ?? [];
}

/** Contextual hint shown until the user dismisses it (remembered). */
export function TipBanner({ id, title, message }: { id: string; title: string; message: string }) {
  const [visible, setVisible] = useState(() => !seen().includes(id));

  const dismiss = () => {
    setVisible(false);
    writeStorage(KEY, [...new Set([...seen(), id])]);
  };

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div {...collapse} className="overflow-hidden">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-brand-500/30 bg-accent-soft p-4 pr-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-card text-accent shadow-card">
              <Lightbulb className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-accent">{title}</p>
              <p className="mt-0.5 text-ink-soft">{message}</p>
            </div>
            <button
              type="button"
              onClick={dismiss}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-accent transition hover:bg-brand-500/15"
              aria-label="Masquer l'astuce"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
