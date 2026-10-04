import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FilePlus2, RefreshCw, SearchX, WifiOff } from "lucide-react";
import { CoverGridSkeleton, CoverTile } from "../components/documents/DocumentCard";
import {
  ActiveFilters,
  CategoryChips,
  EMPTY_FILTERS,
  FiliereChips,
  SearchField,
  SecondaryFilters,
  SortSelect,
  secondaryCount,
  type Filters,
} from "../components/documents/FilterBar";
import { SearchBar } from "../components/documents/SearchBar";
import { TipBanner } from "../components/onboarding/TipBanner";
import { Button, ButtonLink } from "../components/ui/Button";
import { EmptyState } from "../components/ui/Feedback";
import { Modal } from "../components/ui/Modal";
import { useLibrary } from "../context/DocumentsContext";
import { CATEGORIES, typeHasSession } from "../lib/constants";
import { plural } from "../lib/format";
import { useIsDesktop, useOpenDocument } from "../lib/hooks";
import { registerPreviewSequence } from "../lib/previewSequence";
import { normalize, scoreDocument, tokenize } from "../lib/search";
import { useSeoHead } from "../lib/useSeoHead";
import type { LibraryDocument } from "../types";

const PAGE_SIZE = 30;
const FILTER_KEYS = Object.keys(EMPTY_FILTERS) as (keyof Filters)[];
const GRID = "grid grid-cols-2 gap-x-4 gap-y-7 xs:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

export default function Documents() {
  const { documents, status, error, reload } = useLibrary();
  const openDocument = useOpenDocument();
  const desktop = useIsDesktop();
  const [params, setParams] = useSearchParams();
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [sheet, setSheet] = useState(false);

  // Filters live in the URL: shareable links, and the back button works.
  const filters = useMemo<Filters>(() => {
    const f = { ...EMPTY_FILTERS };
    for (const key of FILTER_KEYS) f[key] = params.get(key) ?? "";
    f.tri = params.get("tri") || (f.q ? "pertinence" : "recent");
    return f;
  }, [params]);

  const category = CATEGORIES.find((c) => c.value === filters.type);
  useSeoHead({
    title: category ? `${category.label} · UpB Student's` : "Documents & Épreuves · UpB Student's",
    description: category
      ? `Consultez les ${category.label.toLowerCase()} de l'Université Polytechnique de Bingerville.`
      : "Consultez et recherchez parmi le catalogue complet d'examens, TD, TP et livres pour toutes les filières de l'UPB.",
  });

  const updateFilters = useCallback(
    (patch: Partial<Filters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          if ("q" in patch && !next.get("q") && next.get("tri") === "pertinence") next.delete("tri");
          if (next.get("type") && !typeHasSession(next.get("type")!)) next.delete("session");
          return next;
        },
        { replace: "q" in patch },
      );
      setLimit(PAGE_SIZE);
    },
    [setParams],
  );

  // Stable callback: the search fields debounce on it.
  const setQuery = useCallback((q: string) => updateFilters({ q }), [updateFilters]);

  const resetFilters = useCallback(() => {
    setParams({});
    setLimit(PAGE_SIZE);
  }, [setParams]);

  // "Filtres" button of the mobile home opens the sheet directly.
  useEffect(() => {
    if (params.get("filtres")) {
      setSheet(true);
      updateFilters({ filtres: "" } as unknown as Partial<Filters>);
    }
  }, [params, updateFilters]);

  const tokens = useMemo(() => tokenize(filters.q), [filters.q]);

  const searched = useMemo(() => {
    if (!tokens.length) return documents.map((doc) => ({ doc, score: 1 }));
    return documents.map((doc) => ({ doc, score: scoreDocument(doc, tokens) })).filter((r) => r.score > 0);
  }, [documents, tokens]);

  const matchFacets = useCallback(
    (doc: LibraryDocument, ignore?: "type" | "filiere") =>
      (ignore === "type" || !filters.type || doc.type === filters.type) &&
      (ignore === "filiere" || !filters.filiere || doc.filiere === filters.filiere) &&
      (!filters.niveau || doc.niveau === filters.niveau) &&
      (!filters.annee || doc.annee === filters.annee) &&
      (!filters.session || doc.session === filters.session),
    [filters],
  );

  const counts = useMemo(() => {
    const type: Record<string, number> = {};
    const filiere: Record<string, number> = {};
    let total = 0;
    for (const { doc } of searched) {
      if (matchFacets(doc, "type")) {
        type[doc.type] = (type[doc.type] ?? 0) + 1;
        total++;
      }
      if (matchFacets(doc, "filiere")) filiere[doc.filiere] = (filiere[doc.filiere] ?? 0) + 1;
    }
    return { type, filiere, total };
  }, [searched, matchFacets]);

  const results = useMemo(() => {
    const list = searched.filter(({ doc }) => matchFacets(doc));
    switch (filters.tri) {
      case "az":
        list.sort((a, b) => normalize(a.doc.title).localeCompare(normalize(b.doc.title), "fr"));
        break;
      case "annee":
        list.sort((a, b) => Number(b.doc.annee) - Number(a.doc.annee) || b.doc.id - a.doc.id);
        break;
      case "pertinence":
        list.sort((a, b) => b.score - a.score || b.doc.id - a.doc.id);
        break;
      default:
        list.sort((a, b) => b.doc.id - a.doc.id);
    }
    return list.map((r) => r.doc);
  }, [searched, matchFacets, filters.tri]);

  // The preview's "previous / next" follows this exact order.
  useEffect(() => registerPreviewSequence(results.map((d) => d.id)), [results]);

  const visible = results.slice(0, limit);
  const hasFilters = FILTER_KEYS.some((k) => k !== "tri" && filters[k]);
  const heading = category ? category.label : "Tous les documents";
  const countLabel =
    status === "ready"
      ? `${plural(results.length, "document", "documents")}${
          filters.filiere ? ` · filière ${filters.filiere}` : ""
        }${hasFilters ? "" : " dans la bibliothèque"}`
      : "Chargement de la bibliothèque…";

  return (
    <div className="page">
      {/* Header */}
      {desktop ? (
        <div className="mb-6 flex flex-col gap-5">
          <div>
            <p className="eyebrow !text-accent">Documents</p>
            <h1 className="mt-1 text-2xl font-extrabold">{heading}</h1>
            <p className="mt-1 text-sm text-ink-muted" aria-live="polite">
              {countLabel}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchField value={filters.q} onChange={setQuery} />
            <SecondaryFilters filters={filters} onChange={updateFilters} className="flex gap-2" />
            <SortSelect filters={filters} onChange={updateFilters} />
          </div>
          <CategoryChips filters={filters} onChange={updateFilters} counts={counts} />
          <FiliereChips filters={filters} onChange={updateFilters} counts={counts} />
          <ActiveFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-4">
          <div>
            {category && <p className="eyebrow !text-accent">Documents</p>}
            <h1 className="text-2xl font-extrabold">{category ? category.label : "Documents"}</h1>
            <p className="mt-0.5 text-sm text-ink-muted" aria-live="polite">
              {countLabel}
            </p>
          </div>
          <SearchBar
            value={filters.q}
            onChange={setQuery}
            onFilters={() => setSheet(true)}
            filterCount={secondaryCount(filters)}
          />
          <CategoryChips filters={filters} onChange={updateFilters} counts={counts} />
          <FiliereChips filters={filters} onChange={updateFilters} counts={counts} />
          <ActiveFilters filters={filters} onChange={updateFilters} onReset={resetFilters} />
        </div>
      )}

      <TipBanner
        id="documents"
        title="Astuce"
        message="Touchez un document pour l'aperçu et ses informations, puis choisissez de le consulter en ligne ou de le télécharger. Le cœur l'ajoute à vos favoris."
      />

      {status === "loading" ? (
        <CoverGridSkeleton count={12} className={GRID} />
      ) : status === "error" ? (
        <EmptyState
          icon={<WifiOff className="h-6 w-6" />}
          title="Impossible de charger les documents"
          action={
            <Button icon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
              Réessayer
            </Button>
          }
        >
          {error}
        </EmptyState>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title={
            filters.q
              ? "Aucun document ne correspond à votre recherche."
              : "Aucun document disponible pour cette sélection."
          }
          action={
            <>
              {hasFilters && (
                <Button variant="outline" onClick={resetFilters}>
                  Réinitialiser les filtres
                </Button>
              )}
              <ButtonLink to="/proposer" icon={<FilePlus2 className="h-4 w-4" />}>
                Proposer un document
              </ButtonLink>
            </>
          }
        >
          Essayez un autre mot-clé ou retirez un filtre. Vous avez ce document ? Proposez-le pour en faire profiter tout le monde.
        </EmptyState>
      ) : (
        <>
          <div className={GRID}>
            {visible.map((doc, i) => (
              <CoverTile key={doc.id} doc={doc} tokens={tokens} index={i} onOpen={openDocument} />
            ))}
          </div>
          {results.length > limit && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <p className="text-sm text-ink-muted">
                {visible.length} sur {results.length} documents affichés
              </p>
              <Button variant="outline" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
                Afficher plus de documents
              </Button>
            </div>
          )}
        </>
      )}

      {/* Mobile filter sheet */}
      <Modal open={sheet} onClose={() => setSheet(false)} size="sm" title="Filtres" description="Affinez les résultats par niveau, année et session.">
        <div className="flex flex-col gap-3">
          <SecondaryFilters filters={filters} onChange={updateFilters} className="grid gap-3" />
          <SortSelect filters={filters} onChange={updateFilters} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => updateFilters({ niveau: "", annee: "", session: "", tri: "" })}
            >
              Effacer
            </Button>
            <Button onClick={() => setSheet(false)}>Voir {results.length} résultat{results.length > 1 ? "s" : ""}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
