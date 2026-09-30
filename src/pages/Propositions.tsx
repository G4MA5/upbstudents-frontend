import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ClipboardCheck, ExternalLink, Inbox, LogIn, RefreshCw, ShieldAlert, X } from "lucide-react";
import { DocumentFields, validateMeta, type MetaErrors } from "../components/contribute/DocumentFields";
import { CategoryChip } from "../components/documents/category";
import { Button } from "../components/ui/Button";
import { Alert, EmptyState, Skeleton } from "../components/ui/Feedback";
import { PasswordInput, Textarea } from "../components/ui/Field";
import { Modal } from "../components/ui/Modal";
import { useAuth } from "../context/AuthContext";
import { useLibrary } from "../context/DocumentsContext";
import { useToast } from "../context/ToastContext";
import { api, ApiError, errorMessage } from "../lib/api";
import { formatBytes, formatDate } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";
import type { DocumentMetadata, LibraryDocument } from "../types";

interface Proposal extends DocumentMetadata {
  id: number;
  created_at: string;
  nom: string;
  email: string;
  description?: string;
  fichier_nom?: string;
  fichier_taille?: number;
  file_url: string | null;
}

function PublishDialog({
  proposal,
  onClose,
  onDone,
}: {
  proposal: Proposal | null;
  onClose: () => void;
  onDone: (id: number, doc: LibraryDocument) => void;
}) {
  const [meta, setMeta] = useState<DocumentMetadata | null>(null);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<MetaErrors & { password?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!proposal) return;
    const { filiere, type, annee, niveau, matiere, session } = proposal;
    setMeta({ filiere, type, annee, niveau, matiere, session: session || "" });
    setErrors({});
    setFailure(null);
  }, [proposal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !meta || loading) return;
    const found = { ...validateMeta(meta), password: password ? "" : "Saisissez le mot de passe contributeur." };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setLoading(true);
    setFailure(null);
    try {
      const res = await api<{ document: LibraryDocument }>("/api/propositions", {
        auth: true,
        timeoutMs: 30000,
        body: { action: "publier", id: proposal.id, password, ...meta },
      });
      onDone(proposal.id, res.document);
      setPassword("");
    } catch (err) {
      if (err instanceof ApiError && err.field === "password") setErrors((x) => ({ ...x, password: err.message }));
      else setFailure(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={Boolean(proposal)}
      onClose={() => !loading && onClose()}
      size="lg"
      title="Publier ce document"
      description="Vérifiez et corrigez si besoin les informations avant publication."
    >
      {meta && (
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          <AnimatePresence>{failure && <Alert tone="error" title="Publication impossible">{failure}</Alert>}</AnimatePresence>
          <DocumentFields value={meta} onChange={setMeta} errors={errors} />
          <PasswordInput
            label="Mot de passe contributeur"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" loading={loading} loadingText="Publication…" icon={<Check className="h-4 w-4" />}>
              Publier dans la bibliothèque
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

function RefuseDialog({
  proposal,
  onClose,
  onDone,
}: {
  proposal: Proposal | null;
  onClose: () => void;
  onDone: (id: number) => void;
}) {
  const [motif, setMotif] = useState("");
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMotif("");
    setFailure(null);
  }, [proposal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || loading) return;
    setLoading(true);
    try {
      await api("/api/propositions", { auth: true, body: { action: "refuser", id: proposal.id, motif } });
      onDone(proposal.id);
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={Boolean(proposal)}
      onClose={() => !loading && onClose()}
      size="md"
      title="Refuser la proposition"
      description="Le contributeur en sera informé par e-mail. Le fichier sera supprimé."
    >
      <form onSubmit={submit} className="flex flex-col gap-5">
        <AnimatePresence>{failure && <Alert tone="error" title="Action impossible">{failure}</Alert>}</AnimatePresence>
        <Textarea
          label="Motif"
          optional
          placeholder="Ex. : document illisible, déjà présent dans la bibliothèque…"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          maxLength={300}
        />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="submit" variant="danger" loading={loading} loadingText="Envoi…" icon={<X className="h-4 w-4" />}>
            Refuser
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function Propositions() {
  usePageTitle("Propositions à valider");
  const { status, profile, openAuth } = useAuth();
  const { add } = useLibrary();
  const toast = useToast();
  const [items, setItems] = useState<Proposal[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<Proposal | null>(null);
  const [refusing, setRefusing] = useState<Proposal | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      const res = await api<{ propositions: Proposal[]; disponible: boolean; message?: string }>("/api/propositions", { auth: true });
      setItems(res.propositions);
      setNotice(res.disponible ? null : res.message ?? null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && profile?.proprietaire) load();
  }, [status, profile?.proprietaire, load]);

  const header = (
    <section>
      <div className="page-head">
        <p className="eyebrow !text-accent">Administration</p>
        <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">Propositions à valider</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Les documents proposés ne sont pas visibles tant qu'ils n'ont pas été vérifiés et publiés.
        </p>
      </div>
    </section>
  );

  if (status === "loading") {
    return (
      <div className="pb-8">
        {header}
        <div className="container-page mt-6 space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      </div>
    );
  }

  if (status === "anonymous") {
    return (
      <div className="pb-8">
        {header}
        <div className="container-page mt-6 max-w-2xl">
          <EmptyState icon={<LogIn className="h-6 w-6" />} title="Connexion requise" action={<Button onClick={() => openAuth("login")}>Se connecter</Button>}>
            Cet espace est réservé aux contributeurs autorisés.
          </EmptyState>
        </div>
      </div>
    );
  }

  if (!profile?.proprietaire) {
    return (
      <div className="pb-8">
        {header}
        <div className="container-page mt-6 max-w-2xl">
          <EmptyState icon={<ShieldAlert className="h-6 w-6" />} title="Espace réservé">
            Seuls les contributeurs autorisés peuvent examiner les propositions.
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {header}
      <div className="container-page mt-6">
        {notice && <div className="mb-6"><Alert tone="info" title="Information">{notice}</Alert></div>}
        {error ? (
          <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Chargement impossible" action={<Button onClick={load}>Réessayer</Button>}>
            {error}
          </EmptyState>
        ) : items === null ? (
          <div className="space-y-3" role="status" aria-label="Chargement…">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-36 rounded-3xl" />)}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title="Aucune proposition en attente">
            Les nouvelles propositions apparaîtront ici. Vous êtes aussi prévenu par e-mail.
          </EmptyState>
        ) : (
          <ul className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {items.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                  className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryChip type={p.type} />
                        <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs font-semibold text-accent">{p.filiere}</span>
                        <span className="text-xs text-ink-faint">#{p.id} · reçu le {formatDate(p.created_at)}</span>
                      </div>
                      <h2 className="mt-2 font-sans text-lg font-semibold">{p.matiere}</h2>
                      <p className="text-sm text-ink-muted">{[p.niveau, p.annee, p.session].filter(Boolean).join(" · ")}</p>
                      <p className="mt-2 text-sm text-ink-soft">
                        Proposé par <strong>{p.nom}</strong> ({p.email})
                      </p>
                      {p.description && (
                        <p className="mt-2 whitespace-pre-wrap rounded-xl bg-canvas p-3 text-sm text-ink-soft">{p.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 lg:flex-col lg:items-stretch">
                      {p.file_url && (
                        <a
                          href={p.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line-strong px-4 text-[15px] font-semibold text-ink-soft hover:bg-canvas"
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden /> Ouvrir le fichier
                          {p.fichier_taille ? <span className="font-normal text-ink-faint">({formatBytes(p.fichier_taille)})</span> : null}
                        </a>
                      )}
                      <Button icon={<ClipboardCheck className="h-4 w-4" />} onClick={() => setPublishing(p)}>
                        Publier
                      </Button>
                      <Button variant="ghost" className="text-red-600 hover:bg-red-500/10 hover:text-red-700" onClick={() => setRefusing(p)}>
                        Refuser
                      </Button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      <PublishDialog
        proposal={publishing}
        onClose={() => setPublishing(null)}
        onDone={(id, doc) => {
          add(doc);
          setItems((list) => list?.filter((p) => p.id !== id) ?? null);
          setPublishing(null);
          toast.success("Document publié", doc.title);
        }}
      />
      <RefuseDialog
        proposal={refusing}
        onClose={() => setRefusing(null)}
        onDone={(id) => {
          setItems((list) => list?.filter((p) => p.id !== id) ?? null);
          setRefusing(null);
          toast.info("Proposition refusée", "Elle a été retirée de la file de validation.");
        }}
      />
    </div>
  );
}
