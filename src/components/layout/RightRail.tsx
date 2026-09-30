// Desktop right column (mockup: Quick search · Top podcasters · Player).
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Heart, Play, Search, Shuffle, SkipBack, SkipForward } from "lucide-react";
// 160 px thumbnails (the originals weigh 637 KB for 22–56 px avatars).
import assriImg from "../../assets/filieres/assri.jpg";
import miageImg from "../../assets/filieres/miage.jpg";
import seaImg from "../../assets/filieres/sea.jpg";
import segImg from "../../assets/filieres/seg.jpg";
import sjapImg from "../../assets/filieres/sjap.jpg";
import threeEAImg from "../../assets/filieres/3ea.jpg";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/DocumentsContext";
import { usePrefs } from "../../context/PrefsContext";
import { useToast } from "../../context/ToastContext";
import { FILIERES } from "../../lib/constants";
import { downloadDocument } from "../../lib/files";
import { useOpenDocument } from "../../lib/hooks";
import { scoreDocument, tokenize } from "../../lib/search";
import type { LibraryDocument } from "../../types";
import { DocCover } from "../documents/DocCover";
import { Highlight } from "../documents/Highlight";
import { Skeleton } from "../ui/Feedback";
import { TRANSITION } from "../../lib/motion";

export const FILIERE_IMAGES: Record<string, string | undefined> = {
  MIAGE: miageImg,
  ASSRI: assriImg,
  SEA: seaImg,
  SEG: segImg,
  "3EA": threeEAImg,
  SJAP: sjapImg,
};

export function FiliereAvatar({ filiere, size = 44 }: { filiere: string; size?: number }) {
  const img = FILIERE_IMAGES[filiere];
  return img ? (
    <img
      src={img}
      alt=""
      loading="lazy"
      className="shrink-0 rounded-full bg-sunken object-cover ring-2 ring-card"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-extrabold text-white ring-2 ring-card"
      style={{ width: size, height: size }}
    >
      {filiere}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function QuickSearch() {
  const { documents } = useLibrary();
  const { pushSearch } = usePrefs();
  const navigate = useNavigate();
  const openDocument = useOpenDocument();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const blur = useRef<number | undefined>(undefined);

  const tokens = useMemo(() => tokenize(q), [q]);
  const results = useMemo(
    () =>
      tokens.length
        ? documents
            .map((doc) => ({ doc, s: scoreDocument(doc, tokens) }))
            .filter((r) => r.s > 0)
            .sort((a, b) => b.s - a.s)
            .slice(0, 5)
            .map((r) => r.doc)
        : [],
    [documents, tokens],
  );

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    pushSearch(value);
    setOpen(false);
    navigate(`/documents?q=${encodeURIComponent(value)}`);
  };

  return (
    <form role="search" onSubmit={submit} className="relative">
      <input
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => (blur.current = window.setTimeout(() => setOpen(false), 150))}
        placeholder="Tapez ici pour rechercher"
        aria-label="Recherche rapide"
        aria-controls={listId}
        autoComplete="off"
        className="field h-12 rounded-full pl-5 pr-14"
      />
      <button
        type="submit"
        aria-label="Lancer la recherche"
        className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brand-500 text-white shadow-glow transition hover:bg-brand-600"
      >
        <Search className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && q.trim() && (
          <motion.ul
            id={listId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            onMouseDown={() => window.clearTimeout(blur.current)}
            className="absolute inset-x-0 top-full z-20 mt-2 rounded-2xl border border-line bg-card p-1.5 shadow-elevated"
          >
            {results.length === 0 ? (
              <li className="px-3 py-3 text-sm text-ink-muted">Aucune suggestion. Appuyez sur Entrée.</li>
            ) : (
              results.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openDocument(doc);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-sunken"
                  >
                    <DocCover doc={doc} size="xs" className="w-7 shrink-0 rounded" />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-ink">
                        <Highlight text={doc.title} tokens={tokens} />
                      </span>
                      <span className="block truncate text-[11px] text-ink-muted">{doc.filiere} · {doc.type}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  );
}

/* ------------------------------------------------------------------ */

export function TopFilieres({ limit = 4 }: { limit?: number }) {
  const { documents, status } = useLibrary();
  const { profile } = useAuth();
  const [all, setAll] = useState(false);

  const list = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of documents) counts[d.filiere] = (counts[d.filiere] ?? 0) + 1;
    return [...FILIERES]
      .map((f) => ({ f, n: counts[f] ?? 0 }))
      .sort((a, b) => (b.f === profile?.filiere ? 1 : 0) - (a.f === profile?.filiere ? 1 : 0) || b.n - a.n);
  }, [documents, profile?.filiere]);

  const shown = all ? list : list.slice(0, limit);

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {shown.map(({ f, n }, i) => {
          const mine = f === profile?.filiere;
          return (
            <motion.li
              key={f}
              layout
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...TRANSITION.standard, delay: i * 0.04 }}
              className="flex items-center gap-3.5"
            >
              <FiliereAvatar filiere={f} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{f}</p>
                <p className="text-xs text-ink-muted">
                  {status === "loading" ? <Skeleton className="inline-block h-3 w-16 align-middle" /> : `${n} document${n > 1 ? "s" : ""}`}
                </p>
              </div>
              <Link
                to={`/documents?filiere=${encodeURIComponent(f)}`}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  mine
                    ? "bg-brand-500 text-white shadow-glow hover:bg-brand-600"
                    : "bg-accent-soft text-accent hover:bg-brand-500 hover:text-white"
                }`}
              >
                {mine ? "Ma filière" : "Explorer"}
              </Link>
            </motion.li>
          );
        })}
      </ul>
      {list.length > limit && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-4 text-xs font-bold text-ink-muted hover:text-accent">
          {all ? "Afficher moins" : `Voir les ${list.length} filières`}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function QuickPlayer() {
  const { documents, status } = useLibrary();
  const { recents, isFavorite, toggleFavorite } = usePrefs();
  const { requireAuth } = useAuth();
  const toast = useToast();
  const openDocument = useOpenDocument();

  // Queue: recently viewed documents first, then the latest additions.
  const queue = useMemo(() => {
    const byId = new Map(documents.map((d) => [d.id, d]));
    const recent = recents.map((id) => byId.get(id)).filter(Boolean) as LibraryDocument[];
    const latest = [...documents].sort((a, b) => b.id - a.id);
    const seen = new Set<number>();
    return [...recent, ...latest].filter((d) => !seen.has(d.id) && seen.add(d.id)).slice(0, 10);
  }, [documents, recents]);

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [recents[0]]); // eslint-disable-line react-hooks/exhaustive-deps

  const doc = queue[Math.min(index, queue.length - 1)];
  const total = queue.length;
  const pos = total > 1 ? index / (total - 1) : 1;
  const pad = (n: number) => String(n).padStart(2, "0");

  if (status === "loading" || !doc) {
    return <Skeleton className="h-[360px] rounded-3xl" />;
  }

  const fav = isFavorite(doc.id);
  const ctrl = "flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white disabled:opacity-40";

  return (
    <div className="overflow-hidden rounded-3xl bg-night text-white shadow-elevated">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="text-sm font-semibold text-white/70">Aperçu rapide</span>
        <button
          type="button"
          onClick={() => toggleFavorite(doc.id, doc.title)}
          aria-pressed={fav}
          aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
        >
          <Heart className={`h-4 w-4 ${fav ? "fill-brand-500 text-brand-500" : ""}`} />
        </button>
      </div>

      <div className="flex flex-col items-center px-5 pb-5 pt-3 text-center">
        <div className="relative h-36 w-36">
          <span className="absolute inset-0 rounded-full border border-white/10" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, rotate: -20, scale: 0.85 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 20, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="absolute inset-2 overflow-hidden rounded-full ring-4 ring-white/5"
            >
              <DocCover doc={doc} square size="sm" className="h-full w-full rounded-none shadow-none" />
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={doc.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <p className="mt-4 line-clamp-2 text-base font-bold leading-snug text-white">{doc.title}</p>
            <p className="mt-1 text-xs text-white/60">{[doc.type, doc.filiere, doc.niveau].filter(Boolean).join(" · ")}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex w-full items-center gap-3 text-[11px] font-semibold tabular-nums text-white/60">
          <span>{pad(index + 1)}</span>
          <div className="relative h-1 flex-1 rounded-full bg-white/15">
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-brand-500" animate={{ width: `${pos * 100}%` }} />
            <motion.span
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow"
              animate={{ left: `${pos * 100}%` }}
            />
          </div>
          <span>{pad(total)}</span>
        </div>
      </div>

      <div className="bg-brand-500 px-4 pb-3 pt-3.5">
        <div className="flex items-center justify-between">
          <button type="button" className={ctrl} aria-label="Document au hasard" onClick={() => setIndex(Math.floor(Math.random() * total))}>
            <Shuffle className="h-4 w-4" />
          </button>
          <button type="button" className={ctrl} aria-label="Document précédent" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
            <SkipBack className="h-[18px] w-[18px] fill-current" />
          </button>
          <button
            type="button"
            onClick={() => openDocument(doc)}
            aria-label={`Consulter : ${doc.title}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-raised transition hover:scale-105"
          >
            <Play className="h-5 w-5 translate-x-0.5 fill-current" />
          </button>
          <button type="button" className={ctrl} aria-label="Document suivant" disabled={index >= total - 1} onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}>
            <SkipForward className="h-[18px] w-[18px] fill-current" />
          </button>
          <button
            type="button"
            className={ctrl}
            aria-label="Télécharger"
            onClick={() =>
              requireAuth(() => {
                downloadDocument(doc);
                toast.success("Téléchargement lancé", doc.title);
              }, "Connectez-vous pour télécharger ce document.")
            }
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/80">Consulter</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function RightRail() {
  return (
    <aside
      className="sticky top-[var(--topbar-h)] hidden h-[calc(100vh-var(--topbar-h))] w-[var(--rail-w)] shrink-0 flex-col gap-8 overflow-y-auto border-l border-line bg-canvas px-6 py-7 scrollbar-thin xl:flex"
      aria-label="Raccourcis"
    >
      <section>
        <h2 className="eyebrow mb-4">Recherche rapide</h2>
        <QuickSearch />
      </section>
      <section>
        <h2 className="eyebrow mb-4">Filières</h2>
        <TopFilieres />
      </section>
      <section className="mt-auto">
        <QuickPlayer />
      </section>
    </aside>
  );
}
