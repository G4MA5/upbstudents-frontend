import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, FilePlus2, RefreshCw, WifiOff, X } from "lucide-react";
import { CategoryTiles } from "../components/documents/CategoryTiles";
import { DocCover } from "../components/documents/DocCover";
import {
  CoverTile,
  CoverTileSkeleton,
  RowCard,
  RowCardSkeleton,
} from "../components/documents/DocumentCard";
import { SearchBar } from "../components/documents/SearchBar";
import { FiliereAvatar, TopFilieres } from "../components/layout/RightRail";
import { Avatar } from "../components/layout/UserMenu";
import { Button } from "../components/ui/Button";
import { EmptyState, Skeleton } from "../components/ui/Feedback";
import { HScroll, Section } from "../components/ui/Section";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/DocumentsContext";
import { usePrefs } from "../context/PrefsContext";
import { FILIERES } from "../lib/constants";
import { FEATURES } from "../lib/features";
import { plural } from "../lib/format";
import { useIsDesktop, useOpenDocument } from "../lib/hooks";
import { fadeUp, listItem, SPRING } from "../lib/motion";
import { usePageTitle } from "../lib/usePageTitle";
import type { LibraryDocument } from "../types";

function useHomeData() {
  const { documents } = useLibrary();
  const { recents } = usePrefs();
  const { profile } = useAuth();

  return useMemo(() => {
    const latest = [...documents].sort((a, b) => b.id - a.id);
    const byId = new Map(documents.map((d) => [d.id, d]));
    const recent = recents.map((id) => byId.get(id)).filter(Boolean) as LibraryDocument[];
    const mine = profile?.filiere ? latest.filter((d) => d.filiere === profile.filiere) : [];
    // "For you": the student's filière first, otherwise a stable daily selection.
    const day = Math.floor(Date.now() / 86400000);
    const daily = [...latest].sort((a, b) => ((a.id * 31 + day) % 97) - ((b.id * 31 + day) % 97));
    const picks = (mine.length >= 4 ? mine : daily).slice(0, 4);
    return { latest, recent, picks, forFiliere: mine.length >= 4 ? profile?.filiere : null };
  }, [documents, recents, profile?.filiere]);
}

function LoadError() {
  const { error, reload } = useLibrary();
  return (
    <EmptyState
      icon={<WifiOff className="h-6 w-6" />}
      title="Impossible de charger la bibliothèque"
      action={
        <Button icon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
          Réessayer
        </Button>
      }
    >
      {error}
    </EmptyState>
  );
}

/** Greeting, what the library holds, and the search: the first thing seen. */
function Intro() {
  const { documents, status } = useLibrary();
  const { profile } = useAuth();
  return (
    <motion.header {...fadeUp} className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-ink-muted">
          {profile?.prenom ? `Bonjour ${profile.prenom}` : "Bienvenue"}
        </p>
        <h1 className="mt-0.5 text-[28px] font-extrabold leading-tight">Bibliothèque numérique</h1>
        <p className="mt-1.5 max-w-2xl text-[15px] text-ink-muted">
          {status === "ready" && documents.length ? (
            <>
              <strong className="font-semibold text-ink-soft">{plural(documents.length, "document", "documents")}</strong>{" "}
              partagés par les étudiants de l'Université Polytechnique de Bingerville.
            </>
          ) : (
            "Examens, TD, TP et livres partagés par les étudiants de l'Université Polytechnique de Bingerville."
          )}
        </p>
      </div>
      <div className="max-w-2xl">
        <SearchBar showFilters={false} />
      </div>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop                                                             */

function DesktopHome() {
  const { status } = useLibrary();
  const openDocument = useOpenDocument();
  const { latest, recent, picks, forFiliere } = useHomeData();
  const loading = status === "loading";
  const showRecent = recent.length >= 3;
  const row = showRecent ? recent : latest;

  return (
    <div className="page flex flex-col gap-10">
      <Intro />

      {status === "error" ? (
        <LoadError />
      ) : (
        <>
          <Section title="Documents" to="/documents">
            <CategoryTiles />
          </Section>

          <Section
            title={showRecent ? "Récemment consultés" : "Derniers ajouts"}
            to={showRecent ? "/bibliotheque?vue=recents" : "/documents"}
          >
            <div className="grid grid-cols-5 gap-5 2xl:grid-cols-6">
              {loading
                ? Array.from({ length: 5 }, (_, i) => <CoverTileSkeleton key={i} square />)
                : row.slice(0, 6).map((doc, i) => (
                    <div key={doc.id} className={i === 5 ? "hidden 2xl:block" : undefined}>
                      <CoverTile doc={doc} onOpen={openDocument} index={i} square />
                    </div>
                  ))}
            </div>
          </Section>

          <Section
            title={forFiliere ? `Pour vous · ${forFiliere}` : "À découvrir"}
            to={forFiliere ? `/documents?filiere=${encodeURIComponent(forFiliere)}` : "/documents"}
          >
            <div className="grid grid-cols-2 gap-4">
              {loading
                ? Array.from({ length: 4 }, (_, i) => <RowCardSkeleton key={i} />)
                : picks.map((doc, i) => <RowCard key={doc.id} doc={doc} onOpen={openDocument} index={i} />)}
            </div>
          </Section>

          {/* Shown whenever the right rail (and its filières list) is not. */}
          <Section title="Filières" className={FEATURES.rightRail ? "xl:hidden" : ""}>
            <div className="max-w-2xl">
              <TopFilieres limit={7} />
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile                                                              */

function MobileHome() {
  const { status } = useLibrary();
  const { status: authStatus, profile, openAuth } = useAuth();
  const { searches, removeSearch, clearSearches } = usePrefs();
  const openDocument = useOpenDocument();
  const { latest, recent } = useHomeData();
  const loading = status === "loading";

  return (
    <div className="page flex flex-col gap-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {/* Hidden on the narrowest phones so the full name stays readable. */}
          <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 xs:flex">
            <img src="/logo5.png" alt="" width={30} height={30} className="h-[30px] w-[30px] object-contain" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm text-ink-muted">{profile?.prenom ? `Bonjour ${profile.prenom}` : "Bienvenue"}</p>
            <h1 className="truncate text-[21px] font-extrabold leading-tight xs:text-[22px]">
              <span className="text-secondary-text">UpB</span> <span className="text-brand-500">Student's</span>
            </h1>
          </div>
        </div>
        {authStatus === "authenticated" ? (
          <Link to="/profil" aria-label="Mon profil" className="shrink-0 rounded-full transition active:scale-95">
            <Avatar size={44} />
          </Link>
        ) : authStatus === "anonymous" ? (
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="h-10 shrink-0 rounded-full bg-brand-700 px-4 text-sm font-bold text-white shadow-glow transition active:scale-95"
          >
            Se connecter
          </button>
        ) : (
          <Skeleton className="h-11 w-11 rounded-full" />
        )}
      </div>

      <SearchBar />

      {searches.length > 0 && (
        <Section
          title="Recherches récentes"
          action={
            <button type="button" onClick={clearSearches} className="text-[13px] font-semibold text-ink-muted">
              Tout effacer
            </button>
          }
        >
          <div className="flex flex-wrap gap-2">
            {searches.map((s) => (
              <motion.span
                key={s}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={SPRING.snappy}
                className="inline-flex items-center rounded-full bg-sunken text-[13px] font-medium text-ink-soft"
              >
                <Link to={`/documents?q=${encodeURIComponent(s)}`} className="py-2 pl-3.5 pr-1.5">
                  {s}
                </Link>
                <button
                  type="button"
                  onClick={() => removeSearch(s)}
                  className="py-2 pl-1 pr-3 text-ink-faint"
                  aria-label={`Supprimer la recherche ${s}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.span>
            ))}
          </div>
        </Section>
      )}

      {status === "error" ? (
        <LoadError />
      ) : (
        <>
          <Section title="Documents" to="/documents">
            <CategoryTiles />
          </Section>

          <Section title="Ajouts" accent="récents" to="/documents">
            <HScroll>
              {loading
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="w-[124px] shrink-0">
                      <Skeleton className="h-[170px] rounded-2xl" />
                      <Skeleton className="mt-2 h-3.5 w-24" />
                    </div>
                  ))
                : latest.slice(0, 10).map((doc, i) => (
                    <motion.button
                      key={doc.id}
                      type="button"
                      onClick={() => openDocument(doc)}
                      {...listItem(i)}
                      className="w-[124px] shrink-0 snap-start text-left"
                    >
                      <span className="block rounded-2xl bg-sunken p-2.5 transition active:scale-[0.97]">
                        <DocCover doc={doc} size="sm" />
                      </span>
                      <span className="mt-2 block truncate text-[13px] font-bold text-ink">{doc.title}</span>
                      <span className="block truncate text-xs text-ink-muted">
                        {doc.filiere} · {doc.niveau}
                      </span>
                    </motion.button>
                  ))}
            </HScroll>
          </Section>

          {recent.length > 0 && (
            <Section title="Consultés" accent="récemment" to="/bibliotheque?vue=recents">
              <div className="flex flex-col gap-3">
                {recent.slice(0, 3).map((doc, i) => (
                  <RowCard key={doc.id} doc={doc} onOpen={openDocument} index={i} />
                ))}
              </div>
            </Section>
          )}

          <Section title="Par filière">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
              {FILIERES.map((f) => (
                <Link
                  key={f}
                  to={`/documents?filiere=${encodeURIComponent(f)}`}
                  className="flex flex-col items-center gap-1.5 text-center transition active:scale-95"
                >
                  <FiliereAvatar filiere={f} size={56} />
                  <span className="text-xs font-bold text-ink">{f}</span>
                </Link>
              ))}
            </div>
          </Section>

          <Link
            to="/proposer"
            className="flex items-center gap-4 rounded-3xl bg-secondary p-5 text-white shadow-raised transition active:scale-[0.98]"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
              <FilePlus2 className="h-6 w-6" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-extrabold">Proposer un document</span>
              <span className="block text-sm text-white/80">Partagez vos sujets, TD et TP. L'équipe vérifie avant publication.</span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/70" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}

export default function Home() {
  usePageTitle();
  const desktop = useIsDesktop();
  return desktop ? <DesktopHome /> : <MobileHome />;
}
