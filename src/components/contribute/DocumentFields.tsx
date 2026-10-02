import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { ANNEES, CATEGORIES, FILIERES, MENTIONS, NIVEAUX, NIVEAUX_MEMOIRE, SESSIONS, typeHasSession } from "../../lib/constants";
import type { DocumentMetadata } from "../../types";
import { FieldShell, Input, Select } from "../ui/Field";
import { TRANSITION, SPRING } from "../../lib/motion";

export type MetaErrors = Partial<Record<keyof DocumentMetadata, string>>;

export const EMPTY_META: DocumentMetadata = {
  filiere: "",
  type: "",
  annee: "",
  niveau: "",
  matiere: "",
  session: "",
  auteur: "",
  mention: "",
};

const GAP = 6;
const PANEL_MAX_H = 320;

function FiliereDropdown({
  value,
  onChange,
  error,
  singleSelect = false,
}: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  /** When true only one filière can be picked (e.g. Mémoire). */
  singleSelect?: boolean;
}) {
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number; maxHeight: number; placement: "bottom" | "top" } | null>(null);

  const selected = value ? value.split(/,\s*/).filter(Boolean) : [];
  const allSelected = selected.length === FILIERES.length;

  const place = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(Math.max(r.width, 220), vw - 16);
    const below = vh - r.bottom - GAP - 8;
    const above = r.top - GAP - 8;
    const wanted = Math.min(PANEL_MAX_H, FILIERES.length * 44 + 56);
    const placement = below < wanted && above > below ? "top" : "bottom";
    const maxHeight = Math.max(120, Math.min(PANEL_MAX_H, placement === "bottom" ? below : above));
    setPos({
      left: Math.min(Math.max(8, r.left), vw - width - 8),
      top: placement === "bottom" ? r.bottom + GAP : r.top - GAP,
      width,
      maxHeight,
      placement,
    });
  }, []);

  const openPanel = () => {
    place();
    setOpen(true);
  };

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(place); };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", update); window.removeEventListener("scroll", update, true); };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!buttonRef.current?.contains(t) && !panelRef.current?.contains(t)) close(false);
    };
    document.addEventListener("pointerdown", onPointer, true);
    return () => document.removeEventListener("pointerdown", onPointer, true);
  }, [open, close]);

  const toggle = (f: string) => {
    if (singleSelect) {
      // In single mode: select this filière and close immediately
      onChange(f);
      close();
      return;
    }
    let next: string[];
    if (selected.includes(f)) {
      next = selected.filter((item) => item !== f);
    } else {
      next = [...selected, f];
    }
    onChange(next.join(", "));
  };

  const toggleAll = () => {
    onChange(allSelected ? "" : [...FILIERES].join(", "));
  };

  const label =
    selected.length === 0
      ? undefined
      : selected.length === FILIERES.length
        ? "Toutes les filières"
        : selected.length === 1
          ? selected[0]
          : `${selected.length} filières (${selected.join(", ")})`;

  const hint =
    !singleSelect && selected.length > 1
      ? `Document commun à ${selected.length} filières : ${selected.join(", ")}`
      : undefined;

  return (
    <FieldShell
      id={id}
      label={singleSelect ? "Filière" : "Filière(s)"}
      error={error}
      hint={!error ? hint : undefined}
      className="sm:col-span-2"
    >
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error) || undefined}
        onClick={() => (open ? close() : openPanel())}
        className={`field relative inline-flex h-12 w-full items-center rounded-xl pl-3.5 pr-10 text-left${error ? " border-red-500" : ""}`}
      >
        <span className={`block min-w-0 flex-1 truncate ${label ? "" : "text-ink-faint"}`}>
          {label ?? (singleSelect ? "Choisir une filière…" : "Choisir une ou plusieurs filières…")}
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
            <motion.div
              ref={panelRef}
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
                zIndex: 300,
              }}
              className="overflow-y-auto overscroll-contain rounded-2xl border border-line bg-card p-1.5 shadow-elevated scrollbar-thin"
              onMouseDown={(e) => e.preventDefault()}
            >
              {/* Toggle-all header — hidden in single-select mode */}
              {!singleSelect && (
                <div className="flex items-center justify-between px-3 pb-1.5 pt-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Filières</span>
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="text-[11px] font-semibold text-accent hover:underline"
                  >
                    {allSelected ? "Tout décocher" : "Toutes (tronc commun)"}
                  </button>
                </div>
              )}
              {/* Options */}
              {[...FILIERES].map((f) => {
                const isChecked = selected.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggle(f)}
                    aria-pressed={isChecked}
                    className={`flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-[15px] font-medium transition-colors hover:bg-sunken lg:min-h-[40px] lg:text-sm ${
                      isChecked ? "text-accent" : "text-ink"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                        isChecked ? "border-brand-500 bg-brand-500" : "border-line-strong bg-canvas"
                      }`}
                    >
                      {isChecked && (
                        <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING.pop}>
                          <Check className="h-3 w-3 text-white" aria-hidden />
                        </motion.span>
                      )}
                    </span>
                    <span className="flex-1 truncate font-semibold">{f}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </FieldShell>
  );
}

export function validateMeta(m: DocumentMetadata): MetaErrors {
  const isLivre = m.type === "Livre";
  return {
    type: m.type ? "" : "Choisissez le type de document.",
    filiere: m.filiere?.trim() ? "" : "Choisissez la filière.",
    niveau: isLivre || m.niveau ? "" : "Choisissez le niveau.",
    annee: isLivre || m.annee ? "" : "Choisissez l'année.",
    matiere: m.matiere.trim()
      ? ""
      : m.type === "Mémoire"
        ? "Indiquez le titre du mémoire."
        : m.type === "Livre"
          ? "Indiquez le titre du livre."
          : m.type === "Cours"
            ? "Indiquez l'intitulé du cours."
            : "Indiquez la matière ou le titre.",
    auteur: m.type === "Mémoire" && !m.auteur?.trim()
      ? "Indiquez le nom et le(s) prénom(s) de l'auteur."
      : "",
  };
}

export function DocumentFields({
  value,
  onChange,
  errors,
}: {
  value: DocumentMetadata;
  onChange: (next: DocumentMetadata) => void;
  errors: MetaErrors;
}) {
  const set = (key: keyof DocumentMetadata) => (e: { target: { value: string } }) => {
    const next = { ...value, [key]: e.target.value };
    if (key === "type") {
      if (!typeHasSession(next.type)) next.session = "";
      if (next.type !== "Mémoire") next.mention = "";
      if (next.type === "Mémoire" && !NIVEAUX_MEMOIRE.includes(next.niveau as any)) {
        next.niveau = "";
      }
      // Livre doesn't use année / niveau / session — clear them on switch
      if (next.type === "Livre") {
        next.annee = "";
        next.niveau = "";
        next.session = "";
      }
      // Switching away from Mémoire: if filière was single, keep it; but clear multi if now single
      if (next.type === "Mémoire" && value.filiere.includes(",")) {
        next.filiere = "";
      }
    }
    onChange(next);
  };
  const sessionAllowed = typeHasSession(value.type);
  const isMemoire = value.type === "Mémoire";
  const isLivre = value.type === "Livre";
  const niveauOptions = isMemoire ? NIVEAUX_MEMOIRE : NIVEAUX;

  const titleLabel =
    value.type === "Mémoire"
      ? "Titre du mémoire"
      : value.type === "Livre"
        ? "Titre du livre"
        : value.type === "Cours"
          ? "Intitulé du cours / Matière"
          : "Matière";

  const titlePlaceholder =
    value.type === "Mémoire"
      ? "Ex. : Conception d'un système de gestion automatisé"
      : value.type === "Livre"
        ? "Titre de l'ouvrage"
        : value.type === "Cours"
          ? "Ex. : Algorithmique et structures de données"
          : "Ex. : Analyse numérique";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Select
        label="Type de document"
        placeholder="Choisir…"
        options={CATEGORIES.map((c) => ({ value: c.value, label: c.singular }))}
        value={value.type}
        onChange={set("type")}
        error={errors.type}
        wrapperClassName="sm:col-span-2"
      />
      <FiliereDropdown
        value={value.filiere}
        onChange={(filiere) => onChange({ ...value, filiere })}
        error={errors.filiere}
        singleSelect={isMemoire}
      />

      {isMemoire && (
        <Input
          label="Auteur (Nom et prénom(s))"
          placeholder="Ex. : KOUASSI Jean-Marc"
          value={value.auteur || ""}
          onChange={set("auteur")}
          error={errors.auteur}
          maxLength={120}
          wrapperClassName="sm:col-span-2"
        />
      )}

      <Input
        label={titleLabel}
        placeholder={titlePlaceholder}
        value={value.matiere}
        onChange={set("matiere")}
        error={errors.matiere}
        maxLength={120}
        wrapperClassName="sm:col-span-2"
      />

      {/* Niveau + Année + Session/Mention — masqués pour les Livres */}
      {!isLivre && (
        <>
          <Select
            label={isMemoire ? "Type de mémoire (Niveau)" : "Niveau"}
            placeholder="Choisir…"
            options={niveauOptions}
            value={value.niveau}
            onChange={set("niveau")}
            error={errors.niveau}
            hint={isMemoire ? "Précisez s'il s'agit d'un mémoire de Licence ou de Master" : undefined}
          />
          <Select label="Année" placeholder="Choisir…" options={ANNEES} value={value.annee} onChange={set("annee")} error={errors.annee} />

          {isMemoire ? (
            <Select
              label="Mention"
              placeholder="Choisir une mention (optionnel)…"
              options={MENTIONS}
              value={value.mention || ""}
              onChange={set("mention")}
              optional
              hint="Mention obtenue lors de la soutenance (optionnel)"
              wrapperClassName="sm:col-span-2"
            />
          ) : (
            <Select
              label="Session"
              placeholder={sessionAllowed ? "Choisir…" : "Sans objet"}
              options={SESSIONS}
              value={value.session}
              onChange={set("session")}
              disabled={!sessionAllowed}
              optional={sessionAllowed}
              hint={sessionAllowed ? undefined : "Uniquement pour les examens."}
              wrapperClassName="sm:col-span-2"
            />
          )}
        </>
      )}
    </div>
  );
}
