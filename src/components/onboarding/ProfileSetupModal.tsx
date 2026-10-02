// ProfileSetupModal — shown once after sign-in when filière or niveau is missing.
// The user can skip it (the data is optional from a technical standpoint), but
// it greatly improves the personalised home screen (recommended docs, etc.).
import React, { useState } from "react";
import { GraduationCap, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { api, errorMessage } from "../../lib/api";
import { FILIERES, NIVEAUX_INSCRIPTION } from "../../lib/constants";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Field";
import type { Profile } from "../../types";

type Errors = { filiere?: string; niveau?: string };

export function ProfileSetupModal() {
  const { status, profile, reloadProfile, modal, justLoggedIn, clearJustLoggedIn } = useAuth();
  const toast = useToast();

  const [filiere, setFiliere] = useState(profile?.filiere || "");
  const [niveau, setNiveau] = useState(profile?.niveau || "");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Sync state when profile or justLoggedIn changes
  const [lastEmail, setLastEmail] = useState<string | null>(null);
  if (profile && (profile.email !== lastEmail || justLoggedIn)) {
    if (profile.email !== lastEmail) {
      setLastEmail(profile.email);
      setDismissed(false);
    }
    if (!filiere && profile.filiere) setFiliere(profile.filiere);
    if (!niveau && profile.niveau) setNiveau(profile.niveau);
  }

  // Show when authenticated, not currently displaying AuthModal, and
  // either filière/niveau is missing OR user just logged in.
  const needsSetup =
    status === "authenticated" &&
    profile !== null &&
    !modal.open &&
    (justLoggedIn || !profile.filiere || !profile.niveau);

  if (!needsSetup || dismissed) return null;

  const handleClose = () => {
    clearJustLoggedIn();
    setDismissed(true);
  };

  const validate = (): Errors => ({
    filiere: filiere ? "" : "Choisissez votre filière.",
    niveau: niveau ? "" : "Choisissez votre niveau.",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await api<{ profile: Profile }>("/api/utilisateur", {
        method: "PATCH",
        auth: true,
        body: { filiere, niveau },
      });
      await reloadProfile();
      toast.success(
        "Profil mis à jour",
        "Vos informations ont bien été enregistrées.",
      );
      clearJustLoggedIn();
      setDismissed(true);
    } catch (err) {
      toast.error("Impossible de sauvegarder", errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-500" aria-hidden />
          Mettez à jour vos informations
        </span>
      }
      description="Renseignez votre filière et votre niveau pour nous permettre de vous recommander les documents adaptés à votre cursus."
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
          >
            Plus tard
          </Button>
          <Button
            type="submit"
            form="profile-setup-form"
            loading={loading}
            loadingText="Enregistrement…"
            icon={<GraduationCap className="h-4 w-4" />}
          >
            Enregistrer
          </Button>
        </div>
      }
    >
      <form id="profile-setup-form" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-4">
          <Select
            label="Filière"
            placeholder="Choisir votre filière…"
            options={[...FILIERES]}
            value={filiere}
            onChange={(e) => setFiliere(e.target.value)}
            error={errors.filiere}
          />
          <Select
            label="Niveau"
            placeholder="Choisir votre niveau…"
            options={NIVEAUX_INSCRIPTION}
            value={niveau}
            onChange={(e) => setNiveau(e.target.value)}
            error={errors.niveau}
            hint="Votre niveau actuel d'inscription (Licence 1, 2 ou 3)."
          />
        </div>
      </form>
    </Modal>
  );
}
