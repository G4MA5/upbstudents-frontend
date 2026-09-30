import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { collapse, fadeUp, SPRING, TRANSITION } from "../../lib/motion";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`relative block overflow-hidden rounded-lg bg-sunken before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent dark:before:via-white/[0.05] ${className}`}
    />
  );
}

type Tone = "neutral" | "brand" | "navy" | "success" | "warning" | "danger";

const BADGE_TONES: Record<Tone, string> = {
  neutral: "bg-sunken text-ink-soft",
  brand: "bg-accent-soft text-accent ring-1 ring-inset ring-brand-500/30",
  navy: "bg-secondary-soft text-secondary-text ring-1 ring-inset ring-secondary/15",
  success: "bg-emerald-500/10 text-emerald-700 ring-1 ring-inset ring-emerald-500/30 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-800 ring-1 ring-inset ring-amber-500/30 dark:text-amber-300",
  danger: "bg-red-500/10 text-red-700 ring-1 ring-inset ring-red-500/30 dark:text-red-400",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
  icon,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_TONES[tone]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}

type AlertTone = "success" | "error" | "warning" | "info";

const ALERT_STYLES: Record<AlertTone, { box: string; icon: React.ReactNode }> = {
  success: {
    box: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    icon: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" aria-hidden />,
  },
  error: {
    box: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    icon: <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden />,
  },
  warning: {
    box: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
    icon: <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" aria-hidden />,
  },
  info: {
    box: "border-secondary/15 bg-secondary-soft text-secondary-text",
    icon: <Info className="h-5 w-5 shrink-0 text-secondary-text" aria-hidden />,
  },
};

/** Inline, animated status message (announced to screen readers). */
export function Alert({
  tone,
  title,
  children,
  action,
}: {
  tone: AlertTone;
  title?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  const style = ALERT_STYLES[tone];
  return (
    <motion.div
      role={tone === "error" ? "alert" : "status"}
      initial={collapse.initial}
      // A short shake on errors, like a rejected passcode.
      animate={{ ...collapse.animate, x: tone === "error" ? [0, -6, 6, -3, 3, 0] : 0 }}
      exit={collapse.exit}
      transition={{ ...TRANSITION.standard, x: { duration: 0.36, ease: "easeOut" } }}
      className="overflow-hidden"
    >
      <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${style.box}`}>
        {style.icon}
        <div className="min-w-0 flex-1">
          {title && <p className="font-semibold">{title}</p>}
          {children && <div className={title ? "mt-0.5 opacity-90" : ""}>{children}</div>}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </motion.div>
  );
}

export function AnimatedAlert(props: Partial<React.ComponentProps<typeof Alert>> & { show: boolean }) {
  const { show, tone = "info", ...rest } = props;
  return <AnimatePresence initial={false}>{show && <Alert tone={tone} {...rest} />}</AnimatePresence>;
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      {...fadeUp}
      className={`flex flex-col items-center rounded-3xl border border-dashed border-line-strong bg-canvas px-6 py-14 text-center ${className}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-brand-600 shadow-card">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-bold">{title}</h3>
      {children && <div className="mt-2 max-w-md text-[15px] text-ink-muted">{children}</div>}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </motion.div>
  );
}

/** Animated check mark used for success screens. */
export function SuccessMark({ size = 72 }: { size?: number }) {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={SPRING.pop}
      className="flex items-center justify-center rounded-full bg-emerald-500/10 ring-8 ring-emerald-500/10"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 52 52" className="h-1/2 w-1/2 text-emerald-600">
        <motion.path
          d="M14 27 l8 8 l16 -18"
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ ...TRANSITION.large, delay: 0.12 }}
        />
      </svg>
    </motion.div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-sm text-ink-muted">
          <span>{label}</span>
          <span className="tabular-nums">{percent} %</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-sunken"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label={label}
      >
        <motion.div
          className="h-full rounded-full bg-brand-500"
          animate={{ width: `${percent}%` }}
          transition={TRANSITION.standard}
        />
      </div>
    </div>
  );
}
