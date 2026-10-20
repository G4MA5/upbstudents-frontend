// Public page of one document (/documents/123-…): indexable by search engines,
// shareable, and the "Consulter" button opens the usual preview.
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, Download, Eye, GraduationCap, Layers, RefreshCw, UserRound, WifiOff } from "lucide-react";
import { CategoryChip, FiliereBadge } from "../components/documents/category";
import { DocCover } from "../components/documents/DocCover";
import { Button } from "../components/ui/Button";
import { EmptyState, Skeleton } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/DocumentsContext";
import { useToast } from "../context/ToastContext";
import { downloadDocument } from "../lib/files";
import { useOpenDocument } from "../lib/hooks";
import { categoryLabel, documentDescription, documentIdFromRef, documentMeta, documentPath } from "../lib/seo";
import { useSeoHead } from "../lib/useSeoHead";
import type { LibraryDocument } from "../types";
import NotFound from "./NotFound";

export default function DocumentPage() {
  const { ref = "" } = useParams();
  const id = documentIdFromRef(ref);
  const { documents, status, reload } = useLibrary();
  const doc = id ? documents.find((d) => d.id === id) : undefined;

  if (doc) return <DocumentDetail key={doc.id} doc={doc} documents={documents} />;
  if (status === "ready" || !id) return <NotFound />;
  if (status === "error") {
    return (
      <div className="container-page py-10">
        <EmptyState
          icon={<WifiOff className="h-6 w-6" />}
          title="Impossible de charger ce document"
          action={
            <Button variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={reload}>
              Réessayer
            </Button>
          }
        >
          Vérifiez votre connexion internet, puis réessayez.
        </EmptyState>
      </div>
    );
  }
  return (
    <div className="container-page grid gap-8 py-8 md:grid-cols-[240px_1fr]" role="status" aria-label="Chargement du document…">
      <Skeleton className="aspect-[3/4] w-full max-w-[240px] rounded-xl" />
      <div>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-10 w-full max-w-lg" />
        <Skeleton className="mt-6 h-32 w-full max-w-lg" />
      </div>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-muted">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</dt>
        <dd className="font-semibold text-ink">{value}</dd>
      </div>
    </div>
  );
}

function DocumentDetail({ doc, documents }: { doc: LibraryDocument; documents: LibraryDocument[] }) {
  useSeoHead(documentMeta(doc));
  const openDocument = useOpenDocument();
  const { requireAuth } = useAuth();
  const toast = useToast();

  const related = useMemo(() => {
    const filiere = doc.filiere.split(/,\s*/)[0];
    return documents
      .filter((d) => d.id !== doc.id && d.filiere.includes(filiere))
      .sort((a, b) => Number(b.type === doc.type) - Number(a.type === doc.type) || Number(b.niveau === doc.niveau) - Number(a.niveau === doc.niveau))
      .slice(0, 8);
  }, [doc, documents]);

  const download = () =>
    requireAuth(() => {
      downloadDocument(doc);
      toast.success("Téléchargement lancé", doc.title);
    }, "Connectez-vous pour télécharger ce document.");

  const firstFiliere = doc.filiere.split(/,\s*/)[0];

  return (
    <div className="pb-12">
      <div className="container-page pt-5 lg:pt-8">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-muted">
          <ol className="flex min-w-0 flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-accent">Accueil</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/documents" className="hover:text-accent">Documents</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="min-w-0 truncate font-semibold text-ink">{doc.title}</li>
          </ol>
        </nav>

        <article className="mt-6 grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="mx-auto w-48 md:mx-0 md:w-full">
            <DocCover doc={doc} size="lg" className="w-full" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryChip type={doc.type} />
              <FiliereBadge filiere={doc.filiere} />
            </div>
            <h1 className="mt-3 break-words text-2xl font-extrabold leading-tight tracking-tight lg:text-4xl">{doc.title}</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{documentDescription(doc)}</p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button size="lg" icon={<Eye className="h-5 w-5" />} onClick={() => openDocument(doc)}>
                Consulter le document
              </Button>
              <Button size="lg" variant="outline" icon={<Download className="h-5 w-5" />} onClick={download}>
                Télécharger
              </Button>
            </div>

            <dl className="mt-6 grid max-w-2xl divide-y divide-line sm:grid-cols-2 sm:divide-y-0">
              <Fact icon={<Layers className="h-4 w-4" />} label="Catégorie" value={categoryLabel(doc.type)} />
              <Fact icon={<GraduationCap className="h-4 w-4" />} label="Niveau" value={doc.niveau} />
              <Fact icon={<Calendar className="h-4 w-4" />} label="Année" value={doc.annee} />
              <Fact icon={<Layers className="h-4 w-4" />} label="Session" value={doc.session} />
              <Fact icon={<UserRound className="h-4 w-4" />} label="Auteur" value={doc.auteur} />
            </dl>
          </div>
        </article>
      </div>

      {related.length > 0 && (
        <section className="container-page mt-12" aria-labelledby="similaires">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 id="similaires" className="text-xl font-extrabold">Autres documents en {firstFiliere}</h2>
            <Link
              to={`/documents?filiere=${encodeURIComponent(firstFiliere)}`}
              className="shrink-0 text-sm font-bold text-accent hover:underline"
            >
              Tout voir
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {related.map((d) => (
              <li key={d.id}>
                <Link
                  to={documentPath(d)}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-card p-2.5 shadow-card transition hover:border-brand-500/40"
                >
                  <DocCover doc={d} square size="xs" className="w-14 shrink-0 rounded-md" />
                  <span className="min-w-0">
                    <span className="line-clamp-2 text-sm font-bold leading-snug">{d.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">
                      {[categoryLabel(d.type), d.niveau, d.annee].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
