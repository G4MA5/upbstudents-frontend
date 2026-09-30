import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TRANSITION } from "../../lib/motion";

export function Logo({
  className = "",
  onClick,
  compact = false,
}: {
  className?: string;
  onClick?: () => void;
  /** Icon only (folded sidebar). */
  compact?: boolean;
}) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className={`group inline-flex items-center gap-2.5 rounded-xl ${className}`}
      aria-label="UpB Student's, retour à l'accueil"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 transition-transform duration-300 group-hover:-rotate-6">
        <img src="/logo5.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
      </span>
      <AnimatePresence initial={false}>
        {!compact && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6, transition: TRANSITION.exit }}
            transition={{ ...TRANSITION.standard, delay: 0.08 }}
            className="whitespace-nowrap text-[17px] font-extrabold tracking-tight text-secondary-text"
          >
            UpB <span className="text-brand-500">Student's</span>
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
