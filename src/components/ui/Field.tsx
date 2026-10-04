import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { TRANSITION } from "../../lib/motion";
import { Listbox, type ListboxOptions } from "./Listbox";

// Visual states (rest, hover, focus, error) live in the ".field" class
// (index.css): no orange border on focus.
const CONTROL = "field rounded-xl";

interface FieldShellProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldShell({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className = "",
}: FieldShellProps) {
  return (
    <div className={`group flex w-full min-w-0 max-w-full flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={id}
        className="text-sm font-medium text-ink-soft transition-colors duration-200 group-focus-within:text-ink break-words max-w-full"
      >
        {label}
        {optional && (
          <span className="ml-1 font-normal text-ink-faint">(facultatif)</span>
        )}
      </label>
      {children}
      <AnimatePresence initial={false} mode="wait">
        {error ? (
          <motion.p
            key="error"
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: TRANSITION.exit }}
            transition={TRANSITION.micro}
            className="flex items-start gap-1.5 text-[13px] font-medium text-red-600 min-w-0 max-w-full break-words"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 break-words">{error}</span>
          </motion.p>
        ) : hint ? (
          <p key="hint" id={`${id}-hint`} className="text-[13px] text-ink-muted min-w-0 max-w-full break-words">
            {hint}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  icon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, optional, icon, wrapperClassName, className = "", id, ...rest },
    ref,
  ) => {
    const autoId = useId();
    const fieldId = id || autoId;
    return (
      <FieldShell
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        className={wrapperClassName}
      >
        <div className="relative w-full min-w-0 max-w-full">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint transition-colors duration-200 group-focus-within:text-ink-soft">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={`${CONTROL} h-12 px-3.5 w-full min-w-0 max-w-full ${icon ? "pl-10" : ""} ${className}`}
            {...rest}
          />
        </div>
      </FieldShell>
    );
  },
);
Input.displayName = "Input";

export const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, optional, wrapperClassName, id, ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id || autoId;
    const [visible, setVisible] = useState(false);
    return (
      <FieldShell
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        className={wrapperClassName}
      >
        <div className="relative w-full min-w-0 max-w-full">
          <input
            ref={ref}
            id={fieldId}
            type={visible ? "text" : "password"}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={`${CONTROL} h-12 pl-3.5 pr-12 w-full min-w-0 max-w-full`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted transition hover:bg-line hover:text-ink active:scale-90"
            aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            aria-pressed={visible}
          >
            {visible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>
      </FieldShell>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

interface SelectProps {
  label: string;
  options: ListboxOptions;
  value: string;
  /** Same shape as a native change event, so callers need no change. */
  onChange?: (e: { target: { value: string } }) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
  id?: string;
}

/** Form dropdown (custom listbox, styled and keyboard accessible). */
export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = "Choisir…",
  hint,
  error,
  optional,
  disabled,
  wrapperClassName,
  id,
}: SelectProps) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <FieldShell
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={wrapperClassName}
    >
      <Listbox
        id={fieldId}
        variant="field"
        value={value}
        onChange={(v) => onChange?.({ target: { value: v } })}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        invalid={Boolean(error)}
        ariaDescribedBy={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
      />
    </FieldShell>
  );
}
Select.displayName = "Select";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  wrapperClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, optional, wrapperClassName, id, ...rest }, ref) => {
    const autoId = useId();
    const fieldId = id || autoId;
    return (
      <FieldShell
        id={fieldId}
        label={label}
        hint={hint}
        error={error}
        optional={optional}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          className={`${CONTROL} min-h-[120px] resize-y px-3.5 py-3 w-full min-w-0 max-w-full`}
          {...rest}
        />
      </FieldShell>
    );
  },
);
Textarea.displayName = "Textarea";

/** Invisible anti-bot field (humans never see nor fill it). */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Site web
        <input
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}
