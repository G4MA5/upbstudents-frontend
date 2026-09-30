// First-visit guidance: a small, dismissible card (never a blocking tour).
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Download, Eye, FilePlus2, Search, X } from "lucide-react";
import { SPRING, TRANSITION } from "../../lib/motion";
import { readStorage, writeStorage } from "../../lib/storage";

const KEY = "upb_bienvenue_vue";

const STEPS = [
  { icon: Search, text: "Recherchez par matière ou filtrez par filière et niveau." },
  { icon: Eye, text: "Consultez un document en ligne avant de le télécharger." },
  { icon: Download, text: "Téléchargez-le une fois connecté (compte gratuit)." },
  { icon: FilePlus2, text: "Proposez vos propres documents à la bibliothèque." },
];

export function WelcomeGuide() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (readStorage<boolean>(KEY)) return;
    // Appears after the page has settled, so it never competes with loading.
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const close = () => {
    setOpen(false);
    writeStorage(KEY, true);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="complementary"
          aria-label="Bienvenue"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24, transition: TRANSITION.exit }}
          transition={SPRING.smooth}
          className="fixed inset-x-3 z-40 mx-auto max-w-md rounded-3xl border border-line bg-card p-4 shadow-elevated sm:p-5 sm:inset-x-auto sm:right-6 [--wg-bottom:calc(var(--bottomnav-h)+12px)] lg:[--wg-bottom:24px] sm:mx-0 sm:w-[380px]"
          style={{ bottom: "calc(var(--wg-bottom, 12px) + env(safe-area-inset-bottom))" }}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-ink-muted hover:bg-sunken"
            aria-label="Fermer le message de bienvenue"
          >
            <X className="h-4 w-4" />
          </button>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Bienvenue</p>
          <p className="mt-1 pr-8 text-lg font-bold">Comment ça marche ?</p>
          <p className="mt-1.5 pr-4 text-sm text-ink-muted sm:hidden">
            Recherchez, consultez puis téléchargez les documents. Vous pouvez
            aussi proposer les vôtres.
          </p>
          <ol className="mt-3 hidden space-y-2.5 sm:block">
            {STEPS.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...TRANSITION.standard, delay: 0.15 + i * 0.05 }}
                className="flex items-start gap-3 text-sm text-ink-soft"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="pt-1">{text}</span>
              </motion.li>
            ))}
          </ol>
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                close();
                navigate("/documents");
              }}
              className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Explorer <span className="hidden xs:inline">les documents</span>
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={close}
              className="h-10 rounded-xl px-4 text-sm font-semibold text-ink-soft hover:bg-sunken"
            >
              Plus tard
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
