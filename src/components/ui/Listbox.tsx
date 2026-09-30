// Custom dropdown replacing the native <select> (whose popup cannot be
// styled). Follows the ARIA "select-only combobox" pattern: focus stays on
// the button, options are announced through aria-activedescendant.
//   Keyboard: ↑ ↓ Home End · Enter/Space to choose · Esc/Tab to close ·
//   typing letters jumps to the matching option.
import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { SPRING, TRANSITION } from "../../lib/motion";

export interface ListboxOption {
  value: string;
  label: string;
}

export type ListboxOptions = readonly string[] | readonly ListboxOption[];

export function normalizeOptions(options: ListboxOptions): ListboxOption[] {
  return (options as readonly (string | ListboxOption)[]).map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
}

interface ListboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ListboxOptions;
  /** Text shown when no value is selected. */
  placeholder: string;
  /** Adds a first option that resets the value (e.g. "Toutes les années"). */
  clearLabel?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  invalid?: boolean;
  /** "pill": filter bar · "field": form input. */
  variant?: "pill" | "field";
  title?: string;
  className?: string;
}

const PANEL_MAX_H = 288;
const GAP = 8;

interface Position {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  placement: "bottom" | "top";
}

export function Listbox({
  value,
  onChange,
  options,
  placeholder,
  clearLabel,
  disabled,
  id,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  invalid,
  variant = "pill",
  title,
  className = "",
}: ListboxProps) {
  const autoId = useId();
  const buttonId = id || `${autoId}-button`;
  const listId = `${autoId}-list`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", timer: 0 });

  const items: ListboxOption[] = [
    ...(clearLabel ? [{ value: "", label: clearLabel }] : []),
    ...normalizeOptions(options),
  ];
  const selected = items.find((o) => o.value === value && o.value !== "");
  const selectedIndex = Math.max(0, items.findIndex((o) => o.value === value));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selectedIndex);
  const [pos, setPos] = useState<Position | null>(null);

  const place = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(r.width, 200), vw - 16);
    const below = vh - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const wanted = Math.min(PANEL_MAX_H, items.length * 44 + 12);
    const placement = below < wanted && above > below ? "top" : "bottom";
    const maxHeight = Math.max(120, Math.min(PANEL_MAX_H, placement === "bottom" ? below : above));
    setPos({
      left: Math.min(Math.max(8, r.left), vw - width - 8),
      top: placement === "bottom" ? r.bottom + GAP : r.top - GAP,
      width,
      maxHeight,
      placement,
    });
  }, [items.length]);

  const openList = (index = selectedIndex) => {
    if (disabled) return;
    place();
    setActive(index);
    setOpen(true);
  };

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  const choose = (index: number) => {
    const item = items[index];
    if (!item) return;
    onChange(item.value);
    close();
  };

  // Follow the button while the page scrolls or resizes.
  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, place]);

  // Close on outside click / tap.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !listRef.current?.contains(t)) close(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [open, close]);

  // Keep the highlighted option visible.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    const last = items.length - 1;

    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList(e.key === "ArrowUp" ? Math.max(0, selectedIndex - 1) : selectedIndex);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        return;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        return;
      case "Home":
        e.preventDefault();
        setActive(0);
        return;
      case "End":
        e.preventDefault();
        setActive(last);
        return;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        return;
      case "Escape":
        // Stops here so an enclosing modal does not close too.
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      case "Tab":
        close(false);
        return;
    }

    // Typeahead: jump to the first option starting with the typed text.
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const t = typeahead.current;
      window.clearTimeout(t.timer);
      t.text += e.key.toLowerCase();
      t.timer = window.setTimeout(() => (t.text = ""), 600);
      const found = items.findIndex((o) => o.label.toLowerCase().startsWith(t.text));
      if (found !== -1) setActive(found);
    }
  };

  // Focus / open / error / filled states come from the ".field" class.
  const base =
    variant === "field"
      ? "h-12 rounded-xl pl-3.5 pr-10 text-left"
      : "h-10 rounded-full pl-4 pr-10 text-left text-[15px] font-semibold text-ink-soft lg:text-[13px]";
  // A filter with a value keeps a light tint (sort menus, which always have
  // a value, stay neutral).
  const filled = variant === "pill" && Boolean(clearLabel) && value !== "";

  return (
    <>
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        data-filled={filled || undefined}
        disabled={disabled}
        title={title}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`field relative inline-flex items-center ${base} ${className}`}
      >
        <span className={`block min-w-0 flex-1 truncate ${selected ? "" : variant === "field" ? "text-ink-faint" : ""}`}>
          {selected ? selected.label : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={TRANSITION.standard}
          className="pointer-events-none absolute right-3.5 top-1/2 -mt-2 flex h-4 w-4 items-center justify-center opacity-60"
          aria-hidden
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      {createPortal(
        <AnimatePresence>
          {open && pos && (
            <motion.ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-labelledby={ariaLabelledBy ?? buttonId}
              tabIndex={-1}
              initial={{ opacity: 0, y: pos.placement === "bottom" ? -6 : 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: pos.placement === "bottom" ? -4 : 4, scale: 0.98, transition: TRANSITION.exit }}
              transition={TRANSITION.standard}
              style={{
                position: "fixed",
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxHeight,
                ...(pos.placement === "bottom" ? { top: pos.top } : { bottom: window.innerHeight - pos.top }),
                transformOrigin: pos.placement === "bottom" ? "top center" : "bottom center",
              }}
              className="z-[300] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-card p-1.5 shadow-elevated scrollbar-thin"
              onMouseDown={(e) => e.preventDefault() /* keep focus on the button */}
            >
              {items.map((o, i) => {
                const isSelected = o.value === value && (o.value !== "" || !value);
                const isActive = i === active;
                const isClear = clearLabel && i === 0;
                return (
                  <li
                    key={`${o.value}-${i}`}
                    id={`${listId}-${i}`}
                    data-index={i}
                    role="option"
                    aria-selected={isSelected}
                    onMouseMove={() => setActive(i)}
                    onClick={() => choose(i)}
                    className={`flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3 text-[15px] transition-colors lg:min-h-[40px] lg:text-sm ${
                      isActive ? "bg-sunken" : ""
                    } ${isSelected ? "font-bold text-accent" : isClear ? "font-medium text-ink-muted" : "font-medium text-ink"}`}
                  >
                    <span className="min-w-0 flex-1 truncate">{o.label}</span>
                    {isSelected && (
                      <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop}>
                        <Check className="h-4 w-4 text-brand-500" aria-hidden />
                      </motion.span>
                    )}
                  </li>
                );
              })}
            </motion.ul>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
