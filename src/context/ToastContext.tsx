import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  XCircle,
} from "lucide-react";
import { SPRING, TRANSITION } from "../lib/motion";

export type ToastKind = "success" | "error" | "warning" | "info" | "loading";

interface ToastData {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  duration: number;
}

type ToastInput = Partial<Omit<ToastData, "id">> & { title: string };

interface ToastApi {
  show: (t: ToastInput) => number;
  update: (id: number, t: Partial<ToastInput>) => void;
  dismiss: (id: number) => void;
  success: (title: string, message?: string) => number;
  error: (title: string, message?: string) => number;
  warning: (title: string, message?: string) => number;
  info: (title: string, message?: string) => number;
  loading: (title: string, message?: string) => number;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 4500,
  info: 5000,
  warning: 6500,
  error: 7000,
  loading: 0,
};

const STYLES: Record<ToastKind, { icon: React.ReactNode; accent: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />,
    accent: "bg-emerald-500",
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-600" aria-hidden />,
    accent: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />,
    accent: "bg-amber-500",
  },
  info: {
    icon: <Info className="h-5 w-5 text-secondary-text" aria-hidden />,
    accent: "bg-secondary",
  },
  loading: {
    icon: (
      <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden />
    ),
    accent: "bg-brand-500",
  },
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(toast.duration);
  const startedAt = useRef(Date.now());

  // Restart the countdown whenever the toast changes (e.g. loading → success).
  useEffect(() => {
    remaining.current = toast.duration;
  }, [toast.duration, toast.kind, toast.title]);

  useEffect(() => {
    if (!toast.duration || paused) return;
    startedAt.current = Date.now();
    const timer = window.setTimeout(
      () => onDismiss(toast.id),
      remaining.current,
    );
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [paused, toast.duration, toast.id, toast.kind, toast.title, onDismiss]);

  const style = STYLES[toast.kind];
  const assertive = toast.kind === "error";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: TRANSITION.exit }}
      transition={SPRING.smooth}
      // Swipe sideways to dismiss (touch and mouse).
      drag={toast.kind === "loading" ? false : "x"}
      dragSnapToOrigin
      dragElastic={0.5}
      onDragStart={() => setPaused(true)}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onDismiss(toast.id);
        else setPaused(false);
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      className="pointer-events-auto relative flex w-full touch-pan-y items-start gap-3 overflow-hidden rounded-2xl border border-line bg-elevated p-4 pr-10 shadow-elevated sm:w-96"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
      <span className="mt-0.5 shrink-0">{style.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{toast.title}</p>
        {toast.message && (
          <p className="mt-0.5 text-sm leading-snug text-ink-muted">
            {toast.message}
          </p>
        )}
      </div>
      {toast.kind !== "loading" && (
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="absolute right-2 top-2 rounded-lg p-1.5 text-ink-faint transition hover:bg-sunken hover:text-ink"
          aria-label="Fermer la notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {toast.duration > 0 && (
        <span
          key={`${toast.kind}-${toast.title}`}
          aria-hidden
          className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${style.accent} opacity-40`}
          style={{
            animation: `toast-progress ${toast.duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      )}
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current++;
    const kind = input.kind ?? "info";
    const toast: ToastData = {
      id,
      kind,
      title: input.title,
      message: input.message,
      duration: input.duration ?? DEFAULT_DURATION[kind],
    };
    // Same message already visible: do not stack duplicates.
    setToasts((list) => [
      ...list
        .filter((t) => !(t.title === toast.title && t.message === toast.message))
        .slice(-3),
      toast,
    ]);
    return id;
  }, []);

  const update = useCallback((id: number, input: Partial<ToastInput>) => {
    setToasts((list) =>
      list.map((t) => {
        if (t.id !== id) return t;
        const kind = input.kind ?? t.kind;
        return {
          ...t,
          ...input,
          kind,
          message: "message" in input ? input.message : t.message,
          duration: input.duration ?? DEFAULT_DURATION[kind],
        } as ToastData;
      }),
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      update,
      dismiss,
      success: (title, message) => show({ kind: "success", title, message }),
      error: (title, message) => show({ kind: "error", title, message }),
      warning: (title, message) => show({ kind: "warning", title, message }),
      info: (title, message) => show({ kind: "info", title, message }),
      loading: (title, message) => show({ kind: "loading", title, message }),
    }),
    [show, update, dismiss],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 px-3 pb-[calc(env(safe-area-inset-bottom)+var(--bottomnav-h)+12px)] sm:inset-x-auto sm:right-4 sm:items-end lg:pb-6"
          aria-label="Notifications"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
            ))}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
