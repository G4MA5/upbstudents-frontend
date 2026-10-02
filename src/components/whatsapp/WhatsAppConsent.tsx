// ---------- Divine : fichier entièrement nouveau (consentement aux notifications WhatsApp) ----------
// Trois éléments, tous reliés à useAuth().whatsapp (réponse enregistrée sur le serveur) :
//   - WhatsAppSignupOption : case à l'inscription
//   - WhatsAppPrompt       : fenêtre affichée UNE SEULE FOIS aux comptes qui n'ont jamais répondu
//   - WhatsAppProfileCard  : option dans le profil (mise en avant tant que ce n'est pas accepté)
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Check, FileCheck2, Megaphone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { errorMessage } from "../../lib/api";
import { fadeUp } from "../../lib/motion";
import { Button } from "../ui/Button";
import { Alert, Badge } from "../ui/Feedback";
import { Modal } from "../ui/Modal";
import { Switch } from "../ui/Switch";

const BENEFITS = [
  { icon: FileCheck2, text: "Savoir tout de suite quand votre proposition de document est publiée." },
  { icon: Megaphone, text: "Recevoir les annonces importantes : nouveaux sujets, examens, maintenance." },
  { icon: BellRing, text: "Gratuit, quelques messages seulement, et désactivable à tout moment." },
];

function WhatsAppBadge({ size = 44 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <FaWhatsapp style={{ width: size * 0.55, height: size * 0.55 }} />
    </span>
  );
}

/** "0700000000" → "07 00 00 00 00" (lisible dans les textes). */
function prettyPhone(value?: string) {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length === 10 ? digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim() : value ?? "";
}

// ---------------------------------------------------------------------------
// Inscription

export function WhatsAppSignupOption({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        checked ? "border-emerald-500/40 bg-emerald-500/[0.06]" : "border-line bg-sunken"
      }`}
    >
      <div className="flex items-start gap-3">
        <WhatsAppBadge size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-ink">Notifications WhatsApp</p>
          <p className="mt-0.5 text-[13px] text-ink-muted">
            Soyez prévenu quand votre proposition est publiée et pour les annonces importantes. Gratuit, désactivable à tout moment dans votre profil.
          </p>
          <div className="mt-3">
            <Switch checked={checked} onChange={() => onChange(!checked)} label={checked ? "Oui, je veux être prévenu" : "Recevoir mes notifications"} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fenêtre affichée une seule fois

export function WhatsAppPrompt() {
  const { status, profile, whatsapp, setWhatsappConsent } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const shown = useRef(false);

  // Seulement si le serveur gère l'option, que le compte n'a jamais répondu
  // (accepte === null) et qu'il a un numéro. Une fois répondu, la valeur serveur
  // n'est plus null : la fenêtre ne revient plus (sur aucun appareil).
  const eligible =
    status === "authenticated" && whatsapp?.disponible === true && whatsapp.accepte === null && Boolean(profile?.numero);

  useEffect(() => {
    if (!eligible || shown.current) return;
    // Après que la page s'est installée, pour ne pas surgir pendant le chargement.
    const t = window.setTimeout(() => {
      shown.current = true;
      setOpen(true);
    }, 2500);
    return () => window.clearTimeout(t);
  }, [eligible]);

  const answer = async (accepte: boolean) => {
    setLoading(true);
    setFailure(null);
    try {
      await setWhatsappConsent(accepte);
      setOpen(false);
      if (accepte) toast.success("WhatsApp activé", "Vous recevrez vos notifications sur WhatsApp.");
      else toast.info("D'accord", "Vous pourrez activer les notifications WhatsApp depuis votre profil.");
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Fermer la fenêtre (croix, Échap) vaut un « Non merci » : elle ne se réaffiche plus.
    <Modal open={open} onClose={() => !loading && answer(false)} size="md" ariaLabel="Notifications WhatsApp">
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <WhatsAppBadge size={56} />
        <h2 className="mt-4 text-xl font-extrabold">Restez informé sur WhatsApp</h2>
        <p className="mt-1.5 text-[15px] text-ink-muted">
          Voulez-vous recevoir vos notifications sur WhatsApp
          {profile?.numero ? <> au <strong className="text-ink-soft">{prettyPhone(profile.numero)}</strong></> : null} ?
        </p>

        <ul className="mt-4 space-y-2.5 text-left">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-ink-soft">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="pt-1">{text}</span>
            </li>
          ))}
        </ul>

        <AnimatePresence>{failure && <div className="mt-4 w-full"><Alert tone="error" title="Action impossible">{failure}</Alert></div>}</AnimatePresence>

        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => answer(false)} disabled={loading}>
            Non merci
          </Button>
          <Button onClick={() => answer(true)} loading={loading} loadingText="Activation…" icon={<FaWhatsapp className="h-4 w-4" />}>
            Oui, activer WhatsApp
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-faint">Vous pourrez changer d'avis à tout moment depuis votre profil.</p>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Profil

export function WhatsAppProfileCard() {
  const { profile, whatsapp, setWhatsappConsent } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  // Option non gérée par le serveur, ou compte sans numéro : rien à proposer.
  if (!whatsapp?.disponible || !profile?.numero) return null;
  const accepted = whatsapp.accepte === true;

  const change = async (accepte: boolean) => {
    setLoading(true);
    setFailure(null);
    try {
      await setWhatsappConsent(accepte);
      if (accepte) toast.success("WhatsApp activé", "Vous recevrez vos notifications sur WhatsApp.");
      else toast.info("Notifications WhatsApp désactivées", "Vous pouvez les réactiver quand vous voulez.");
    } catch (err) {
      setFailure(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Déjà accepté : carte calme, avec la possibilité de désactiver.
  if (accepted) {
    return (
      <section className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8" aria-labelledby="wa-profil">
        <div className="flex items-start gap-4">
          <WhatsAppBadge />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="wa-profil" className="text-lg font-bold">Notifications WhatsApp</h2>
              <Badge tone="success" icon={<Check className="h-3 w-3" aria-hidden />}>Activées</Badge>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              Vous recevez vos notifications sur le <strong className="text-ink-soft">{prettyPhone(profile.numero)}</strong>.
            </p>
            <div className="mt-4">
              <Switch checked onChange={() => !loading && change(false)} label="Recevoir les notifications WhatsApp" />
            </div>
            <AnimatePresence>{failure && <div className="mt-3"><Alert tone="error">{failure}</Alert></div>}</AnimatePresence>
          </div>
        </div>
      </section>
    );
  }

  // Pas encore accepté : carte mise en avant pour inciter à activer.
  return (
    <motion.section
      {...fadeUp}
      aria-labelledby="wa-profil"
      className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.09] via-card to-card p-5 shadow-raised sm:p-8"
    >
      <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start">
        <WhatsAppBadge size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id="wa-profil" className="text-lg font-extrabold">Activez les notifications WhatsApp</h2>
            <Badge tone="brand">Recommandé</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {whatsapp.accepte === false
              ? "Vous avez refusé les notifications WhatsApp. Vous ratez les annonces importantes : changez d'avis en un clic."
              : "Ne ratez plus rien : recevez directement sur votre téléphone ce qui concerne vos documents."}
          </p>
          <ul className="mt-4 space-y-2">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-ink-soft">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <AnimatePresence>{failure && <div className="mt-4"><Alert tone="error">{failure}</Alert></div>}</AnimatePresence>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button size="lg" loading={loading} loadingText="Activation…" icon={<FaWhatsapp className="h-5 w-5" />} onClick={() => change(true)}>
              Activer maintenant
            </Button>
            <p className="text-xs text-ink-faint">Au {prettyPhone(profile.numero)} · désactivable à tout moment</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
// ---------- Divine : fin ----------
