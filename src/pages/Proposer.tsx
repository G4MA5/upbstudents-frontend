import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FilePlus2, Mail, Send, ShieldCheck, UserRound } from "lucide-react";
import { DocumentFields, EMPTY_META, validateMeta, type MetaErrors } from "../components/contribute/DocumentFields";
import { FileDropzone } from "../components/contribute/FileDropzone";
import { PHASE_LABEL, useUpload } from "../components/contribute/useUpload";
import { Button, ButtonLink } from "../components/ui/Button";
import { Alert, ProgressBar, SuccessMark } from "../components/ui/Feedback";
import { Honeypot, Input, Textarea } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../lib/api";
import { validateEmail } from "../lib/validation";
import { useSeoHead } from "../lib/useSeoHead";
import type { DocumentMetadata } from "../types";

const STEPS = [
  { icon: Send, title: "Vous proposez", text: "Remplissez les informations et joignez le fichier." },
  { icon: ShieldCheck, title: "L'équipe vérifie", text: "Le document est examiné avant toute publication." },
  { icon: CheckCircle2, title: "Publication", text: "Une fois validé, il rejoint la bibliothèque." },
];

export default function Proposer() {
  useSeoHead();
  const { status, profile } = useAuth();
  const toast = useToast();
  const upload = useUpload("/api/proposer", "optional");

  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [meta, setMeta] = useState<DocumentMetadata>(EMPTY_META);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<MetaErrors & { nom?: string; email?: string; file?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  // Signed-in users do not retype their identity.
  useEffect(() => {
    if (profile) {
      setNom((v) => v || [profile.prenom, profile.nom].filter(Boolean).join(" "));
      setEmail((v) => v || profile.email);
    }
  }, [profile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (upload.busy) return;
    const next = {
      ...validateMeta(meta),
      nom: nom.trim() ? "" : "Indiquez votre nom.",
      email: validateEmail(email),
      file: file ? "" : "Ajoutez le fichier à proposer.",
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setFailure("Quelques informations sont manquantes ou à corriger.");
      // After React has rendered the error states.
      requestAnimationFrame(() =>
        document.querySelector("[aria-invalid='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }),
      );
      return;
    }
    setFailure(null);
    try {
      const res = await upload.run<{ message: string; confirmation_envoyee?: boolean }>(
        { ...meta, nom: nom.trim(), email: email.trim().toLowerCase(), description, website },
        file!,
      );
      setDone(res.message);
      setConfirmationSent(Boolean(res.confirmation_envoyee));
      toast.success("Proposition envoyée", "Merci pour votre contribution !");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFailure(errorMessage(err));
      toast.error("Envoi impossible", errorMessage(err));
    }
  };

  const reset = () => {
    setMeta(EMPTY_META);
    setDescription("");
    setFile(null);
    setErrors({});
    setDone(null);
  };

  return (
    <div className="pb-8">
      <section>
        <div className="page-head">
          <p className="eyebrow !text-accent">Contribuer</p>
          <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">Proposer un document</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Un sujet d'examen, une fiche de TD, un TP ou un livre utile ? Envoyez-le :
            l'équipe de la bibliothèque le vérifie avant de le publier.
          </p>
          <ol className="mt-8 grid gap-3 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-4 shadow-card">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">
                    {i + 1}. {title}
                  </span>
                  <span className="block text-sm text-ink-muted">{text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-page mt-6 grid gap-8 lg:grid-cols-[1fr_320px] w-full min-w-0 max-w-full">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex w-full max-w-full min-w-0 flex-col items-center rounded-3xl border border-line bg-card px-6 py-14 text-center shadow-card overflow-hidden"
              role="status"
            >
              <SuccessMark size={84} />
              <h2 className="mt-6 text-2xl font-extrabold break-words max-w-full">Merci pour votre contribution !</h2>
              <p className="mt-2 max-w-md text-ink-muted break-words max-w-full">{done}</p>
              {confirmationSent && (
                <p className="mt-2 max-w-md text-sm text-ink-faint break-words max-w-full">
                  Un e-mail de confirmation vous a été envoyé à {email}.
                </p>
              )}
              <div className="mt-8 flex flex-col gap-2 sm:flex-row max-w-full">
                <Button onClick={reset} icon={<FilePlus2 className="h-4 w-4" />}>
                  Proposer un autre document
                </Button>
                <ButtonLink to="/documents" variant="outline">
                  Parcourir les documents
                </ButtonLink>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={submit}
              noValidate
              className="relative flex w-full max-w-full min-w-0 flex-col gap-8 rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8 overflow-hidden"
            >
              <Honeypot value={website} onChange={setWebsite} />
              <fieldset className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden" disabled={upload.busy}>
                <legend className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <UserRound className="h-5 w-5 text-brand-600 shrink-0" aria-hidden /> Vos coordonnées
                </legend>
                <div className="grid gap-4 sm:grid-cols-2 w-full min-w-0">
                  <Input
                    label="Nom complet"
                    autoComplete="name"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    error={errors.nom}
                  />
                  <Input
                    label="Adresse e-mail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    icon={<Mail className="h-[18px] w-[18px]" />}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                    hint="Pour vous informer de la publication."
                  />
                </div>
              </fieldset>

              <fieldset className="flex w-full min-w-0 max-w-full flex-col gap-4 overflow-hidden" disabled={upload.busy}>
                <legend className="mb-4 flex items-center gap-2 text-lg font-bold">
                  <FilePlus2 className="h-5 w-5 text-brand-600 shrink-0" aria-hidden /> Le document
                </legend>
                <DocumentFields value={meta} onChange={setMeta} errors={errors} />
                <Textarea
                  label="Description"
                  optional
                  placeholder="Contexte, corrigé inclus, remarques pour l'équipe…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                />
                <FileDropzone file={file} onChange={setFile} error={errors.file} disabled={upload.busy} />
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
              <AnimatePresence>{failure && !upload.busy && <Alert tone="error" title="La proposition n'a pas été envoyée">{failure}</Alert>}</AnimatePresence>

              <div className="flex w-full min-w-0 max-w-full flex-col-reverse items-stretch gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink-muted min-w-0 break-words">
                  Le document ne sera <strong className="text-ink">pas publié</strong> avant vérification.
                </p>
                <Button type="submit" size="lg" loading={upload.busy} loadingText="Envoi en cours…" icon={<Send className="h-4 w-4" />} className="shrink-0">
                  Envoyer ma proposition
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <aside className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-canvas p-5">
            <h2 className="text-base font-bold">Conseils</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li>• Un fichier lisible (PDF de préférence), bien cadré.</li>
              <li>• Une matière précise pour faciliter la recherche.</li>
              <li>• Le bon niveau, la bonne année et la session s'il s'agit d'un examen.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-line bg-sunken p-5">
            <h2 className="text-base font-bold text-accent">Contributeur autorisé ?</h2>
            <p className="mt-1.5 text-sm text-ink-soft">
              Si l'administration vous a remis le mot de passe contributeur, vous
              pouvez publier directement.
            </p>
            <Link to="/ajouter" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              Publication directe <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          {status === "anonymous" && (
            <p className="px-1 text-sm text-ink-muted">
              Aucun compte n'est nécessaire pour proposer un document.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
