import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  FilePlus2,
  GraduationCap,
  Heart,
  KeyRound,
  LogIn,
  LogOut,
  Mail,
  MessageCircle,
  Moon,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
} from "lucide-react";
import { PasswordStrength } from "../components/auth/PasswordStrength";
import { Avatar } from "../components/layout/UserMenu";
import { Button, ButtonLink } from "../components/ui/Button";
import { Alert, EmptyState, Skeleton } from "../components/ui/Feedback";
import { Switch } from "../components/ui/Switch";
import { PasswordInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { api, ApiError, errorMessage } from "../lib/api";
import { formatDate } from "../lib/format";
import { validateNewPassword } from "../lib/validation";
import { useSeoHead } from "../lib/useSeoHead";

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-canvas p-4">
      <span className="mt-0.5 text-ink-faint">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</p>
        <p className="mt-0.5 break-words font-medium text-ink">{value || "—"}</p>
      </div>
    </div>
  );
}

function PasswordForm() {
  const toast = useToast();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const found = {
      current: current ? "" : "Saisissez votre mot de passe actuel.",
      next: validateNewPassword(next) || (next === current && next ? "Choisissez un mot de passe différent de l'actuel." : ""),
      confirm: confirm === next ? "" : "Les mots de passe ne correspondent pas.",
    };
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;

    setLoading(true);
    setFailure(null);
    try {
      const res = await api<{ message: string }>("/api/mot-de-passe", {
        auth: true,
        body: { current_password: current, new_password: next },
      });
      toast.success("Mot de passe modifié", res.message);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      if (err instanceof ApiError && err.field === "current_password") {
        setErrors({ current: err.message });
      } else {
        setFailure(errorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <AnimatePresence>{failure && <Alert tone="error" title="Modification impossible">{failure}</Alert>}</AnimatePresence>
      <PasswordInput label="Mot de passe actuel" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} error={errors.current} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-3">
          <PasswordInput label="Nouveau mot de passe" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} error={errors.next} hint="8 caractères minimum" />
          <PasswordStrength value={next} />
        </div>
        <PasswordInput label="Confirmation" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} />
      </div>
      <div>
        <Button type="submit" variant="secondary" loading={loading} loadingText="Enregistrement…" icon={<KeyRound className="h-4 w-4" />}>
          Changer le mot de passe
        </Button>
      </div>
    </form>
  );
}

function Preferences() {
  const { theme, toggle } = useTheme();
  const row = "flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 transition hover:bg-sunken";
  return (
    <section className="rounded-3xl border border-line bg-card p-3 shadow-card sm:p-4" aria-labelledby="prefs">
      <h2 id="prefs" className="px-4 pb-1 pt-2 text-lg font-bold">Préférences</h2>
      <div className={row}>
        <span className="flex items-center gap-3 text-sm font-semibold text-ink">
          <Moon className="h-5 w-5 text-ink-muted" aria-hidden /> Mode sombre
        </span>
        <Switch checked={theme === "dark"} onChange={toggle} label="" />
      </div>
      <Link to="/bibliotheque" className={row}>
        <span className="flex items-center gap-3 text-sm font-semibold text-ink">
          <Heart className="h-5 w-5 text-ink-muted" aria-hidden /> Ma bibliothèque
        </span>
        <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden />
      </Link>
      <Link to="/contact" className={row}>
        <span className="flex items-center gap-3 text-sm font-semibold text-ink">
          <MessageCircle className="h-5 w-5 text-ink-muted" aria-hidden /> Contact et assistance
        </span>
        <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden />
      </Link>
    </section>
  );
}

export default function Profil() {
  useSeoHead();
  const { status, profile, contributions, memberSince, reloadProfile, openAuth, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;
    reloadProfile()
      .catch(() => undefined)
      .finally(() => setRefreshing(false));
  }, [status, reloadProfile]);

  if (status === "loading") {
    return (
      <div className="page max-w-4xl" role="status" aria-label="Chargement du profil…">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="mt-10 h-48" />
      </div>
    );
  }

  if (status === "anonymous" || !profile) {
    return (
      <div className="page flex max-w-2xl flex-col gap-6">
        <h1 className="text-2xl font-extrabold lg:eyebrow">Compte</h1>
        <EmptyState
          icon={<UserRound className="h-6 w-6" />}
          title="Connectez-vous pour voir votre profil"
          action={
            <>
              <Button icon={<LogIn className="h-4 w-4" />} onClick={() => openAuth("login")}>
                Se connecter
              </Button>
              <Button variant="outline" onClick={() => openAuth("signup")}>
                Créer un compte
              </Button>
            </>
          }
        >
          Votre profil regroupe vos informations, vos contributions et la sécurité de votre compte.
        </EmptyState>
        <Preferences />
      </div>
    );
  }

  const fullName = [profile.prenom, profile.nom].filter(Boolean).join(" ");

  return (
    <div className="page grid max-w-4xl gap-6">
      <h1 className="sr-only">Mon profil</h1>
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-elevated sm:p-8">
        <span aria-hidden className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
        <span aria-hidden className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar size={84} className="ring-4 ring-white/30 shadow-raised" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xl font-extrabold text-white sm:text-3xl">{fullName || "Mon profil"}</p>
            <p className="mt-1 truncate text-white/85">{profile.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[profile.filiere, profile.niveau].filter(Boolean).map((b) => (
                <span key={b} className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{b}</span>
              ))}
              {profile.proprietaire && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand-700">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden /> Contributeur autorisé
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex h-11 items-center gap-2 self-start rounded-full border border-white/50 px-5 text-sm font-bold text-white transition hover:bg-white/10 sm:self-center"
          >
            <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
          </button>
        </div>
      </section>

        <section className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8" aria-labelledby="infos">
          <h2 id="infos" className="text-lg font-bold">Informations du compte</h2>
          <p className="mt-1 text-sm text-ink-muted">Renseignées lors de votre inscription.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoItem icon={<UserRound className="h-4 w-4" />} label="Nom complet" value={fullName} />
            <InfoItem icon={<Mail className="h-4 w-4" />} label="E-mail" value={profile.email} />
            <InfoItem icon={<GraduationCap className="h-4 w-4" />} label="Filière · Niveau" value={[profile.filiere, profile.niveau].filter(Boolean).join(" · ")} />
            <InfoItem icon={<Phone className="h-4 w-4" />} label="Téléphone" value={profile.numero} />
            <InfoItem
              icon={<CalendarDays className="h-4 w-4" />}
              label="Membre depuis"
              value={memberSince ? formatDate(memberSince) : refreshing ? "…" : undefined}
            />
            <InfoItem
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Statut du compte"
              value={profile.proprietaire ? "Actif · contributeur autorisé" : "Actif · adresse e-mail confirmée"}
            />
          </div>
          <p className="mt-4 text-sm text-ink-muted">
            Une information à corriger ?{" "}
            <ButtonLink to={`/contact?objet=${encodeURIComponent("Modification de mon profil")}`} variant="ghost" size="sm" className="-ml-2 inline-flex text-accent">
              Contactez-nous
            </ButtonLink>
          </p>
        </section>

        <section className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8" aria-labelledby="contrib">
          <h2 id="contrib" className="text-lg font-bold">Contributions</h2>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4 rounded-2xl bg-accent-soft p-4 sm:min-w-[220px]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-card text-accent shadow-card">
                <BookOpen className="h-6 w-6" aria-hidden />
              </span>
              <div>
                {refreshing && contributions === null ? (
                  <Skeleton className="h-7 w-10" />
                ) : (
                  <p className="text-2xl font-extrabold text-accent">{contributions ?? 0}</p>
                )}
                <p className="text-sm text-ink-soft">document{(contributions ?? 0) > 1 ? "s" : ""} publié{(contributions ?? 0) > 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <ButtonLink to="/proposer" icon={<FilePlus2 className="h-4 w-4" />}>
                Proposer un document
              </ButtonLink>
              {profile.proprietaire && (
                <>
                  <ButtonLink to="/ajouter" variant="outline" icon={<Upload className="h-4 w-4" />}>
                    Publier
                  </ButtonLink>
                  <ButtonLink to="/propositions" variant="outline" icon={<ClipboardCheck className="h-4 w-4" />}>
                    Propositions à valider
                  </ButtonLink>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-8" aria-labelledby="securite">
          <h2 id="securite" className="text-lg font-bold">Sécurité</h2>
          <p className="mt-1 text-sm text-ink-muted">Modifiez le mot de passe de votre compte.</p>
          <div className="mt-5">
            <PasswordForm />
          </div>
        </section>

        <Preferences />
    </div>
  );
}
