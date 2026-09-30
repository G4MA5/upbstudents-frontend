// Search bar shared by the home pages and the mobile documents page.
//  - with `onChange`: filters the current page live (debounced), like the
//    desktop search field, so every search behaves the same way;
//  - without: shows instant suggestions and Enter opens the results page.
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLibrary } from "../../context/DocumentsContext";
import { usePrefs } from "../../context/PrefsContext";
import { useOpenDocument } from "../../lib/hooks";
import { popover, SPRING } from "../../lib/motion";
import { scoreDocument, tokenize } from "../../lib/search";
import { DocCover } from "./DocCover";
import { Highlight } from "./Highlight";

const DEBOUNCE_MS = 200;

export function SearchBar({
  value,
  onChange,
  onFilters,
  showFilters = true,
  placeholder = "Rechercher une matière, une filière, une année…",
  filterCount = 0,
}: {
  /** Controlled mode (documents page): current query of the page. */
  value?: string;
  onChange?: (q: string) => void;
  onFilters?: () => void;
  showFilters?: boolean;
  placeholder?: string;
  filterCount?: number;
}) {
  const { documents } = useLibrary();
  const { pushSearch } = usePrefs();
  const navigate = useNavigate();
  const openDocument = useOpenDocument();
  const [q, setQ] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const blur = useRef<number | undefined>(undefined);
  const lastSent = useRef(value ?? "");
  const live = Boolean(onChange);

  // External change (filter reset, back button): follow it without ever
  // overwriting what is being typed.
  useEffect(() => {
    if (value !== undefined && value !== lastSent.current) {
      lastSent.current = value;
      setQ(value);
    }
  }, [value]);

  useEffect(() => {
    if (!onChange || q.trim() === lastSent.current) return;
    const t = window.setTimeout(() => {
      lastSent.current = q.trim();
      onChange(q.trim());
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [q, onChange]);

  useEffect(() => () => window.clearTimeout(blur.current), []);

  const tokens = useMemo(() => tokenize(q), [q]);
  const results = useMemo(
    () =>
      tokens.length && !live
        ? documents
            .map((doc) => ({ doc, s: scoreDocument(doc, tokens) }))
            .filter((r) => r.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 5)
            .map((r) => r.doc)
        : [],
    [documents, tokens, live],
  );
  const showList = open && !live && q.trim().length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!live && active >= 0 && results[active]) {
      choose(results[active].id);
      return;
    }
    setOpen(false);
    inputRef.current?.blur();
    if (query) pushSearch(query);
    if (onChange) {
      lastSent.current = query;
      onChange(query);
    } else {
      navigate(query ? `/documents?q=${encodeURIComponent(query)}` : "/documents");
    }
  };

  const choose = (id: number) => {
    setOpen(false);
    pushSearch(q);
    openDocument({ id });
  };

  const clear = () => {
    setQ("");
    setActive(-1);
    if (onChange) {
      lastSent.current = "";
      onChange("");
    }
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (showList) setOpen(false);
      else if (q) clear();
      return;
    }
    if (!showList || !results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    }
  };

  return (
    <div className="relative flex gap-3">
      <form role="search" onSubmit={submit} className="group relative flex-1">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-ink-faint transition-colors group-focus-within:text-ink-soft"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          enterKeyHint="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => (blur.current = window.setTimeout(() => setOpen(false), 150))}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Rechercher un document"
          role={live ? undefined : "combobox"}
          aria-expanded={live ? undefined : showList}
          aria-controls={live ? undefined : listId}
          aria-activedescendant={!live && active >= 0 && results[active] ? `${listId}-${results[active].id}` : undefined}
          autoComplete="off"
          className="field h-12 rounded-full pl-12 pr-11"
        />
        <AnimatePresence>
          {q && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={SPRING.pop}
              onClick={clear}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-line active:scale-90"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {showFilters && (
        <button
          type="button"
          onClick={onFilters ?? (() => navigate("/documents?filtres=1"))}
          aria-label={filterCount ? `Filtres (${filterCount} actif${filterCount > 1 ? "s" : ""})` : "Filtres"}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-line bg-card text-ink shadow-card transition active:scale-95"
        >
          <SlidersHorizontal className="h-5 w-5" />
          <AnimatePresence>
            {filterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={SPRING.pop}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-extrabold text-white ring-2 ring-card"
              >
                {filterCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      )}

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            aria-label="Suggestions"
            {...popover}
            onMouseDown={() => window.clearTimeout(blur.current)}
            onTouchStart={() => window.clearTimeout(blur.current)}
            className="absolute inset-x-0 top-full z-30 mt-2 origin-top rounded-2xl border border-line bg-elevated p-1.5 shadow-elevated"
          >
            {results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-muted">
                Aucune suggestion. Appuyez sur Entrée pour chercher « {q.trim()} ».
              </li>
            ) : (
              results.map((doc, i) => (
                <li key={doc.id} id={`${listId}-${doc.id}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    tabIndex={-1}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(doc.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors active:bg-sunken ${
                      i === active ? "bg-sunken" : ""
                    }`}
                  >
                    <DocCover doc={doc} size="xs" className="w-8 shrink-0 rounded" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">
                        <Highlight text={doc.title} tokens={tokens} />
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {[doc.type, doc.filiere, doc.niveau].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
