import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, LinkIcon, LogIn } from "lucide-react";
import { PasswordStrength } from "../components/auth/PasswordStrength";
import { Button } from "../components/ui/Button";
import { Alert, SuccessMark } from "../components/ui/Feedback";
import { PasswordInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";
import { api, ApiError, errorMessage } from "../lib/api";
import { validateNewPassword } from "../lib/validation";
import { useSeoHead } from "../lib/useSeoHead";

type LinkState = { token: string } | { invalid: "expired" | "missing" };

/** Reads the recovery link (pure: may run twice under StrictMode). */
function readRecoveryLink(): LinkState {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const token = hash.get("access_token");
  if (token) return { token };
  return { invalid: hash.get("error_code") ? "expired" : "missing" };
}

export default function ResetPassword() {
  useSeoHead();
  const { openAuth } = useAuth();
  const navigate = useNavigate();
  const [link] = useState<LinkState>(readRecoveryLink);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // The token must not stay in the address bar or the browser history.
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
    if ("invalid" in link) setExpired(true);
  }, [link]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !("token" in link)) return;
    const found = {
      password: validateNewPassword(password),
      confirm: confirm === password ? "" : "Les mots de passe ne correspondent pas.",
    };
    setErrors(found);
    if (found.password || found.confirm) return;
    setLoading(true);
    setFailure(null);
    try {
      await api("/api/reset", { body: { access_token: link.token, new_password: password } });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INVALID_LINK") setExpired(true);
      else setFailure(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const requestNewLink = () => openAuth("forgot");

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-canvas to-card px-4 py-14">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-line bg-card p-6 shadow-elevated sm:p-8"
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center" role="status">
              <SuccessMark size={80} />
              <h1 className="mt-6 text-2xl font-extrabold">Mot de passe modifié</h1>
              <p className="mt-2 text-ink-muted">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
              <Button
                className="mt-8 w-full"
                size="lg"
                icon={<LogIn className="h-4 w-4" />}
                onClick={() => {
                  navigate("/");
                  openAuth("login");
                }}
              >
                Se connecter
              </Button>
            </motion.div>
          ) : expired ? (
            <motion.div key="expired" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <LinkIcon className="h-7 w-7" aria-hidden />
              </span>
              <h1 className="mt-5 text-2xl font-extrabold">Lien expiré ou invalide</h1>
              <p className="mt-2 text-ink-muted">
                Pour votre sécurité, les liens de réinitialisation ne sont valables
                qu'une seule fois et pendant une durée limitée.
              </p>
              <Button className="mt-8 w-full" size="lg" icon={<KeyRound className="h-4 w-4" />} onClick={requestNewLink}>
                Recevoir un nouveau lien
              </Button>
            </motion.div>
          ) : (
            <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={submit} noValidate className="flex flex-col gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <KeyRound className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold">Choisissez un nouveau mot de passe</h1>
                <p className="mt-1 text-ink-muted">8 caractères minimum. Évitez un mot de passe déjà utilisé ailleurs.</p>
              </div>
              <AnimatePresence>{failure && <Alert tone="error" title="Modification impossible">{failure}</Alert>}</AnimatePresence>
              <div className="flex flex-col gap-3">
                <PasswordInput
                  label="Nouveau mot de passe"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  data-autofocus
                />
                <PasswordStrength value={password} />
              </div>
              <PasswordInput
                label="Confirmation"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={errors.confirm}
              />
              <Button type="submit" size="lg" loading={loading} loadingText="Enregistrement…" className="mt-2">
                Enregistrer le mot de passe
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
