// Bell of the top bar: documents added since the last visit.
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import { useLibrary } from "../../context/DocumentsContext";
import { useOpenDocument } from "../../lib/hooks";
import { useUnseenDocuments } from "../../lib/useUnseenDocuments";
import { DocCover } from "../documents/DocCover";
import { dropdownMotion, useOutsideClose } from "./UserMenu";

export function Notifications() {
  const { documents } = useLibrary();
  const openDocument = useOpenDocument();
  const [open, setOpen] = useState(false);
  const { unseen, lastSeen, markSeen } = useUnseenDocuments();
  const ref = useOutsideClose(open, () => setOpen(false));

  const latest = useMemo(() => [...documents].sort((a, b) => b.id - a.id).slice(0, 6), [documents]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={unseen ? `Nouveautés : ${unseen} nouveau${unseen > 1 ? "x" : ""} document${unseen > 1 ? "s" : ""}` : "Nouveautés"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition hover:border-line-strong hover:text-ink"
      >
        <Bell className="h-[18px] w-[18px]" />
        <AnimatePresence>
          {unseen > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-card"
            >
              {unseen > 9 ? "9+" : unseen}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            {...dropdownMotion}
            className="absolute right-0 top-full z-50 mt-2 w-[340px] origin-top-right rounded-2xl border border-line bg-card p-2 shadow-elevated"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="eyebrow">Nouveautés</p>
              {unseen > 0 && (
                <button type="button" onClick={markSeen} className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> Tout marquer comme vu
                </button>
              )}
            </div>
            {latest.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-muted">Aucun document pour le moment.</p>
            ) : (
              <ul>
                {latest.map((doc) => {
                  const isNew = lastSeen !== null && doc.id > lastSeen;
                  return (
                    <li key={doc.id}>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpen(false);
                          openDocument(doc);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-sunken"
                      >
                        <DocCover doc={doc} size="xs" className="w-9 shrink-0 rounded" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink">{doc.title}</span>
                          <span className="block truncate text-xs text-ink-muted">
                            {[doc.type, doc.filiere, doc.niveau].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                        {isNew && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">Nouveau</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
