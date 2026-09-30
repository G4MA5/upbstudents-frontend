import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useMediaQuery } from "../../lib/hooks";
import { SPRING, TRANSITION } from "../../lib/motion";

// ---------------------------------------------------------------------------
// Scroll lock shared by every open modal. `position: fixed` on <body> is the
// only approach that also works on older iOS Safari, where overflow: hidden
// does not stop the page from scrolling behind the modal.
let lockCount = 0;
let savedScrollY = 0;

function lockScroll() {
  if (lockCount++ > 0) return;
  savedScrollY = window.scrollY;
  const body = document.body;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  if (gap > 0) body.style.paddingRight = `${gap}px`;
}

function unlockScroll() {
  if (--lockCount > 0) return;
  const body = document.body;
  body.style.position = "";
  body.style.top = "";
  body.style.left = "";
  body.style.right = "";
  body.style.paddingRight = "";
  window.scrollTo(0, savedScrollY);
}

// Stack of open modals: Escape and focus trapping only apply to the topmost
// one (e.g. the login modal opened above a document preview).
const modalStack: symbol[] = [];
const isTopmost = (id: symbol) => modalStack[modalStack.length - 1] === id;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Size = "sm" | "md" | "lg" | "xl" | "full";

const SIZES: Record<Size, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-6xl",
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Accessible name when no visible title is rendered. */
  ariaLabel?: string;
  size?: Size;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Content handles its own padding / scrolling. */
  bare?: boolean;
  dismissible?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Takes the full available height (document preview): the frame keeps
   *  the same size whatever the content, e.g. between two documents. */
  fill?: boolean;
}

function ModalPanel({
  onClose,
  title,
  description,
  ariaLabel,
  size = "md",
  children,
  footer,
  bare,
  dismissible = true,
  initialFocusRef,
  fill = false,
}: Omit<ModalProps, "open">) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const stackId = Symbol("modal");
    modalStack.push(stackId);
    lockScroll();

    const focusTimer = window.setTimeout(() => {
      const target =
        initialFocusRef?.current ||
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ||
        panelRef.current;
      target?.focus({ preventScroll: true });
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (!isTopmost(stackId)) return;
      if (e.key === "Escape" && dismissible) {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === "Tab" && panelRef.current) {
        const items = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ).filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      modalStack.splice(modalStack.indexOf(stackId), 1);
      unlockScroll();
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [dismissible, initialFocusRef]);

  // Phones: bottom sheet that slides from the bottom edge and can be pulled
  // down by its handle. Larger screens: centered dialog that scales in.
  const sheet = !useMediaQuery("(min-width: 640px)");
  const drag = useDragControls();
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (dismissible && (info.offset.y > 120 || info.velocity.y > 600)) onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: TRANSITION.exit }}
        transition={TRANSITION.standard}
        onClick={() => dismissible && onClose()}
        aria-hidden
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        initial={sheet ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 8 }}
        animate={sheet ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
        exit={
          sheet
            ? { y: "100%", transition: { duration: 0.24, ease: TRANSITION.exit.ease } }
            : { opacity: 0, scale: 0.97, transition: TRANSITION.exit }
        }
        transition={SPRING.smooth}
        drag={sheet && dismissible ? "y" : false}
        dragControls={drag}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={onDragEnd}
        className={`${fill ? "modal-fill" : "modal-height"} relative flex w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-elevated outline-none sm:rounded-3xl ${SIZES[size]}`}
      >
        {/* Grab handle of the mobile sheet: pulling it down closes. */}
        <div
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing sm:hidden"
          onPointerDown={(e) => dismissible && drag.start(e)}
          aria-hidden
        >
          <span className="h-1.5 w-10 rounded-full bg-line-strong" />
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition hover:bg-sunken hover:text-ink active:scale-95 sm:right-4 sm:top-4"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {bare ? (
          children
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-8 sm:pb-8 sm:pt-8">
              {title && (
                <h2 id={titleId} className="pr-10 text-xl font-bold sm:text-2xl">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descId} className="mt-1.5 pr-6 text-[15px] text-ink-muted">
                  {description}
                </p>
              )}
              <div className={title || description ? "mt-6" : ""}>{children}</div>
            </div>
            {footer && (
              <div className="safe-bottom shrink-0 border-t border-line bg-canvas px-5 py-4 sm:px-8">
                {footer}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export function Modal({ open, ...props }: ModalProps) {
  return createPortal(
    <AnimatePresence>{open && <ModalPanel {...props} />}</AnimatePresence>,
    document.body,
  );
}
