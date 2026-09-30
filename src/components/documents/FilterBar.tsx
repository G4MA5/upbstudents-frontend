import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Search, X } from "lucide-react";
import { ANNEES, CATEGORIES, FILIERES, NIVEAUX, SESSIONS, typeHasSession } from "../../lib/constants";
import { collapse, SPRING } from "../../lib/motion";
import { FiliereAvatar } from "../layout/RightRail";
import { Listbox } from "../ui/Listbox";

export interface Filters {
  q: string;
  type: string;
  filiere: string;
  niveau: string;
  annee: string;
  session: string;
  tri: string;
}

export const EMPTY_FILTERS: Filters = {
  q: "",
  type: "",
  filiere: "",
  niveau: "",
  annee: "",
  session: "",
  tri: "recent",
};

export type Counts = { type: Record<string, number>; filiere: Record<string, number>; total: number };
type OnChange = (patch: Partial<Filters>) => void;

/** Pill chip (mobile mockup: All · Recent · Pinned…). */
export function Chip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative inline-flex h-9 shrink-0 items-center rounded-full px-4 text-[13px] font-bold transition-[color,border-color,transform] active:scale-95 ${
        active ? "text-white" : "border border-line bg-card text-ink-soft hover:border-line-strong hover:text-ink"
      }`}
    >
      {active && (
        <motion.span
          className="absolute inset-0 rounded-full bg-brand-500 shadow-glow"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.snappy}
        />
      )}
      <span className="relative inline-flex items-center gap-1.5">
        {children}
        {count !== undefined && (
          <span className={`text-[11px] tabular-nums ${active ? "text-white/85" : "text-ink-faint"}`}>{count}</span>
        )}
      </span>
    </button>
  );
}

export function CategoryChips({ filters, onChange, counts }: { filters: Filters; onChange: OnChange; counts: Counts }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div className="flex gap-2" role="group" aria-label="Catégorie">
        <Chip active={!filters.type} onClick={() => onChange({ type: "" })} count={counts.total}>
          Tous
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip
            key={c.value}
            active={filters.type === c.value}
            onClick={() =>
              onChange({
                type: filters.type === c.value ? "" : c.value,
                ...(typeHasSession(c.value) ? {} : { session: "" }),
              })
            }
            count={counts.type[c.value] ?? 0}
          >
            {c.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function FiliereChips({ filters, onChange, counts }: { filters: Filters; onChange: OnChange; counts: Counts }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
      <div className="flex gap-2" role="group" aria-label="Filière">
        {FILIERES.map((f) => {
          const active = filters.filiere === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ filiere: active ? "" : f })}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-[13px] font-bold transition active:scale-95 ${
                active
                  ? "border-brand-500 bg-accent-soft text-accent"
                  : "border-line bg-card text-ink-soft hover:border-line-strong hover:text-ink"
              }`}
            >
              <FiliereAvatar filiere={f} size={30} />
              {f}
              <span className={`text-[11px] ${active ? "text-accent" : "text-ink-faint"}`}>{counts.filiere[f] ?? 0}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MiniSelect({
  label,
  clearLabel,
  value,
  options,
  onChange,
  disabled,
  title,
}: {
  label: string;
  clearLabel: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <div className="relative min-w-0 lg:w-[150px]" title={title}>
      <Listbox
        ariaLabel={label}
        placeholder={label}
        clearLabel={clearLabel}
        value={value}
        options={options}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

const SORTS = [
  { value: "recent", label: "Plus récents" },
  { value: "annee", label: "Année" },
  { value: "az", label: "Titre (A → Z)" },
];

export function SortSelect({ filters, onChange }: { filters: Filters; onChange: OnChange }) {
  const options = filters.q ? [...SORTS, { value: "pertinence", label: "Pertinence" }] : SORTS;
  return (
    <div className="relative min-w-0 lg:w-[170px]">
      <Listbox
        ariaLabel="Trier par"
        placeholder="Trier"
        value={filters.tri}
        options={options}
        onChange={(tri) => onChange({ tri })}
      />
    </div>
  );
}

export function SecondaryFilters({
  filters,
  onChange,
  className = "",
}: {
  filters: Filters;
  onChange: OnChange;
  className?: string;
}) {
  const sessionAllowed = typeHasSession(filters.type);
  return (
    <div className={className}>
      <MiniSelect label="Niveau" clearLabel="Tous les niveaux" value={filters.niveau} options={NIVEAUX} onChange={(v) => onChange({ niveau: v })} />
      <MiniSelect label="Année" clearLabel="Toutes les années" value={filters.annee} options={ANNEES} onChange={(v) => onChange({ annee: v })} />
      <MiniSelect
        label="Session"
        clearLabel="Toutes les sessions"
        value={filters.session}
        options={SESSIONS}
        onChange={(v) => onChange({ session: v })}
        disabled={!sessionAllowed}
        title={sessionAllowed ? undefined : "Les sessions concernent uniquement les examens"}
      />
    </div>
  );
}

/** Desktop search field, debounced, never overwriting what is being typed. */
export function SearchField({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const [query, setQuery] = useState(value);
  const lastSent = useRef(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (query === lastSent.current) return;
    const t = window.setTimeout(() => {
      lastSent.current = query;
      onChange(query);
    }, 200);
    return () => window.clearTimeout(t);
  }, [query, onChange]);

  return (
    <form
      role="search"
      className="group relative min-w-[260px] flex-1"
      onSubmit={(e) => {
        e.preventDefault();
        lastSent.current = query.trim();
        onChange(query.trim());
      }}
    >
      <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-ink-soft" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher une matière, un sujet, une année…"
        aria-label="Rechercher dans les documents"
        className="field h-11 rounded-full pl-11 pr-11"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            lastSent.current = "";
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-sunken active:scale-90"
          aria-label="Effacer la recherche"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}

export function ActiveFilters({ filters, onChange, onReset }: { filters: Filters; onChange: OnChange; onReset: () => void }) {
  const active: { key: keyof Filters; label: string }[] = [];
  if (filters.q) active.push({ key: "q", label: `« ${filters.q} »` });
  if (filters.type) active.push({ key: "type", label: CATEGORIES.find((c) => c.value === filters.type)?.label ?? filters.type });
  if (filters.filiere) active.push({ key: "filiere", label: filters.filiere });
  if (filters.niveau) active.push({ key: "niveau", label: filters.niveau });
  if (filters.annee) active.push({ key: "annee", label: filters.annee });
  if (filters.session) active.push({ key: "session", label: filters.session });

  return (
    <AnimatePresence initial={false}>
      {active.length > 0 && (
        <motion.div {...collapse} className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {active.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => onChange({ [f.key]: "" } as Partial<Filters>)}
                className="inline-flex items-center gap-1 rounded-full bg-sunken py-1 pl-3 pr-2 text-[13px] font-semibold text-ink-soft transition hover:bg-line"
                aria-label={`Retirer le filtre ${f.label}`}
              >
                {f.label}
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            ))}
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-bold text-accent transition hover:bg-accent-soft"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden />
              Tout réinitialiser
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function secondaryCount(f: Filters) {
  return [f.niveau, f.annee, f.session].filter(Boolean).length;
}
