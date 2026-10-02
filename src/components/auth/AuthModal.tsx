import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Lock, LogIn, Mail, MailCheck, UserPlus } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { useAuth, type AuthView } from "../../context/AuthContext";
import { API_URL, api, ApiError, errorMessage } from "../../lib/api";
import { FILIERES, NIVEAUX_INSCRIPTION } from "../../lib/constants";
import { SPRING, swap } from "../../lib/motion";
import {
  required,
  validateEmail,
  validateNewPassword,
  validatePhone,
} from "../../lib/validation";
import { Button } from "../ui/Button";
import { Alert, SuccessMark } from "../ui/Feedback";
import { Input, PasswordInput, Select } from "../ui/Field";
import { Modal } from "../ui/Modal";
import { PasswordStrength } from "./PasswordStrength";
// ---------- Divine : consentement WhatsApp ----------
import { WhatsAppSignupOption } from "../whatsapp/WhatsAppConsent";
// ---------- Divine : fin ----------

type Feedback = {
  tone: "error" | "warning" | "info";
  title: string;
  text?: string;
} | null;

const viewMotion = swap;

/* ------------------------------------------------------------------ */

function LoginView({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) {
  const { login, completeAuth, setAuthView } = useAuth();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const next = {
      email: validateEmail(email),
      password: password ? "" : "Veuillez saisir votre mot de passe.",
    };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    setFeedback(null);
    try {
      const profile = await login(email.trim().toLowerCase(), password);
      setWelcome(profile.prenom || "");
      window.setTimeout(completeAuth, 900);
    } catch (err) {
      const code = err instanceof ApiError ? err.code : undefined;
      if (code === "EMAIL_NOT_CONFIRMED") {
        setFeedback({
          tone: "warning",
          title: "Adresse e-mail non confirmée",
          text: errorMessage(err),
        });
      } else {
        setFeedback({
          tone: "error",
          title: "Connexion impossible",
          text: errorMessage(err),
        });
      }
      setLoading(false);
    }
  };

  if (welcome !== null) {
    return (
      <motion.div
        {...viewMotion}
        className="flex flex-col items-center py-8 text-center"
        role="status"
      >
        <SuccessMark />
        <p className="mt-5 text-xl font-bold ">
          {welcome ? `Bon retour, ${welcome} !` : "Connexion réussie !"}
        </p>
        <p className="mt-1 text-ink-muted">Vous êtes connecté.</p>
      </motion.div>
    );
  }

  return (
    <motion.form
      {...viewMotion}
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4"
    >
      <AnimatePresence>
        {feedback && (
          <Alert tone={feedback.tone} title={feedback.title}>
            {feedback.text}
          </Alert>
        )}
      </AnimatePresence>
      <Input
        label="Adresse e-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        icon={<Mail className="h-[18px] w-[18px]" />}
        placeholder="prenom.nom@exemple.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() =>
          email && setErrors((x) => ({ ...x, email: validateEmail(email) }))
        }
        error={errors.email}
        data-autofocus
      />
      <PasswordInput
        label="Mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      <div className="-mt-1 flex justify-end">
        <button
          type="button"
          onClick={() => setAuthView("forgot")}
          className="rounded text-sm font-semibold text-accent hover:text-accent hover:underline"
        >
          Mot de passe oublié ?
        </button>
      </div>
      <Button
        type="submit"
        size="lg"
        loading={loading}
        loadingText="Connexion…"
        icon={<LogIn className="h-4 w-4" />}
      >
        Se connecter
      </Button>

      <Button
        type="button"
        size="lg"
        onClick={() => {
          window.location.href = `${API_URL}/api/google`;
        }}
      >
        Continuer avec Google
        <FaGoogle className="h-4 w-4" />
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Pas encore de compte ?{" "}
        <button
          type="button"
          onClick={() => setAuthView("signup")}
          className="font-semibold text-accent hover:underline"
        >
          Créer un compte
        </button>
      </p>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */

const EMPTY_SIGNUP = {
  nom: "",
  prenom: "",
  filiere: "",
  niveau: "",
  email: "",
  numero: "",
  password: "",
  confirm: "",
};

type SignupField = keyof typeof EMPTY_SIGNUP;

function validateSignup(
  f: typeof EMPTY_SIGNUP,
): Partial<Record<SignupField, string>> {
  return {
    nom: required(f.nom, "Veuillez saisir votre nom."),
    prenom: required(f.prenom, "Veuillez saisir votre prénom."),
    filiere: required(f.filiere, "Choisissez votre filière."),
    niveau: required(f.niveau, "Choisissez votre niveau."),
    email: validateEmail(f.email),
    numero: validatePhone(f.numero),
    password: validateNewPassword(f.password),
    confirm: !f.confirm
      ? "Veuillez confirmer le mot de passe."
      : f.confirm !== f.password
        ? "Les mots de passe ne correspondent pas."
        : "",
  };
}

function SignupView({ onDone }: { onDone: (email: string) => void }) {
  const { signup, setAuthView } = useAuth();
  const [form, setForm] = useState(EMPTY_SIGNUP);
  const [errors, setErrors] = useState<Partial<Record<SignupField, string>>>(
    {},
  );
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);
  // ---------- Divine : consentement WhatsApp (refusé par défaut : l'étudiant doit activer) ----------
  const [whatsapp, setWhatsapp] = useState(false);
  // ---------- Divine : fin ----------

  const set = (field: SignupField) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((x) => ({ ...x, [field]: "" }));
  };
  const check = (field: SignupField) => () => {
    if (!form[field]) return;
    setErrors((x) => ({ ...x, [field]: validateSignup(form)[field] }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const next = validateSignup(form);
    setErrors(next);
    if (Object.values(next).some(Boolean)) {
      setFeedback({
        tone: "error",
        title: "Quelques informations sont à corriger.",
      });
      return;
    }
    setLoading(true);
    setFeedback(null);
    try {
      const { confirm: _confirm, ...data } = form;
      void _confirm;
      await signup({
        ...data,
        email: data.email.trim().toLowerCase(),
        numero: data.numero.replace(/[\s.-]/g, ""),
        whatsapp, // Divine : réponse à la question WhatsApp
      });
      onDone(data.email.trim().toLowerCase());
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_TAKEN") {
        setErrors((x) => ({ ...x, email: "Cette adresse est déjà utilisée." }));
        setFeedback({
          tone: "warning",
          title: "Vous avez déjà un compte",
          text: "Connectez-vous avec cette adresse, ou réinitialisez votre mot de passe si vous l'avez oublié.",
        });
      } else {
        setFeedback({
          tone: "error",
          title: "Inscription impossible",
          text: errorMessage(err),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      {...viewMotion}
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4"
    >
      <AnimatePresence>
        {feedback && (
          <Alert
            tone={feedback.tone}
            title={feedback.title}
            action={
              feedback.tone === "warning" ? (
                <button
                  type="button"
                  className="font-semibold underline"
                  onClick={() => setAuthView("login")}
                >
                  Aller à la connexion
                </button>
              ) : undefined
            }
          >
            {feedback.text}
          </Alert>
        )}
      </AnimatePresence>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nom"
          autoComplete="family-name"
          value={form.nom}
          onChange={set("nom")}
          onBlur={check("nom")}
          error={errors.nom}
          data-autofocus
        />
        <Input
          label="Prénom"
          autoComplete="given-name"
          value={form.prenom}
          onChange={set("prenom")}
          onBlur={check("prenom")}
          error={errors.prenom}
        />
        <Select
          label="Filière"
          placeholder="Choisir…"
          options={FILIERES}
          value={form.filiere}
          onChange={set("filiere")}
          error={errors.filiere}
        />
        <Select
          label="Niveau"
          placeholder="Choisir…"
          options={NIVEAUX_INSCRIPTION}
          value={form.niveau}
          onChange={set("niveau")}
          error={errors.niveau}
        />
        <Input
          label="Adresse e-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={form.email}
          onChange={set("email")}
          onBlur={check("email")}
          error={errors.email}
        />
        <Input
          label="Téléphone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0712345678"
          value={form.numero}
          onChange={set("numero")}
          onBlur={check("numero")}
          error={errors.numero}
        />
        <div className="flex flex-col gap-3">
          <PasswordInput
            label="Mot de passe"
            autoComplete="new-password"
            value={form.password}
            onChange={set("password")}
            onBlur={check("password")}
            error={errors.password}
            hint="8 caractères minimum"
          />
          <PasswordStrength value={form.password} />
        </div>
        <PasswordInput
          label="Confirmation"
          autoComplete="new-password"
          value={form.confirm}
          onChange={set("confirm")}
          onBlur={check("confirm")}
          error={errors.confirm}
        />
        {/* ---------- Divine : option notifications WhatsApp ---------- */}
        <div className="sm:col-span-2">
          <WhatsAppSignupOption checked={whatsapp} onChange={setWhatsapp} />
        </div>
        {/* ---------- Divine : fin ---------- */}
      </div>
      <Button
        type="submit"
        size="lg"
        loading={loading}
        loadingText="Création du compte…"
        icon={<UserPlus className="h-4 w-4" />}
      >
        Créer mon compte
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Déjà inscrit ?{" "}
        <button
          type="button"
          onClick={() => setAuthView("login")}
          className="font-semibold text-accent hover:underline"
        >
          Se connecter
        </button>
      </p>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */

function ForgotView({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) {
  const { setAuthView } = useAuth();
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const invalid = validateEmail(email);
    setError(invalid);
    if (invalid) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await api<{ message: string }>("/api/forgot", {
        body: { email: email.trim().toLowerCase() },
      });
      setSentMessage(res.message);
    } catch (err) {
      setFeedback({
        tone: "error",
        title: "Envoi impossible",
        text: errorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  if (sentMessage) {
    return (
      <motion.div
        {...viewMotion}
        className="flex flex-col items-center py-4 text-center"
        role="status"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sunken text-accent">
          <MailCheck className="h-8 w-8" aria-hidden />
        </div>
        <p className="mt-5 text-xl font-bold ">Vérifiez votre boîte mail</p>
        <p className="mt-2 max-w-sm text-ink-muted">{sentMessage}</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setAuthView("login")}
        >
          Retour à la connexion
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.form
      {...viewMotion}
      onSubmit={submit}
      noValidate
      className="flex flex-col gap-4"
    >
      <AnimatePresence>
        {feedback && (
          <Alert tone={feedback.tone} title={feedback.title}>
            {feedback.text}
          </Alert>
        )}
      </AnimatePresence>
      <Input
        label="Adresse e-mail du compte"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        icon={<Mail className="h-[18px] w-[18px]" />}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (error) setError("");
        }}
        error={error}
        data-autofocus
      />
      <Button
        type="submit"
        size="lg"
        loading={loading}
        loadingText="Envoi en cours…"
        icon={<KeyRound className="h-4 w-4" />}
      >
        Recevoir le lien de réinitialisation
      </Button>
      <button
        type="button"
        onClick={() => setAuthView("login")}
        className="text-sm font-semibold text-ink-muted hover:text-ink"
      >
        ← Retour à la connexion
      </button>
    </motion.form>
  );
}

/* ------------------------------------------------------------------ */

function SignupSent({
  email,
  onLogin,
}: {
  email: string;
  onLogin: () => void;
}) {
  const { closeAuth } = useAuth();
  return (
    <motion.div
      {...viewMotion}
      className="flex flex-col items-center py-2 text-center"
      role="status"
    >
      <SuccessMark />
      <p className="mt-5 text-xl font-bold ">Compte créé !</p>
      <p className="mt-2 max-w-sm text-ink-muted">
        Un e-mail de confirmation a été envoyé à{" "}
        <strong className="break-all text-ink">{email}</strong>. Cliquez sur le
        lien qu'il contient pour activer votre compte.
      </p>
      <p className="mt-3 text-sm text-ink-faint">
        Pensez à vérifier le dossier « Spam ».
      </p>
      <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Button onClick={onLogin} icon={<LogIn className="h-4 w-4" />}>
          J'ai confirmé, me connecter
        </Button>
        <Button variant="ghost" onClick={closeAuth}>
          Fermer
        </Button>
      </div>
    </motion.div>
  );
}

const HEADINGS: Record<AuthView, { title: string; description: string }> = {
  login: {
    title: "Connexion",
    description: "Accédez à tous les documents de la bibliothèque.",
  },
  signup: {
    title: "Créer un compte",
    description: "Gratuit et réservé aux étudiants. Moins d'une minute.",
  },
  forgot: {
    title: "Mot de passe oublié",
    description:
      "Recevez un lien sécurisé pour choisir un nouveau mot de passe.",
  },
};

export function AuthModal() {
  const { modal, closeAuth, setAuthView } = useAuth();
  const [email, setEmail] = useState("");
  const [signupSentTo, setSignupSentTo] = useState<string | null>(null);
  const wasOpen = useRef(false);

  // Fresh state every time the modal opens.
  useEffect(() => {
    if (modal.open && !wasOpen.current) setSignupSentTo(null);
    wasOpen.current = modal.open;
  }, [modal.open]);

  const heading = HEADINGS[modal.view];
  const showTabs = modal.view !== "forgot" && !signupSentTo;

  return (
    <Modal
      open={modal.open}
      onClose={closeAuth}
      size={modal.view === "signup" ? "lg" : "sm"}
      ariaLabel={heading.title}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-3 pr-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            {modal.view === "signup" ? (
              <UserPlus className="h-5 w-5" />
            ) : modal.view === "forgot" ? (
              <KeyRound className="h-5 w-5" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">
              {signupSentTo ? "Dernière étape" : heading.title}
            </h2>
            {!signupSentTo && (
              <p className="text-sm text-ink-muted">{heading.description}</p>
            )}
          </div>
        </div>

        {modal.reason && !signupSentTo && modal.view !== "forgot" && (
          <div className="mt-5 rounded-xl bg-sunken px-4 py-3 text-sm font-medium text-accent">
            {modal.reason}
          </div>
        )}

        {showTabs && (
          <div
            className="mt-5 grid grid-cols-2 rounded-xl bg-sunken p-1"
            role="tablist"
            aria-label="Choisir une action"
          >
            {(["login", "signup"] as const).map((view) => (
              <button
                key={view}
                type="button"
                role="tab"
                aria-selected={modal.view === view}
                onClick={() => setAuthView(view)}
                className={`relative h-10 rounded-lg text-sm font-semibold transition-colors ${
                  modal.view === view
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                {modal.view === view && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-card shadow-card"
                    transition={SPRING.snappy}
                  />
                )}
                <span className="relative">
                  {view === "login" ? "Connexion" : "Inscription"}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait" initial={false}>
            {signupSentTo ? (
              <SignupSent
                key="sent"
                email={signupSentTo}
                onLogin={() => {
                  setEmail(signupSentTo);
                  setSignupSentTo(null);
                  setAuthView("login");
                }}
              />
            ) : modal.view === "login" ? (
              <LoginView key="login" email={email} setEmail={setEmail} />
            ) : modal.view === "signup" ? (
              <SignupView key="signup" onDone={setSignupSentTo} />
            ) : (
              <ForgotView key="forgot" email={email} setEmail={setEmail} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
