import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, FilePlus2, KeyRound, LogIn, ShieldCheck, Upload } from "lucide-react";
import { DocumentFields, EMPTY_META, validateMeta, type MetaErrors } from "../components/contribute/DocumentFields";
import { FileDropzone } from "../components/contribute/FileDropzone";
import { PHASE_LABEL, useUpload } from "../components/contribute/useUpload";
import { Button, ButtonLink } from "../components/ui/Button";
import { Alert, ProgressBar, Skeleton, SuccessMark } from "../components/ui/Feedback";
import { PasswordInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/DocumentsContext";
import { useToast } from "../context/ToastContext";
import { ApiError, errorMessage } from "../lib/api";
import { usePageTitle } from "../lib/usePageTitle";
import type { DocumentMetadata, LibraryDocument } from "../types";

function PageHeader() {
  return (
    <section className="w-full min-w-0 max-w-full overflow-hidden">
      <div className="page-head">
        <p className="eyebrow !text-accent">Contributeurs autorisés</p>
        <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl break-words max-w-full">Publier un document</h1>
        <p className="mt-2 max-w-2xl text-ink-muted break-words max-w-full">
          La publication directe rend le document immédiatement visible dans la
          bibliothèque. Elle est réservée aux personnes disposant du mot de passe
          contributeur remis par l'administration.
        </p>
      </div>
    </section>
  );
}

export default function Ajouter() {
  usePageTitle("Publier un document");
  const { status, openAuth, reloadProfile } = useAuth();
  const { add } = useLibrary();
  const toast = useToast();
  const navigate = useNavigate();
  const upload = useUpload("/api/document", true);

  const [meta, setMeta] = useState<DocumentMetadata>(EMPTY_META);
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<MetaErrors & { password?: string; file?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [published, setPublished] = useState<LibraryDocument | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (upload.busy) return;
    const next = {
      ...validateMeta(meta),
      password: password ? "" : "Saisissez le mot de passe contributeur.",
      file: file ? "" : "Ajoutez le fichier à publier.",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setFailure("Quelques informations sont manquantes ou à corriger.");
      return;
    }
    setFailure(null);
    try {
      const res = await upload.run<{ document: LibraryDocument; message: string }>(
        { ...meta, matiere: meta.matiere.trim(), password },
        file!,
      );
      add(res.document);
      setPublished(res.document);
      setPassword("");
      toast.success("Document publié", res.document.title);
      reloadProfile().catch(() => undefined);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      if (err instanceof ApiError && err.field === "password") {
        setErrors((x) => ({ ...x, password: err.message }));
      }
      setFailure(errorMessage(err));
    }
  };

  const reset = () => {
    setMeta(EMPTY_META);
    setFile(null);
    setErrors({});
    setPublished(null);
  };

  if (status === "loading") {
    return (
      <div className="pb-8 w-full min-w-0 max-w-full">
        <PageHeader />
        <div className="container-page mt-6 max-w-3xl w-full min-w-0" role="status" aria-label="Chargement…">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <div className="pb-8 w-full min-w-0 max-w-full">
        <PageHeader />
        <div className="container-page mt-6 w-full min-w-0">
          <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2 min-w-0">
            <div className="rounded-3xl border border-line bg-card p-6 shadow-card sm:p-8 min-w-0 max-w-full overflow-hidden">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <ShieldCheck className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold break-words">Vous êtes contributeur autorisé ?</h2>
              <p className="mt-2 text-ink-muted break-words">
                Connectez-vous à votre compte : le formulaire de publication
                s'affichera ici.
              </p>
              <Button className="mt-6" icon={<LogIn className="h-4 w-4" />} onClick={() => openAuth("login", { reason: "Connectez-vous pour publier un document." })}>
                Se connecter
              </Button>
            </div>
            <div className="rounded-3xl border border-line bg-sunken p-6 sm:p-8 min-w-0 max-w-full overflow-hidden">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card text-accent">
                <FilePlus2 className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="mt-5 text-xl font-bold text-accent break-words">Sinon, proposez votre document</h2>
              <p className="mt-2 text-ink-soft break-words">
                Sans compte ni mot de passe : l'équipe le vérifie puis le publie.
              </p>
              <ButtonLink to="/proposer" variant="secondary" className="mt-6" iconRight={<ArrowRight className="h-4 w-4" />}>
                Proposer un document
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 w-full min-w-0 max-w-full overflow-hidden">
      <PageHeader />
      <div className="container-page mt-6 max-w-3xl w-full min-w-0">
        <AnimatePresence mode="wait">
          {published ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full max-w-full min-w-0 flex-col items-center rounded-3xl border border-line bg-card px-6 py-14 text-center shadow-card overflow-hidden"
              role="status"
            >
              <SuccessMark size={84} />
              <h2 className="mt-6 text-2xl font-extrabold break-words max-w-full">Document publié</h2>
              <p className="mt-2 max-w-md text-ink-muted break-words max-w-full overflow-hidden">
                « {published.title} » est maintenant disponible dans la bibliothèque.
              </p>
              <div className="mt-8 flex flex-col gap-2 sm:flex-row max-w-full">
                <Button icon={<Eye className="h-4 w-4" />} onClick={() => navigate(`/documents?doc=${published.id}`)}>
                  Voir le document
                </Button>
                <Button variant="outline" icon={<Upload className="h-4 w-4" />} onClick={reset}>
                  Publier un autre document
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              noValidate
              className="flex w-full max-w-full min-w-0 flex-col gap-6 rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8 overflow-hidden"
            >
              <fieldset className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden" disabled={upload.busy}>
                <legend className="sr-only">Informations du document</legend>
                <DocumentFields value={meta} onChange={setMeta} errors={errors} />
                <FileDropzone file={file} onChange={setFile} error={errors.file} disabled={upload.busy} />
                <PasswordInput
                  label="Mot de passe contributeur"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((x) => ({ ...x, password: "" }));
                  }}
                  error={errors.password}
                  hint="Remis par l'administration de la bibliothèque (différent de votre mot de passe de compte)."
                />
              </fieldset>

              <AnimatePresence>
                {upload.busy && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full min-w-0 max-w-full">
                    <ProgressBar
                      value={upload.phase === "uploading" ? upload.progress : upload.phase === "finalizing" ? 1 : 0.02}
                      label={PHASE_LABEL[upload.phase]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>{failure && !upload.busy && <Alert tone="error" title="Le document n'a pas été publié">{failure}</Alert>}</AnimatePresence>

              <div className="flex w-full min-w-0 max-w-full flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-ink-muted min-w-0 max-w-full break-words">
                  <KeyRound className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 break-words">
                    Pas de mot de passe ? <Link to="/proposer" className="font-semibold text-accent hover:underline">Proposez le document</Link>
                  </span>
                </p>
                <Button type="submit" size="lg" loading={upload.busy} loadingText="Publication…" icon={<Upload className="h-4 w-4" />} className="shrink-0">
                  Publier le document
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
