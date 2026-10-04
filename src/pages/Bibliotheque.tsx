// Library (mobile mockup "My Bookmarks"): favourites, history, collections.
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FilePlus2, Heart, History, LogIn, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { DocCover } from "../components/documents/DocCover";
import { CoverGridSkeleton, CoverTile, RowCard } from "../components/documents/DocumentCard";
import { Chip } from "../components/documents/FilterBar";
import { FiliereAvatar } from "../components/layout/RightRail";
import { dropdownMotion, useOutsideClose } from "../components/layout/UserMenu";
import { Button, ButtonLink } from "../components/ui/Button";
import { Alert, EmptyState } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/DocumentsContext";
import { usePrefs } from "../context/PrefsContext";
import { useIsDesktop, useOpenDocument } from "../lib/hooks";
import { fadeUp, listItem } from "../lib/motion";
import { registerPreviewSequence } from "../lib/previewSequence";
import { useSeoHead } from "../lib/useSeoHead";
import type { LibraryDocument } from "../types";

type View = "favoris" | "recents" | "collections";
const VIEWS: { id: View; label: string }[] = [
  { id: "favoris", label: "Favoris" },
  { id: "recents", label: "Récents" },
  { id: "collections", label: "Collections" },
];

const GRID = "grid grid-cols-2 gap-x-4 gap-y-7 xs:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));
  const { clearRecents, recents } = usePrefs();
  const navigate = useNavigate();
  const item = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft hover:bg-sunken hover:text-ink disabled:opacity-40";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Plus d'options"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-sunken text-ink transition hover:bg-line"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" {...dropdownMotion} className="absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-2xl border border-line bg-card p-2 shadow-elevated">
            <button type="button" role="menuitem" className={item} onClick={() => { setOpen(false); navigate("/proposer"); }}>
              <FilePlus2 className="h-4 w-4" /> Proposer un document
            </button>
            <button type="button" role="menuitem" className={`${item} text-red-600`} disabled={!recents.length} onClick={() => { setOpen(false); clearRecents(); }}>
              <Trash2 className="h-4 w-4" /> Effacer l'historique
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CollectionCard({ filiere, docs, index, onOpen }: { filiere: string; docs: LibraryDocument[]; index: number; onOpen: () => void }) {
  const niveaux = [...new Set(docs.map((d) => d.niveau).filter(Boolean))].slice(0, 2);
  const types = [...new Set(docs.map((d) => d.type))].slice(0, 3);
  const fan = docs.slice(0, 3);
  const n = docs.length;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      {...listItem(index)}
      className="group relative flex h-[252px] flex-col justify-start overflow-hidden rounded-3xl border border-line bg-sunken text-left transition duration-standard hover:-translate-y-0.5 hover:shadow-raised active:scale-[0.98]"
    >
      <div className="flex items-center justify-between p-4">
        <span className="inline-flex items-center gap-2 rounded-full bg-card py-1 pl-1 pr-3 text-xs font-bold text-ink-soft shadow-card">
          <FiliereAvatar filiere={filiere} size={22} />
          Filière
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-xs font-bold text-ink-soft shadow-card">
          <Heart className="h-3.5 w-3.5 fill-brand-500 text-brand-500" /> {n} document{n > 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-4 text-center">
        <p className="text-2xl font-extrabold text-ink">{filiere}</p>
        <p className="mt-0.5 text-sm text-ink-muted">{[types.join(", "), niveaux.join(" · ")].filter(Boolean).join(" — ")}</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[120px] items-end justify-center" aria-hidden>
        {fan.map((doc, i) => {
          // Fanned covers, like the mockup.
          const pos = fan.length === 1 ? 0 : i - (fan.length - 1) / 2;
          return (
            <span
              key={doc.id}
              className="absolute bottom-[-22px] w-[84px]"
              style={{ transform: `translateX(${pos * 78}px) rotate(${pos * 6}deg)`, zIndex: 10 - Math.abs(pos) }}
            >
              <span className="block transition-transform duration-300 group-hover:-translate-y-2">
                <DocCover doc={doc} size="xs" />
              </span>
            </span>
          );
        })}
      </div>
    </motion.button>
  );
}

export default function Bibliotheque() {
  useSeoHead();
  const desktop = useIsDesktop();
  const [params, setParams] = useSearchParams();
  const view = (VIEWS.find((v) => v.id === params.get("vue"))?.id ?? "favoris") as View;
  const filiere = params.get("filiere") ?? "";
  const { status: authStatus, openAuth } = useAuth();
  const { documents, status } = useLibrary();
  const { favorites, favoritesStatus, recents, clearRecents } = usePrefs();
  const openDocument = useOpenDocument();

  const byId = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);
  const favDocs = useMemo(
    () => [...favorites].map((id) => byId.get(id)).filter(Boolean) as LibraryDocument[],
    [favorites, byId],
  );
  const recentDocs = useMemo(() => recents.map((id) => byId.get(id)).filter(Boolean) as LibraryDocument[], [recents, byId]);
  const collections = useMemo(() => {
    const groups = new Map<string, LibraryDocument[]>();
    for (const d of favDocs) groups.set(d.filiere, [...(groups.get(d.filiere) ?? []), d]);
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [favDocs]);

  const setView = (v: View, f = "") => {
    const next = new URLSearchParams();
    next.set("vue", v);
    if (f) next.set("filiere", f);
    setParams(next);
  };

  const loading = status === "loading" || (authStatus === "authenticated" && favoritesStatus === "loading");
  const shownFavs = filiere ? favDocs.filter((d) => d.filiere === filiere) : favDocs;

  const needLogin = authStatus === "anonymous" && view !== "recents";

  // Previous / next in the preview follow the list on screen.
  useEffect(
    () => registerPreviewSequence((view === "recents" ? recentDocs : shownFavs).map((d) => d.id)),
    [view, recentDocs, shownFavs],
  );

  return (
    <div className="page relative">
      <div className="mb-5 flex items-center justify-between gap-3">
        {desktop ? (
          <div>
            <h1 className="eyebrow">Ma bibliothèque</h1>
            <p className="mt-1.5 text-sm text-ink-muted">Vos favoris, votre historique et vos collections par filière.</p>
          </div>
        ) : (
          <h1 className="text-2xl font-extrabold">Ma bibliothèque</h1>
        )}
        <div className="flex items-center gap-2">
          {desktop && (
            <ButtonLink to="/proposer" size="sm" icon={<Plus className="h-4 w-4" />} className="h-10 rounded-full px-4">
              Proposer
            </ButtonLink>
          )}
          <MoreMenu />
        </div>
      </div>

      <div className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex gap-2" role="tablist" aria-label="Affichage">
          {VIEWS.map((v) => (
            <Chip key={v.id} active={view === v.id} onClick={() => setView(v.id)}>
              {v.label}
            </Chip>
          ))}
          {filiere && view === "favoris" && (
            <Chip active onClick={() => setView("favoris")}>
              {filiere} ✕
            </Chip>
          )}
        </div>
      </div>

      {favoritesStatus === "unavailable" && view !== "recents" && (
        <div className="mb-6">
          <Alert tone="info" title="Favoris bientôt disponibles">
            L'enregistrement des favoris n'est pas encore activé sur le serveur.
          </Alert>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={view + filiere} {...fadeUp}>
          {needLogin ? (
            <EmptyState
              icon={<Heart className="h-6 w-6" />}
              title="Retrouvez vos favoris partout"
              action={
                <Button icon={<LogIn className="h-4 w-4" />} onClick={() => openAuth("login", { reason: "Connectez-vous pour retrouver vos favoris." })}>
                  Se connecter
                </Button>
              }
            >
              Connectez-vous pour enregistrer des documents et les retrouver sur votre téléphone comme sur ordinateur.
            </EmptyState>
          ) : loading ? (
            <CoverGridSkeleton count={8} className={GRID} />
          ) : view === "recents" ? (
            recentDocs.length === 0 ? (
              <EmptyState icon={<History className="h-6 w-6" />} title="Aucun document consulté" action={<ButtonLink to="/documents">Explorer les documents</ButtonLink>}>
                Les documents que vous ouvrez apparaîtront ici.
              </EmptyState>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-base font-bold lg:eyebrow">Consultés récemment</h2>
                  <button type="button" onClick={clearRecents} className="text-[13px] font-semibold text-ink-muted hover:text-accent">
                    Tout effacer
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {recentDocs.map((doc, i) => (
                    <RowCard key={doc.id} doc={doc} onOpen={openDocument} index={Math.min(i, 8)} />
                  ))}
                </div>
              </>
            )
          ) : favDocs.length === 0 ? (
            <EmptyState icon={<Heart className="h-6 w-6" />} title="Aucun favori pour le moment" action={<ButtonLink to="/documents">Explorer les documents</ButtonLink>}>
              Touchez le cœur d'un document pour l'ajouter ici.
            </EmptyState>
          ) : view === "collections" ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold lg:eyebrow">Par filière</h2>
                <Link to="/bibliotheque?vue=favoris" className="text-[13px] font-semibold text-ink-muted hover:text-accent">
                  Voir tout
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {collections.map(([f, docs], i) => (
                  <CollectionCard key={f} filiere={f} docs={docs} index={i} onOpen={() => setView("favoris", f)} />
                ))}
              </div>
            </>
          ) : (
            <div className={GRID}>
              {shownFavs.map((doc, i) => (
                <CoverTile key={doc.id} doc={doc} index={i} onOpen={openDocument} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {!desktop && (
        <Link
          to="/proposer"
          aria-label="Proposer un document"
          className="fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#17171A] text-white shadow-elevated transition active:scale-95 dark:bg-brand-500"
          style={{ bottom: "calc(var(--bottomnav-h) + env(safe-area-inset-bottom) + 16px)" }}
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  );
}
