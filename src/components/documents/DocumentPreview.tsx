import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Heart,
  Layers,
  Lock,
  LogIn,
  Trash2,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/DocumentsContext";
import { usePrefs } from "../../context/PrefsContext";
import { useToast } from "../../context/ToastContext";
import { api, errorMessage } from "../../lib/api";
import { downloadDocument, useFileInfo } from "../../lib/files";
import { FILE_KIND_LABEL, formatBytes, formatDate } from "../../lib/format";
import { fadeUp, SPRING } from "../../lib/motion";
import { neighboursOf } from "../../lib/previewSequence";
import type { LibraryDocument } from "../../types";
import { Button } from "../ui/Button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { Skeleton } from "../ui/Feedback";
import { Modal } from "../ui/Modal";
import { CategoryChip, FiliereBadge } from "./category";
import { DocCover } from "./DocCover";

const PdfViewer = lazy(() => import("./PdfViewer"));
const DocxViewer = lazy(() => import("./DocxViewer"));

const DOWNLOAD_REASON = "Connectez-vous pour télécharger ce document.";
const PREVIEW_REASON = "Connectez-vous pour consulter ce document.";

function PreviewUnavailable({ doc, message }: { doc: LibraryDocument; message: string }) {
  return (
    <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-ink-muted shadow-card">
        <FileText className="h-7 w-7" aria-hidden />
      </div>
      <p className="mt-4 font-semibold text-ink">Aperçu indisponible</p>
      <p className="mt-1 max-w-xs text-sm text-ink-muted">{message}</p>
      <a
        href={doc.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
      >
        Ouvrir dans un nouvel onglet <ExternalLink className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

function PreviewArea({
  doc,
  onPages,
}: {
  doc: LibraryDocument;
  onPages: (n: number) => void;
}) {
  const { status, openAuth } = useAuth();
  const file = useFileInfo(doc.file_url);
  const [failed, setFailed] = useState(false);
  const fail = useCallback(() => setFailed(true), []);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card text-accent shadow-card">
          <Lock className="h-6 w-6" aria-hidden />
        </div>
        <p className="mt-4 font-semibold text-ink">Aperçu réservé aux étudiants inscrits</p>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">
          Connectez-vous ou créez un compte gratuit pour lire ce document en ligne.
        </p>
        <Button
          className="mt-5"
          icon={<LogIn className="h-4 w-4" />}
          loading={status === "loading"}
          onClick={() => openAuth("login", { reason: PREVIEW_REASON })}
        >
          Se connecter
        </Button>
      </div>
    );
  }

  if (file.status === "loading") {
    return (
      <div className="p-4 sm:p-6" role="status" aria-label="Chargement de l'aperçu…">
        <Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-[820px] rounded-md" />
      </div>
    );
  }

  if (file.status === "error" || failed) {
    return (
      <PreviewUnavailable
        doc={doc}
        message="Le fichier n'a pas pu être chargé. Vous pouvez essayer de l'ouvrir ou de le télécharger."
      />
    );
  }

  const { kind } = file.info;
  const fallback = <PreviewUnavailable doc={doc} message="Votre navigateur ne peut pas afficher ce fichier ici. Téléchargez-le pour le lire." />;

  return (
    <div className="p-3 sm:p-6">
      <ErrorBoundary fallback={fallback}>
        <Suspense
          fallback={<Skeleton className="mx-auto aspect-[1/1.414] w-full max-w-[820px] rounded-md" />}
        >
          {kind === "pdf" && <PdfViewer url={doc.file_url} onPages={onPages} onError={fail} />}
          {kind === "docx" && <DocxViewer url={doc.file_url} onError={fail} />}
          {kind === "image" && (
            <img
              src={doc.file_url}
              alt={doc.title}
              onError={fail}
              className="mx-auto max-h-[75vh] w-auto rounded-md bg-card shadow-raised"
            />
          )}
          {(kind === "doc" || kind === "other") && (
            <PreviewUnavailable
              doc={doc}
              message="L'aperçu n'est pas disponible pour ce format. Téléchargez le fichier pour le lire."
            />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 min-w-0 max-w-full">
      <span className="mt-0.5 shrink-0 text-ink-faint">{icon}</span>
      <dt className="w-24 shrink-0 text-sm text-ink-muted">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-medium text-ink break-words [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

/** "‹ Précédent · 3 / 24 · Suivant ›" within the list the student came from. */
function SequenceBar({
  docId,
  onNavigate,
}: {
  docId: number;
  onNavigate: (id: number) => void;
}) {
  const { prev, next, index, total } = neighboursOf(docId);
  if (total < 2) return null;
  const btn =
    "inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-soft transition hover:bg-card hover:text-ink active:scale-95 disabled:pointer-events-none disabled:opacity-35";
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line bg-sunken/90 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-sunken/75 sm:px-4 lg:min-h-[72px] lg:pr-16">
      <button type="button" className={btn} disabled={prev === null} onClick={() => prev !== null && onNavigate(prev)} aria-label="Document précédent">
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="hidden sm:inline">Précédent</span>
      </button>
      <span className="text-xs font-semibold tabular-nums text-ink-muted" aria-live="polite">
        {index + 1} / {total}
      </span>
      <button type="button" className={btn} disabled={next === null} onClick={() => next !== null && onNavigate(next)} aria-label="Document suivant">
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function FavoriteButton({ doc, className = "" }: { doc: LibraryDocument; className?: string }) {
  const { isFavorite, toggleFavorite } = usePrefs();
  const fav = isFavorite(doc.id);
  return (
    <button
      type="button"
      onClick={() => toggleFavorite(doc.id, doc.title)}
      aria-pressed={fav}
      aria-label={fav ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition active:scale-90 ${
        fav
          ? "border-brand-500 bg-accent-soft text-brand-500"
          : "border-line-strong bg-card text-ink-soft hover:border-brand-500/50 hover:text-accent"
      } ${className}`}
    >
      <motion.span key={fav ? "on" : "off"} initial={{ scale: 0.7 }} animate={{ scale: 1 }} transition={SPRING.pop} className="flex">
        <Heart className={`h-5 w-5 ${fav ? "fill-current" : ""}`} />
      </motion.span>
    </button>
  );
}

export function DocumentPreview({
  doc: requested,
  onClose,
  onNavigate,
}: {
  doc: LibraryDocument | null;
  onClose: () => void;
  onNavigate: (id: number) => void;
}) {
  // The last document stays rendered while the modal plays its exit animation.
  const [doc, setDoc] = useState(requested);
  useEffect(() => {
    if (requested) setDoc(requested);
  }, [requested]);

  const { status, profile, requireAuth, modal } = useAuth();
  const { remove } = useLibrary();
  const toast = useToast();
  const [pages, setPages] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const file = useFileInfo(doc?.file_url ?? null);

  useEffect(() => setPages(null), [doc?.id]);

  // ← / → move through the list (when no field or other dialog has focus).
  const open = Boolean(requested);
  useEffect(() => {
    if (!open || !doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (confirming || modal.open || e.altKey || e.ctrlKey || e.metaKey) return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      const { prev, next } = neighboursOf(doc.id);
      if (e.key === "ArrowLeft" && prev !== null) onNavigate(prev);
      if (e.key === "ArrowRight" && next !== null) onNavigate(next);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, doc, confirming, modal.open, onNavigate]);

  const download = () => {
    if (!doc) return;
    requireAuth(() => {
      downloadDocument(doc);
      toast.success("Téléchargement lancé", doc.title);
    }, DOWNLOAD_REASON);
  };

  const confirmDelete = async () => {
    if (!doc) return;
    setDeleting(true);
    try {
      await api("/api/supprimer", { method: "DELETE", body: { id: doc.id }, auth: true });
      remove(doc.id);
      toast.success("Document supprimé", doc.title);
      setConfirming(false);
      onClose();
    } catch (err) {
      toast.error("Suppression impossible", errorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const info = file.status === "ready" ? file.info : null;

  return (
    <>
      <Modal open={open} onClose={onClose} size="full" bare fill ariaLabel={doc?.title ?? "Document"}>
        {doc && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:flex-row lg:overflow-hidden">
            {/* Details */}
            <aside className="shrink-0 border-b border-line p-5 pr-14 pt-2 sm:p-6 sm:pr-16 lg:w-[340px] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:pr-6 min-w-0 max-w-full overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={doc.id} {...fadeUp}>
                  <div className="flex items-start gap-4 min-w-0 max-w-full">
                    <DocCover doc={doc} size="sm" className="w-20 shrink-0 sm:w-24" />
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryChip type={doc.type} />
                        <FiliereBadge filiere={doc.filiere} />
                      </div>
                      <h2 className="mt-2.5 text-lg font-extrabold leading-snug sm:text-xl break-words [overflow-wrap:anywhere]">{doc.title}</h2>
                    </div>
                  </div>

                  <dl className="mt-4 divide-y divide-line">
                    <MetaRow icon={<UserRound className="h-4 w-4" />} label="Auteur" value={doc.auteur} />
                    <MetaRow icon={<GraduationCap className="h-4 w-4" />} label="Niveau" value={doc.niveau} />
                    <MetaRow icon={<Award className="h-4 w-4" />} label="Mention" value={doc.mention} />
                    <MetaRow icon={<Calendar className="h-4 w-4" />} label="Année" value={doc.annee} />
                    <MetaRow icon={<Layers className="h-4 w-4" />} label="Session" value={doc.session} />
                    <MetaRow
                      icon={<FileText className="h-4 w-4" />}
                      label="Format"
                      value={
                        file.status === "loading" ? (
                          <Skeleton className="h-4 w-24" />
                        ) : info ? (
                          [FILE_KIND_LABEL[info.kind], formatBytes(info.size), pages ? `${pages} page${pages > 1 ? "s" : ""}` : ""]
                            .filter(Boolean)
                            .join(" · ")
                        ) : (
                          "—"
                        )
                      }
                    />
                    <MetaRow icon={<Calendar className="h-4 w-4" />} label="Ajouté le" value={formatDate(doc.created_at)} />
                  </dl>
                </motion.div>
              </AnimatePresence>

              <div className="mt-5 flex flex-col gap-2">
                {/* On phones these two live in the bottom bar (thumb reach). */}
                <div className="hidden gap-2 lg:flex">
                  <Button size="lg" className="flex-1" icon={<Download className="h-4 w-4" />} onClick={download}>
                    Télécharger
                  </Button>
                  <FavoriteButton doc={doc} />
                </div>
                {status === "authenticated" && (
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-ink-soft transition hover:bg-sunken active:scale-[0.98]"
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden />
                    Ouvrir dans un nouvel onglet
                  </a>
                )}
                {profile?.proprietaire && (
                  <button
                    type="button"
                    onClick={() => setConfirming(true)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 transition hover:bg-red-500/10 active:scale-[0.98]"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Supprimer le document
                  </button>
                )}
              </div>
            </aside>

            {/* Preview */}
            <section
              aria-label="Aperçu du document"
              className="flex min-h-[50vh] flex-1 flex-col bg-sunken lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain"
            >
              <SequenceBar docId={doc.id} onNavigate={onNavigate} />
              <PreviewArea key={doc.id} doc={doc} onPages={setPages} />
            </section>

            {/* Mobile action bar, always within thumb reach. */}
            <div className="sticky bottom-0 z-10 flex shrink-0 gap-2 border-t border-line bg-card/95 px-4 pt-3 backdrop-blur supports-[backdrop-filter]:bg-card/85 lg:hidden [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
              <Button size="lg" className="flex-1" icon={<Download className="h-4 w-4" />} onClick={download}>
                Télécharger
              </Button>
              <FavoriteButton doc={doc} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirming}
        title="Supprimer ce document ?"
        confirmLabel="Supprimer définitivement"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setConfirming(false)}
      >
        « {doc?.title} » sera retiré de la bibliothèque pour tous les
        étudiants. Cette action est irréversible.
      </ConfirmDialog>
    </>
  );
}
