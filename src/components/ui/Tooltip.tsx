// Side tooltip rendered in a portal (never clipped by scrollable parents).
// Shown on hover and on keyboard focus.
import React, { cloneElement, useCallback, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { TRANSITION } from "../../lib/motion";

export function Tooltip({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }>;
  disabled?: boolean;
}) {
  const id = useId();
  const anchor = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = useCallback(() => {
    const r = anchor.current?.getBoundingClientRect();
    if (r) setPos({ top: r.top + r.height / 2, left: r.right + 12 });
  }, []);
  const hide = useCallback(() => setPos(null), []);

  if (disabled) return children;

  return (
    <span
      ref={anchor}
      className="block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {cloneElement(children, { "aria-describedby": pos ? id : undefined })}
      {createPortal(
        <AnimatePresence>
          {pos && (
            <motion.span
              id={id}
              role="tooltip"
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4, transition: TRANSITION.exit }}
              transition={TRANSITION.micro}
              style={{ top: pos.top, left: pos.left }}
              className="pointer-events-none fixed z-[400] -translate-y-1/2 whitespace-nowrap rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-bold text-white shadow-elevated"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </span>
  );
}
