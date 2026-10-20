import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, FilePlus2, LayoutGrid } from "lucide-react";
import { categoryStyle } from "../components/documents/category";
import { ButtonLink } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Feedback";
import { useLibrary } from "../context/DocumentsContext";
import { CATEGORIES, FILIERES } from "../lib/constants";
import { FAQ } from "../lib/seo";
import { SEO_CONFIG } from "../lib/seoConfig";
import { useSeoHead } from "../lib/useSeoHead";

export default function APropos() {
  useSeoHead();
  const { documents, status } = useLibrary();

  const counts = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const d of documents) byType[d.type] = (byType[d.type] ?? 0) + 1;
    return byType;
  }, [documents]);

  return (
    <div className="pb-12">
      <div className="page-head">
        <p className="eyebrow !text-accent">À propos</p>
        <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">{SEO_CONFIG.siteName}, la bibliothèque numérique de l'UPB</h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-ink-muted">
          {SEO_CONFIG.siteName} rassemble en un seul endroit les ressources pédagogiques des étudiants de
          l'{SEO_CONFIG.universityName} (Bingerville, Côte d'Ivoire) : épreuves d'examens, cours, sujets de TD et de
          TP, mémoires et livres, classés par filière, par niveau et par année.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink to="/documents" icon={<LayoutGrid className="h-4 w-4" />}>Explorer les documents</ButtonLink>
          <ButtonLink to="/proposer" variant="outline" icon={<FilePlus2 className="h-4 w-4" />}>Proposer un document</ButtonLink>
        </div>
      </div>

      <section className="container-page mt-8" aria-labelledby="contenu">
        <h2 id="contenu" className="mb-4 text-xl font-extrabold">Ce que contient la bibliothèque</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {CATEGORIES.map((c) => {
            const { icon: Icon } = categoryStyle(c.value);
            return (
              <li key={c.value}>
                <Link
                  to={`/documents?type=${encodeURIComponent(c.value)}`}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    {status === "ready" ? (
                      <span className="block text-2xl font-extrabold">{counts[c.value] ?? 0}</span>
                    ) : (
                      <Skeleton className="h-7 w-10" />
                    )}
                    <span className="text-sm font-semibold text-ink-muted">{c.label}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-sm text-ink-muted">
          Filières couvertes :{" "}
          {FILIERES.map((f, i) => (
            <span key={f}>
              <Link to={`/documents?filiere=${encodeURIComponent(f)}`} className="font-semibold text-ink-soft hover:text-accent">
                {f}
              </Link>
              {i < FILIERES.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      </section>

      <section className="container-page mt-12" aria-labelledby="faq">
        <h2 id="faq" className="mb-4 text-xl font-extrabold">Questions fréquentes</h2>
        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-card shadow-card">
          {FAQ.map(({ q, a }, i) => (
            <details key={q} className="group" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold transition hover:bg-sunken/60 [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-5 pb-5 leading-relaxed text-ink-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
