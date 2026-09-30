// Global quick search (navbar button, "/" or Ctrl/⌘ + K).
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CornerDownLeft, FileText, Search } from "lucide-react";
import { useLibrary } from "../../context/DocumentsContext";
import { usePrefs } from "../../context/PrefsContext";
import { useOpenDocument } from "../../lib/hooks";
import { CATEGORIES, FILIERES } from "../../lib/constants";
import { scoreDocument, tokenize } from "../../lib/search";
import { Highlight } from "../documents/Highlight";
import { Skeleton } from "../ui/Feedback";
import { Modal } from "../ui/Modal";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { documents, status } = useLibrary();
  const navigate = useNavigate();
  const openDocument = useOpenDocument();
  const { pushSearch } = usePrefs();
  const openDoc = (id: number) => {
    onClose();
    if (query.trim()) pushSearch(query);
    openDocument({ id });
  };
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  const tokens = useMemo(() => tokenize(query), [query]);
  const results = useMemo(() => {
    if (!tokens.length) return [];
    return documents
      .map((doc) => ({ doc, score: scoreDocument(doc, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)
      .map((r) => r.doc);
  }, [documents, tokens]);

  const total = useMemo(
    () => (tokens.length ? documents.filter((d) => scoreDocument(d, tokens) > 0).length : 0),
    [documents, tokens],
  );

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  const seeAll = () => {
    pushSearch(query);
    go(`/documents?q=${encodeURIComponent(query.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (!query.trim()) return;
      if (active < results.length) openDoc(results[active].id);
      else seeAll();
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="lg" bare ariaLabel="Rechercher un document" initialFocusRef={inputRef}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3 pr-14 sm:px-6 sm:py-4">
          <Search className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            type="search"
            enterKeyHint="search"
            placeholder="Matière, filière, type, année…"
            aria-label="Rechercher un document"
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `search-result-${results[active].id}` : undefined}
            className="h-11 w-full min-w-0 bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none"
            autoComplete="off"
          />
        </div>

        <div id="search-results" role="listbox" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 sm:p-3">
          {!query.trim() ? (
            <div className="p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Accès rapide</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => go(`/documents?type=${encodeURIComponent(c.value)}`)}
                    className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-brand-500/40 hover:bg-accent-soft hover:text-accent"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-faint">Filières</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {FILIERES.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => go(`/documents?filiere=${encodeURIComponent(f)}`)}
                    className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-line hover:bg-sunken hover:text-accent"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          ) : status === "loading" ? (
            <div className="space-y-2 p-2" aria-label="Chargement…">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-semibold text-ink">Aucun résultat pour « {query.trim()} »</p>
              <p className="mt-1 text-sm text-ink-muted">
                Essayez un autre mot-clé, ou le nom de la filière (ex. MIAGE).
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {results.map((doc, i) => (
                <li key={doc.id}>
                  <button
                    id={`search-result-${doc.id}`}
                    role="option"
                    aria-selected={i === active}
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => openDoc(doc.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                      i === active ? "bg-accent-soft" : "hover:bg-canvas"
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sunken text-ink-muted">
                      <FileText className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-ink">
                        <Highlight text={doc.title} tokens={tokens} />
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {[doc.type, doc.filiere, doc.niveau, doc.annee].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {i === active && <CornerDownLeft className="hidden h-4 w-4 text-ink-faint sm:block" aria-hidden />}
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onMouseEnter={() => setActive(results.length)}
                  onClick={seeAll}
                  className={`mt-1 flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-accent transition ${
                    active === results.length ? "bg-accent-soft" : "hover:bg-canvas"
                  }`}
                >
                  Voir les {total} résultat{total > 1 ? "s" : ""}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              </li>
            </ul>
          )}
        </div>

        <div className="safe-bottom hidden shrink-0 items-center gap-4 border-t border-line bg-canvas px-6 py-2.5 text-xs text-ink-muted sm:flex">
          <span><kbd className="rounded border border-line bg-card px-1.5">↑</kbd> <kbd className="rounded border border-line bg-card px-1.5">↓</kbd> naviguer</span>
          <span><kbd className="rounded border border-line bg-card px-1.5">Entrée</kbd> ouvrir</span>
          <span><kbd className="rounded border border-line bg-card px-1.5">Échap</kbd> fermer</span>
        </div>
      </div>
    </Modal>
  );
}
