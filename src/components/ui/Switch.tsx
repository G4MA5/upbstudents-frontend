import { motion } from "framer-motion";
import { SPRING } from "../../lib/motion";

export function Switch({
  checked,
  onChange,
  label,
  className = "",
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`inline-flex items-center gap-3 rounded-full text-sm font-semibold text-ink-muted transition hover:text-ink ${className}`}
    >
      <span
        className={`relative flex h-7 w-12 items-center rounded-full border p-0.5 transition-colors ${
          checked ? "border-brand-500 bg-brand-500" : "border-line-strong bg-sunken"
        }`}
      >
        <motion.span
          layout
          transition={SPRING.snappy}
          className={`h-[22px] w-[22px] rounded-full bg-white shadow-raised ${checked ? "ml-auto" : ""}`}
        />
      </span>
      {label}
    </button>
  );
}
