import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Ban,
  Clock,
  Copy,
  Eye,
  History,
  Inbox,
  LogIn,
  Megaphone,
  RefreshCw,
  Send,
  ShieldAlert,
  ImagePlus,
  Smile,
  Trash2,
  Users,
} from "lucide-react";
import { Chip } from "../components/documents/FilterBar";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Alert, Badge, EmptyState, ProgressBar, Skeleton } from "../components/ui/Feedback";
import { Textarea } from "../components/ui/Field";
import { Switch } from "../components/ui/Switch";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../lib/api";
import { prepareImage, prepareSticker, type MediaKind, type PreparedMedia } from "../lib/media";
import {
  cancelCampaign,
  describeTarget,
  errorLabel,
  fetchCampaign,
  fetchHistory,
  isFinished,
  previewAudience,
  progressOf,
  sendBroadcast,
  STATUS_LABEL,
  TYPE_LABEL,
  type BroadcastOptions,
  type BroadcastTarget,
  type FailedNumber,
  type Campaign,
  type Preview,
} from "../lib/broadcast";
import { formatDateTime, plural } from "../lib/format";
import { fadeUp } from "../lib/motion";
import { useBroadcastAccess } from "../lib/useBroadcastAccess";
import { usePageTitle } from "../lib/usePageTitle";

const CARD = "rounded-3xl border border-line bg-card p-5 shadow-card sm:p-6";
const POLL_MS = 6000;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `diff-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function parseEmails(text: string) {
  return [...new Set(text.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")))];
}

function StatusBadge({ campaign }: { campaign: Campaign }) {
  const s = STATUS_LABEL[campaign.statut];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

// ---------- Divine : liste des numéros en échec ----------
// Visible dès qu'au moins un message a échoué : nom, numéro et raison,
// avec un bouton pour copier la liste (à corriger ou à contacter autrement).
function FailureList({ campaign }: { campaign: Campaign }) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const list: FailedNumber[] = campaign.echecsDetail ?? [];
  if (campaign.echecs <= 0) return null;

  if (list.length === 0) {
    return <p className="mt-3 text-sm text-ink-muted">Le détail des numéros en échec n'est pas disponible pour cette diffusion.</p>;
  }

  const reason = (r: string) => errorLabel(r);
  const copy = async () => {
    const text = list.map((f) => [f.nom, f.numero, reason(f.raison)].filter(Boolean).join(" · ")).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Liste copiée", `${plural(list.length, "numéro copié", "numéros copiés")}.`);
    } catch {
      toast.error("Copie impossible", "Sélectionnez la liste à la main.");
    }
  };

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-[13px] font-semibold text-accent hover:underline"
      >
        {open ? "Masquer" : "Voir"} les {plural(list.length, "numéro en échec", "numéros en échec")}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div {...fadeUp} className="mt-2 rounded-2xl bg-canvas p-3">
            <ul className="divide-y divide-line text-sm">
              {list.map((f, i) => (
                <li key={`${f.numero}-${i}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
                  <span className="min-w-0 truncate font-medium text-ink-soft">{f.nom || "Sans nom"}</span>
                  <span className="flex items-center gap-2">
                    <span className="tabular-nums text-ink">{f.numero}</span>
                    <Badge tone="danger">{reason(f.raison)}</Badge>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex justify-end">
              <Button variant="ghost" size="sm" icon={<Copy className="h-4 w-4" />} onClick={copy}>
                Copier la liste
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
// ---------- Divine : fin ----------

// ---------------------------------------------------------------------------
// Progression d'une diffusion (suivie en direct tant qu'elle est en cours)

function CampaignProgress({
  campaign,
  onUpdate,
  onNew,
}: {
  campaign: Campaign;
  onUpdate: (c: Campaign) => void;
  onNew?: () => void;
}) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const running = campaign.statut === "en_cours";

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(async () => {
      try {
        onUpdate((await fetchCampaign(campaign.id)).campagne);
      } catch {
        // Réseau instable : on réessaiera au prochain passage.
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [running, campaign.id, onUpdate]);

  const cancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelCampaign(campaign.id);
      onUpdate(res.campagne);
      setConfirming(false);
      toast.info("Diffusion annulée", "Les messages non partis ont été retirés.");
    } catch (err) {
      setConfirming(false);
      setFailure(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  const errors = Object.entries(campaign.erreurs ?? {});

  return (
    <section className={CARD} aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold">Diffusion</h2>
          <StatusBadge campaign={campaign} />
        </div>
        <p className="text-xs text-ink-faint">Lancée le {formatDateTime(campaign.creeLe)}</p>
      </div>

      <div className="mt-5">
        <ProgressBar
          value={progressOf(campaign)}
          label={running ? "Envoi en cours…" : STATUS_LABEL[campaign.statut].label}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Destinataires", value: campaign.total },
          { label: "Envoyés", value: campaign.envoyes, tone: "text-emerald-600" },
          { label: "Restants", value: campaign.restants },
          { label: "Échecs", value: campaign.echecs, tone: campaign.echecs ? "text-red-600" : "" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-sunken p-3">
            <dt className="text-xs font-medium text-ink-muted">{s.label}</dt>
            <dd className={`mt-0.5 text-2xl font-extrabold tabular-nums ${s.tone ?? ""}`}>{s.value.toLocaleString("fr-FR")}</dd>
          </div>
        ))}
      </dl>

      {campaign.annules > 0 && (
        <p className="mt-3 text-sm text-ink-muted">{plural(campaign.annules, "message annulé", "messages annulés")}.</p>
      )}
      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
          {errors.map(([key, n]) => (
            <li key={key}>
              {errorLabel(key)} : <strong className="text-ink-soft">{typeof n === "number" ? n : String(n)}</strong>
            </li>
          ))}
        </ul>
      )}
      <FailureList campaign={campaign} />

      <AnimatePresence>{failure && <div className="mt-4"><Alert tone="error" title="Action impossible">{failure}</Alert></div>}</AnimatePresence>

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {running ? (
          <Button variant="outline" icon={<Ban className="h-4 w-4" />} onClick={() => setConfirming(true)}>
            Annuler la diffusion
          </Button>
        ) : (
          onNew && (
            <Button icon={<Megaphone className="h-4 w-4" />} onClick={onNew}>
              Nouvelle diffusion
            </Button>
          )
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Annuler la diffusion ?"
        confirmLabel="Annuler la diffusion"
        loadingText="Annulation…"
        loading={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirming(false)}
      >
        Les messages déjà envoyés ne peuvent pas être repris. Seuls ceux qui n'ont pas encore été envoyés seront retirés.
      </ConfirmDialog>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Onglet « Nouvelle diffusion »

function NewBroadcast({ options, onSent }: { options: BroadcastOptions; onSent: () => void }) {
  const toast = useToast();
  const filieres = options.filieres ?? [];
  const niveaux = options.niveaux ?? [];
  const maxLength = options.longueurMax ?? 1500;

  const [selFilieres, setSelFilieres] = useState<string[]>([]);
  const [selNiveaux, setSelNiveaux] = useState<string[]>([]);
  const [contributeurs, setContributeurs] = useState(false);
  const [emailsText, setEmailsText] = useState("");
  const [message, setMessage] = useState("");
  // Divine : pièce jointe facultative (sticker ou image)
  const [media, setMedia] = useState<PreparedMedia | null>(null);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const pickKind = useRef<MediaKind>("sticker");

  const [preview, setPreview] = useState<Preview | null>(null);
  const [checking, setChecking] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  // Même identifiant tant que le formulaire n'est pas vidé : un double clic ne lance qu'une diffusion.
  const campaignId = useRef(newId());
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const target = useMemo<BroadcastTarget>(
    () => ({ filieres: selFilieres, niveaux: selNiveaux, contributeurs, emails: parseEmails(emailsText) }),
    [selFilieres, selNiveaux, contributeurs, emailsText],
  );

  // Toute modification invalide l'aperçu : le nombre confirmé doit correspondre à la cible actuelle.
  useEffect(() => setPreview(null), [target, message, media]);

  // ---------- Divine : pièce jointe (sticker ou image) ----------
  const releaseMedia = (m: PreparedMedia | null) => {
    if (m) URL.revokeObjectURL(m.previewUrl);
  };
  const choose = (kind: MediaKind) => {
    pickKind.current = kind;
    setMediaError(null);
    fileInput.current?.click();
  };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de rechoisir le même fichier
    if (!file) return;
    setMediaBusy(true);
    setMediaError(null);
    try {
      const next = pickKind.current === "sticker" ? await prepareSticker(file) : await prepareImage(file);
      setMedia((old) => {
        releaseMedia(old);
        return next;
      });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : "Fichier impossible à préparer.");
    } finally {
      setMediaBusy(false);
    }
  };
  const removeMedia = () => {
    releaseMedia(media);
    setMedia(null);
    setMediaError(null);
  };
  // ---------- Divine : fin ----------

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);

  const insert = (token: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? message.length;
    const end = el?.selectionEnd ?? message.length;
    const next = message.slice(0, start) + token + message.slice(end);
    if (next.length > maxLength) return;
    setMessage(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const check = async () => {
    setChecking(true);
    setFailure(null);
    try {
      setPreview(await previewAudience(target));
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  // Divine : le texte est facultatif quand il y a un sticker ou une image (mais s'il existe, 5 caractères minimum).
  const textLength = message.trim().length;
  const messageTooShort = media ? textLength > 0 && textLength < 5 : textLength < 5;
  const canSend = Boolean(preview && preview.total > 0 && !preview.depasseLimite && !messageTooShort);

  const send = async () => {
    if (!preview) return;
    setSending(true);
    try {
      const res = await sendBroadcast({
        message: message.trim(),
        media: media ? { type: media.type, data: media.data } : undefined, // Divine
        cible: target,
        confirmer: preview.total,
        campagneId: campaignId.current,
      });
      setConfirming(false);
      if (res.campagne.statut === "echec") {
        campaignId.current = newId();
        // Divine : on affiche la vraie raison enregistrée par le serveur quand elle existe.
        const reason = res.campagne.erreurs?.raison;
        setFailure(
          `Le service WhatsApp n'a pas accepté la diffusion${typeof reason === "string" && reason ? ` : ${reason}` : ""}. Réessayez dans quelques instants.`,
        );
        return;
      }
      setCampaign(res.campagne);
      toast.success("Diffusion lancée", "Les messages partent progressivement.");
      onSent();
    } catch (err) {
      setConfirming(false);
      setFailure(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const reset = () => {
    setCampaign(null);
    setPreview(null);
    setMessage("");
    releaseMedia(media);
    setMedia(null);
    setSelFilieres([]);
    setSelNiveaux([]);
    setContributeurs(false);
    setEmailsText("");
    campaignId.current = newId();
  };

  const sample = preview?.exemples[0]?.prenom || "Awa";
  const shown = message.trim().replace(/\{prenom\}/g, sample).replace(/\{nom\}/g, "Koné");

  if (campaign) {
    return <CampaignProgress campaign={campaign} onUpdate={setCampaign} onNew={isFinished(campaign) ? reset : undefined} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <div className="flex flex-col gap-6">
        <AnimatePresence>
          {failure && <Alert tone="error" title="Action impossible">{failure}</Alert>}
        </AnimatePresence>

        <section className={CARD} aria-labelledby="cible">
          <h2 id="cible" className="text-lg font-bold">Qui doit recevoir le message ?</h2>
          <p className="mt-1 text-sm text-ink-muted">Sans choix, le message est envoyé à tous les étudiants inscrits avec un numéro valide.</p>

          <div className="mt-5 space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-ink-soft">Filières</p>
              <div className="flex flex-wrap gap-2">
                {filieres.map((f) => (
                  <Chip key={f} active={selFilieres.includes(f)} onClick={() => toggle(selFilieres, setSelFilieres, f)}>
                    {f}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-ink-soft">Niveaux</p>
              <div className="flex flex-wrap gap-2">
                {niveaux.map((n) => (
                  <Chip key={n} active={selNiveaux.includes(n)} onClick={() => toggle(selNiveaux, setSelNiveaux, n)}>
                    {n}
                  </Chip>
                ))}
              </div>
            </div>
            <Switch checked={contributeurs} onChange={() => setContributeurs((v) => !v)} label="Contributeurs autorisés seulement" />
            <Textarea
              label="Liste d'e-mails précise"
              optional
              hint="Un e-mail par ligne ou séparés par des virgules. Utile pour tester sur quelques personnes."
              placeholder="prenom.nom@exemple.com"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              className="!min-h-[88px]"
            />
          </div>
        </section>

        <section className={CARD} aria-labelledby="message">
          <h2 id="message" className="text-lg font-bold">Message</h2>
          <div className="mt-4">
            <Textarea
              ref={textareaRef}
              label="Texte de l'annonce"
              placeholder="Bonjour {prenom}, de nouveaux sujets d'examen sont disponibles sur la bibliothèque !"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={maxLength}
              className="!min-h-[160px]"
              hint={`${message.length.toLocaleString("fr-FR")} / ${maxLength.toLocaleString("fr-FR")} caractères · *gras* et _italique_ fonctionnent sur WhatsApp.`}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-muted">Insérer :</span>
            <Chip active={false} onClick={() => insert("{prenom}")}>{"{prenom}"}</Chip>
            <Chip active={false} onClick={() => insert("{nom}")}>{"{nom}"}</Chip>
          </div>

          {/* ---------- Divine : pièce jointe (sticker ou image) ---------- */}
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-sm font-medium text-ink-soft">
              Pièce jointe <span className="font-normal text-ink-faint">(facultatif)</span>
            </p>
            <input ref={fileInput} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" icon={<Smile className="h-4 w-4" />} loading={mediaBusy} loadingText="Préparation…" onClick={() => choose("sticker")}>
                {media?.type === "sticker" ? "Changer le sticker" : "Ajouter un sticker"}
              </Button>
              <Button variant="outline" size="sm" icon={<ImagePlus className="h-4 w-4" />} disabled={mediaBusy} onClick={() => choose("image")}>
                {media?.type === "image" ? "Changer l'image" : "Ajouter une image"}
              </Button>
              {media && (
                <Button variant="ghost" size="sm" icon={<Trash2 className="h-4 w-4" />} onClick={removeMedia}>
                  Retirer
                </Button>
              )}
            </div>
            <AnimatePresence>{mediaError && <div className="mt-3"><Alert tone="error">{mediaError}</Alert></div>}</AnimatePresence>
            {!media && !mediaError && (
              <p className="mt-2 text-[13px] text-ink-muted">
                Un sticker est créé automatiquement à partir de n'importe quelle image (512 × 512). Avec une image, votre texte devient sa légende.
              </p>
            )}
            {media && (
              <div className="mt-3 flex items-center gap-4 rounded-2xl bg-sunken p-3">
                <img
                  src={media.previewUrl}
                  alt={media.type === "sticker" ? "Aperçu du sticker" : "Aperçu de l'image"}
                  className={media.type === "sticker" ? "h-24 w-24 rounded-xl bg-card object-contain" : "h-24 w-32 rounded-xl bg-card object-cover"}
                />
                <div className="min-w-0 text-sm">
                  <p className="font-semibold text-ink-soft">{media.type === "sticker" ? "Sticker" : "Image"} · {Math.max(1, Math.round(media.size / 1024))} Ko</p>
                  <p className="mt-0.5 text-[13px] text-ink-muted">
                    {media.type === "sticker"
                      ? message.trim()
                        ? "Il part dans un second message, juste après le texte."
                        : "Le sticker sera envoyé seul."
                      : "Votre texte sert de légende à l'image."}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* ---------- Divine : fin ---------- */}

          {(shown || media) && (
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-ink-soft">Aperçu pour {sample}</p>
              <div className="space-y-2">
                {media?.type === "image" && (
                  <img src={media.previewUrl} alt="" className="max-h-56 w-auto max-w-full rounded-2xl rounded-tl-md" />
                )}
                {shown && (
                  <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md bg-sunken p-4 text-[15px] text-ink-soft">{shown}</div>
                )}
                {media?.type === "sticker" && <img src={media.previewUrl} alt="" className="h-28 w-28 object-contain" />}
              </div>
            </div>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-[calc(var(--topbar-h)+16px)]">
        <section className={CARD} aria-labelledby="destinataires">
          <h2 id="destinataires" className="flex items-center gap-2 text-lg font-bold">
            <Users className="h-5 w-5 text-accent" aria-hidden /> Destinataires
          </h2>
          <p className="mt-1 text-sm text-ink-muted">{describeTarget(target)}</p>

          <Button variant="outline" className="mt-4 w-full" icon={<Eye className="h-4 w-4" />} loading={checking} loadingText="Calcul…" onClick={check}>
            {preview ? "Recalculer" : "Vérifier les destinataires"}
          </Button>

          <AnimatePresence initial={false}>
            {preview && (
              <motion.div {...fadeUp} className="mt-5">
                <p className="text-4xl font-extrabold tabular-nums text-accent">{preview.total.toLocaleString("fr-FR")}</p>
                <p className="text-sm text-ink-soft">{preview.total > 1 ? "personnes recevront" : "personne recevra"} le message</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
                  <Clock className="h-4 w-4" aria-hidden /> Durée estimée : environ {Math.max(1, preview.dureeEstimeeMinutes)} min
                </p>
                {preview.sansNumero > 0 && (
                  <p className="mt-1 text-sm text-ink-muted">{plural(preview.sansNumero, "personne n'a", "personnes n'ont")} pas de numéro valide.</p>
                )}
                {/* ---------- Divine : seuls les étudiants qui ont accepté WhatsApp reçoivent la diffusion ---------- */}
                {(preview.sansConsentement ?? 0) > 0 && (
                  <p className="mt-1 text-sm text-ink-muted">
                    {plural(preview.sansConsentement ?? 0, "personne n'a", "personnes n'ont")} pas accepté les notifications WhatsApp : {preview.sansConsentement === 1 ? "elle est exclue" : "elles sont exclues"}.
                  </p>
                )}
                {/* ---------- Divine : fin ---------- */}
                {preview.exemples.length > 0 && (
                  <ul className="mt-3 space-y-1.5 rounded-2xl bg-sunken p-3 text-sm">
                    {preview.exemples.map((e, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium text-ink-soft">{e.prenom || "—"} <span className="font-normal text-ink-faint">{e.filiere}</span></span>
                        <span className="shrink-0 tabular-nums text-ink-muted">{e.numero}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {preview.depasseLimite && (
                  <div className="mt-3"><Alert tone="warning" title="Trop de destinataires">Affinez la cible (maximum {options.maxDestinataires?.toLocaleString("fr-FR")}).</Alert></div>
                )}
                {preview.tronque && (
                  <div className="mt-3"><Alert tone="warning">La liste a été tronquée : affinez la cible.</Alert></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button className="mt-5 w-full" icon={<Send className="h-4 w-4" />} disabled={!canSend} onClick={() => setConfirming(true)}>
            Envoyer la diffusion
          </Button>
          <p className="mt-2 text-center text-xs text-ink-faint">
            {!preview ? "Vérifiez d'abord les destinataires." : messageTooShort ? (media ? "Le texte doit faire 5 caractères minimum (ou le laisser vide)." : "Écrivez un message (5 caractères minimum).") : "Une confirmation vous sera demandée."}
          </p>
        </section>
      </aside>

      <ConfirmDialog
        open={confirming}
        tone="primary"
        title="Envoyer cette diffusion ?"
        confirmLabel="Envoyer"
        loadingText="Envoi…"
        loading={sending}
        onConfirm={send}
        onCancel={() => setConfirming(false)}
      >
        Le message{media ? (media.type === "sticker" ? " (avec un sticker)" : " (avec une image)") : ""} sera envoyé sur WhatsApp à <strong>{plural(preview?.total ?? 0, "personne", "personnes")}</strong> ({describeTarget(target)}). Cette action ne peut pas être reprise une fois les messages partis.
      </ConfirmDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onglet « Historique »

function HistoryItem({ campaign, onUpdate }: { campaign: Campaign; onUpdate: (c: Campaign) => void }) {
  const [open, setOpen] = useState(false);
  const running = campaign.statut === "en_cours";

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(async () => {
      try {
        onUpdate((await fetchCampaign(campaign.id)).campagne);
      } catch {
        // On réessaiera.
      }
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [running, campaign.id, onUpdate]);

  const long = campaign.message.length > 160;

  return (
    <motion.li layout {...fadeUp} className={CARD}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge campaign={campaign} />
        <Badge tone="brand">{TYPE_LABEL[campaign.type] ?? campaign.type}</Badge>
        {campaign.cible?.media && <Badge tone="navy">{campaign.cible.media === "sticker" ? "Avec sticker" : "Avec image"}</Badge>}
        <span className="text-xs text-ink-faint">{formatDateTime(campaign.creeLe)}</span>
      </div>
      <p className="mt-2 text-sm text-ink-soft">
        Par <strong>{campaign.admin}</strong> · {describeTarget(campaign.cible ?? {})}
      </p>

      <p className={`mt-3 whitespace-pre-wrap rounded-xl bg-canvas p-3 text-sm text-ink-soft ${open ? "" : "line-clamp-3"}`}>{campaign.message}</p>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 text-[13px] font-semibold text-accent hover:underline">
          {open ? "Réduire" : "Voir tout le message"}
        </button>
      )}

      {running && <div className="mt-4"><ProgressBar value={progressOf(campaign)} label="Envoi en cours…" /></div>}

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div><dt className="inline text-ink-muted">Destinataires : </dt><dd className="inline font-semibold tabular-nums">{campaign.total}</dd></div>
        <div><dt className="inline text-ink-muted">Envoyés : </dt><dd className="inline font-semibold tabular-nums text-emerald-600">{campaign.envoyes}</dd></div>
        {campaign.echecs > 0 && <div><dt className="inline text-ink-muted">Échecs : </dt><dd className="inline font-semibold tabular-nums text-red-600">{campaign.echecs}</dd></div>}
        {campaign.annules > 0 && <div><dt className="inline text-ink-muted">Annulés : </dt><dd className="inline font-semibold tabular-nums">{campaign.annules}</dd></div>}
        {running && <div><dt className="inline text-ink-muted">Restants : </dt><dd className="inline font-semibold tabular-nums">{campaign.restants}</dd></div>}
      </dl>
      <FailureList campaign={campaign} />
    </motion.li>
  );
}

function HistoryTab({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<Campaign[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setItems(null);
    try {
      const res = await fetchHistory(1);
      setItems(res.historique);
      setTotal(res.total);
      setPage(1);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const more = async () => {
    setLoadingMore(true);
    try {
      const res = await fetchHistory(page + 1);
      setItems((list) => [...(list ?? []), ...res.historique]);
      setTotal(res.total);
      setPage(page + 1);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const update = useCallback(
    (c: Campaign) => setItems((list) => list?.map((x) => (x.id === c.id ? c : x)) ?? null),
    [],
  );

  if (error && !items) {
    return (
      <EmptyState icon={<RefreshCw className="h-6 w-6" />} title="Chargement impossible" action={<Button onClick={load}>Réessayer</Button>}>
        {error}
      </EmptyState>
    );
  }
  if (items === null) {
    return (
      <div className="space-y-3" role="status" aria-label="Chargement…">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-3xl" />)}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <EmptyState icon={<Inbox className="h-6 w-6" />} title="Aucune diffusion pour le moment">
        Les annonces que vous enverrez apparaîtront ici, avec leur date, leur cible et leur état.
      </EmptyState>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-ink-muted">{plural(total, "diffusion", "diffusions")}</p>
        <Button variant="ghost" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={load}>
          Actualiser
        </Button>
      </div>
      <ul className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {items.map((c) => <HistoryItem key={c.id} campaign={c} onUpdate={update} />)}
        </AnimatePresence>
      </ul>
      {error && <div className="mt-4"><Alert tone="error">{error}</Alert></div>}
      {items.length < total && (
        <div className="mt-5 flex justify-center">
          <Button variant="outline" loading={loadingMore} loadingText="Chargement…" onClick={more}>
            Voir plus
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

type Tab = "nouvelle" | "historique";

export default function Diffusion() {
  usePageTitle("Diffusion WhatsApp");
  const { status, openAuth } = useAuth();
  const { ready, allowed, options } = useBroadcastAccess();
  const [tab, setTab] = useState<Tab>("nouvelle");
  const [historyKey, setHistoryKey] = useState(0);

  const header = (
    <section>
      <div className="page-head">
        <p className="eyebrow !text-accent">Administration</p>
        <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">Diffusion WhatsApp</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Envoyez une annonce à tous les étudiants ou à un groupe précis, et gardez la trace de chaque envoi.
        </p>
      </div>
    </section>
  );

  if (status === "loading" || (status === "authenticated" && !ready)) {
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
            Cet espace est réservé aux administrateurs autorisés.
          </EmptyState>
        </div>
      </div>
    );
  }

  if (!allowed || !options) {
    return (
      <div className="pb-8">
        {header}
        <div className="container-page mt-6 max-w-2xl">
          <EmptyState icon={<ShieldAlert className="h-6 w-6" />} title="Espace réservé">
            Seuls les administrateurs autorisés peuvent diffuser des annonces.
          </EmptyState>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8">
      {header}
      <div className="container-page mt-6">
        <div className="-mx-4 mb-6 overflow-x-auto px-4 scrollbar-none sm:mx-0 sm:px-0">
          <div className="flex gap-2" role="tablist" aria-label="Diffusion">
            <Chip active={tab === "nouvelle"} onClick={() => setTab("nouvelle")}>
              <Megaphone className="h-4 w-4" aria-hidden /> Nouvelle diffusion
            </Chip>
            <Chip active={tab === "historique"} onClick={() => setTab("historique")}>
              <History className="h-4 w-4" aria-hidden /> Historique
            </Chip>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={tab} {...fadeUp}>
            {tab === "nouvelle" ? (
              <>
                <div className="mb-6">
                  <Alert tone="info" title="Bon à savoir">
                    Les messages partent un par un, toutes les 3 à 8 secondes, pour protéger le numéro WhatsApp.
                    {options.limiteJournaliere ? ` Limite : ${options.limiteJournaliere.toLocaleString("fr-FR")} messages par 24 h.` : ""}
                  </Alert>
                </div>
                <NewBroadcast options={options} onSent={() => setHistoryKey((k) => k + 1)} />
              </>
            ) : (
              <HistoryTab refreshKey={historyKey} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
