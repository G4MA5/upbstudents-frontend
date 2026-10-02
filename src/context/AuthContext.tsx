// Single source of truth for authentication.
//
// Root cause of the "login popup appears by itself" bug: every page read
// localStorage on its own, opened its own login modal on mount whenever a
// check failed (including expired 1-hour tokens that were never refreshed),
// and nothing was shared between pages. Here:
//   - status is "loading" → "authenticated" | "anonymous", decided once;
//   - the session carries a refresh token and is renewed transparently;
//   - there is ONE modal, opened only in response to a user action, and the
//     action resumes automatically after a successful login.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, ApiError, connectAuth } from "../lib/api";
import {
  readRawStorage,
  readStorage,
  removeStorage,
  writeStorage,
} from "../lib/storage";
import type { Profile, Session } from "../types";
import { useToast } from "./ToastContext";

export type AuthStatus = "loading" | "authenticated" | "anonymous";
export type AuthView = "login" | "signup" | "forgot";

const SESSION_KEY = "upb_session";
const PROFILE_KEY = "upb_profile";
const LEGACY_TOKEN_KEY = "supa_token";

export interface SignupData {
  nom: string;
  prenom: string;
  niveau: string;
  filiere: string;
  numero: string;
  email: string;
  password: string;
}

interface AuthPayload {
  profile: Profile;
  session: Session;
}

interface UserPayload {
  profile: Profile;
  contributions: number;
  user?: { created_at?: string };
}

interface ModalState {
  open: boolean;
  view: AuthView;
  reason?: string;
}

interface AuthContextValue {
  status: AuthStatus;
  profile: Profile | null;
  contributions: number | null;
  /** Account creation date (ISO), known once the profile is verified. */
  memberSince: string | null;
  login: (email: string, password: string) => Promise<Profile>;
  signup: (data: SignupData) => Promise<string>;
  logout: () => Promise<void>;
  reloadProfile: () => Promise<void>;
  /** Runs `action` now if signed in, otherwise after a successful login. */
  requireAuth: (action: () => void, reason?: string) => void;
  modal: ModalState;
  openAuth: (
    view?: AuthView,
    options?: { reason?: string; onSuccess?: () => void },
  ) => void;
  setAuthView: (view: AuthView) => void;
  closeAuth: () => void;
  /** Called by the login form once signed in: closes and resumes. */
  completeAuth: () => void;
  justLoggedIn: boolean;
  clearJustLoggedIn: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function tokenExpiry(token: string): number {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return Number(JSON.parse(atob(payload)).exp) || 0;
  } catch {
    return 0;
  }
}

const nowSeconds = () => Math.floor(Date.now() / 1000);

/** Session from a Supabase e-mail link (#access_token=…&type=signup). */
function sessionFromUrlHash(): Session | null {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const access = hash.get("access_token");
  const type = hash.get("type");
  if (!access || type === "recovery") return null;
  return {
    access_token: access,
    refresh_token: hash.get("refresh_token") || "",
    expires_at: Number(hash.get("expires_at")) || tokenExpiry(access),
  };
}

function initialSession(): Session | null {
  const stored = readStorage<Session>(SESSION_KEY);
  if (stored?.access_token) return stored;
  const legacy = readRawStorage(LEGACY_TOKEN_KEY);
  if (legacy) {
    return {
      access_token: legacy,
      refresh_token: "",
      expires_at: tokenExpiry(legacy),
    };
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();

  const sessionRef = useRef<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() =>
    readStorage<Profile>(PROFILE_KEY),
  );
  const [contributions, setContributions] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const clearJustLoggedIn = useCallback(() => setJustLoggedIn(false), []);
  const [status, setStatus] = useState<AuthStatus>(() => {
    const fromLink = sessionFromUrlHash();
    sessionRef.current = fromLink || initialSession();
    if (!sessionRef.current) return "anonymous";
    // A cached profile lets the UI render as signed in immediately (no
    // flicker); the session is still verified in the background.
    return !fromLink && readStorage<Profile>(PROFILE_KEY)
      ? "authenticated"
      : "loading";
  });

  const [modal, setModal] = useState<ModalState>({
    open: false,
    view: "login",
  });
  const pendingAction = useRef<(() => void) | null>(null);
  const waitingForBoot = useRef<{ action: () => void; reason?: string } | null>(
    null,
  );
  const refreshing = useRef<Promise<string | null> | null>(null);
  const expiredNotified = useRef(false);

  const persist = useCallback((session: Session, nextProfile: Profile) => {
    sessionRef.current = session;
    writeStorage(SESSION_KEY, session);
    writeStorage(PROFILE_KEY, nextProfile);
    removeStorage(LEGACY_TOKEN_KEY);
    setProfile(nextProfile);
    setStatus("authenticated");
    expiredNotified.current = false;
  }, []);

  const clearSession = useCallback(() => {
    sessionRef.current = null;
    removeStorage(SESSION_KEY, PROFILE_KEY, LEGACY_TOKEN_KEY);
    setProfile(null);
    setContributions(null);
    setMemberSince(null);
    setStatus("anonymous");
  }, []);

  const expire = useCallback(() => {
    const wasSignedIn = Boolean(sessionRef.current);
    clearSession();
    if (wasSignedIn && !expiredNotified.current) {
      expiredNotified.current = true;
      toast.info(
        "Votre session a expiré",
        "Reconnectez-vous quand vous en aurez besoin.",
      );
    }
  }, [clearSession, toast]);

  // Single-flight refresh: concurrent 401s share one request.
  const refresh = useCallback((): Promise<string | null> => {
    if (refreshing.current) return refreshing.current;
    const refreshToken = sessionRef.current?.refresh_token;
    if (!refreshToken) return Promise.resolve(null);

    refreshing.current = api<AuthPayload>("/api/session", {
      body: { refresh_token: refreshToken },
    })
      .then((data) => {
        persist(data.session, data.profile);
        return data.session.access_token;
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) expire();
        return null;
      })
      .finally(() => {
        refreshing.current = null;
      });
    return refreshing.current;
  }, [expire, persist]);

  const getToken = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return null;
    const remaining = session.expires_at - nowSeconds();
    if (remaining < 60 && session.refresh_token) return refresh();
    if (remaining <= 0) return null;
    return session.access_token;
  }, [refresh]);

  // Connected during the first render so child effects can already call
  // authenticated endpoints.
  const bridge = useRef({ getToken, refresh, onExpired: expire });
  bridge.current = { getToken, refresh, onExpired: expire };
  useState(() =>
    connectAuth({
      getToken: () => bridge.current.getToken(),
      refresh: () => bridge.current.refresh(),
      onExpired: () => bridge.current.onExpired(),
    }),
  );

  const reloadProfile = useCallback(async () => {
    const data = await api<UserPayload>("/api/utilisateur", { auth: true });
    setProfile(data.profile);
    setContributions(data.contributions);
    setMemberSince(data.user?.created_at ?? null);
    writeStorage(PROFILE_KEY, data.profile);
  }, []);

  const openAuth = useCallback<AuthContextValue["openAuth"]>(
    (view = "login", options) => {
      pendingAction.current = options?.onSuccess ?? null;
      setModal({ open: true, view, reason: options?.reason });
    },
    [],
  );

  // Boot: verify the stored session once (guarded against StrictMode's
  // double effect run).
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const authType = hashParams.get("type");
    const fromLink = sessionFromUrlHash();
    const googleError = new URLSearchParams(window.location.search).get(
      "google_error",
    );
    if (googleError) {
      const messages: Record<string, string> = {
        cancelled: "La connexion Google a été annulée.",
        invalid_state: "La demande de connexion a expiré. Veuillez réessayer.",
        server_configuration:
          "La connexion Google n'est pas configurée. Réessayez plus tard.",
        provider_configuration:
          "La connexion Google n'est pas disponible. Réessayez plus tard.",
        unverified_email:
          "Votre adresse e-mail Google doit être vérifiée pour continuer.",
        account_conflict:
          "Cette adresse e-mail est déjà liée à un autre compte. Connectez-vous avec votre méthode habituelle.",
      };
      toast.error(
        "Connexion Google impossible",
        messages[googleError] || "Une erreur est survenue. Veuillez réessayer.",
      );
      const cleanUrl = new URL(window.location.href);
      cleanUrl.searchParams.delete("google_error");
      window.history.replaceState(
        null,
        "",
        cleanUrl.pathname + cleanUrl.search + cleanUrl.hash,
      );
    }
    const linkError = hashParams.get("error_code");
    if (
      fromLink ||
      (linkError && window.location.pathname !== "/mot-de-passe-oublie")
    ) {
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    if (linkError && window.location.pathname !== "/mot-de-passe-oublie") {
      toast.error(
        "Ce lien n'est plus valide",
        "Il a peut-être expiré ou déjà été utilisé. Essayez de vous connecter.",
      );
    }

    const finishBoot = (authenticated: boolean) => {
      const waiting = waitingForBoot.current;
      waitingForBoot.current = null;
      if (!waiting) return;
      if (authenticated) waiting.action();
      else
        openAuth("login", {
          reason: waiting.reason,
          onSuccess: waiting.action,
        });
    };

    if (!sessionRef.current) {
      finishBoot(false);
      return;
    }

    (async () => {
      try {
        const stored = sessionRef.current!;
        if (stored.expires_at - nowSeconds() < 60) {
          if (!stored.refresh_token) {
            // Old-format session (no refresh token) that has expired.
            if (stored.expires_at <= nowSeconds()) {
              clearSession();
              finishBoot(false);
              return;
            }
          } else if (!(await refresh())) {
            // Either expired (already cleared) or a network failure, in
            // which case the cached profile is kept.
            const cached = sessionRef.current
              ? readStorage<Profile>(PROFILE_KEY)
              : null;
            setStatus(cached ? "authenticated" : "anonymous");
            finishBoot(Boolean(cached));
            return;
          }
        }
        const data = await api<UserPayload>("/api/utilisateur", { auth: true });
        const session = sessionRef.current;
        if (session) persist(session, data.profile);
        setContributions(data.contributions);
        setMemberSince(data.user?.created_at ?? null);
        if (authType === "signup") {
          toast.success(
            "Adresse e-mail confirmée",
            `Bienvenue${data.profile.prenom ? ` ${data.profile.prenom}` : ""} ! Votre compte est actif.`,
          );
        } else if (authType === "google") {
          toast.success(
            "Connexion réussie",
            `Bienvenue${data.profile.prenom ? ` ${data.profile.prenom}` : ""} !`,
          );
        }
        finishBoot(true);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearSession();
          finishBoot(false);
        } else {
          // Offline or server unavailable: stay signed in with the cached
          // profile rather than logging the user out.
          const cached = readStorage<Profile>(PROFILE_KEY);
          setStatus(cached ? "authenticated" : "anonymous");
          finishBoot(Boolean(cached));
        }
      }
    })();
  }, [clearSession, openAuth, persist, refresh, toast]);

  // Keep several open tabs consistent.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SESSION_KEY) return;
      const next = readStorage<Session>(SESSION_KEY);
      if (!next) {
        sessionRef.current = null;
        setProfile(null);
        setStatus("anonymous");
      } else {
        sessionRef.current = next;
        setProfile(readStorage<Profile>(PROFILE_KEY));
        setStatus("authenticated");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await api<AuthPayload>("/api/connexion", {
        body: { email, password },
      });
      persist(data.session, data.profile);
      setJustLoggedIn(true);
      reloadProfile().catch(() => undefined);
      return data.profile;
    },
    [persist, reloadProfile],
  );

  const signup = useCallback(async (data: SignupData) => {
    const res = await api<{ message: string }>("/api/inscription", {
      body: data,
    });
    return res.message;
  }, []);

  const logout = useCallback(async () => {
    // Revocation is best effort: the local session is cleared regardless.
    api("/api/deconnexion", {
      method: "POST",
      auth: "optional",
      timeoutMs: 5000,
    }).catch(() => undefined);
    clearSession();
    toast.success("Vous êtes déconnecté", "À bientôt sur la bibliothèque !");
  }, [clearSession, toast]);

  const closeAuth = useCallback(() => {
    pendingAction.current = null;
    setModal((m) => ({ ...m, open: false }));
  }, []);

  const completeAuth = useCallback(() => {
    const action = pendingAction.current;
    pendingAction.current = null;
    setModal((m) => ({ ...m, open: false }));
    // Let the modal close before resuming (e.g. opening a preview).
    if (action) window.setTimeout(action, 220);
  }, []);

  const setAuthView = useCallback((view: AuthView) => {
    setModal((m) => ({ ...m, view }));
  }, []);

  const requireAuth = useCallback<AuthContextValue["requireAuth"]>(
    (action, reason) => {
      if (status === "authenticated") action();
      else if (status === "loading")
        waitingForBoot.current = { action, reason };
      else openAuth("login", { reason, onSuccess: action });
    },
    [openAuth, status],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      profile,
      contributions,
      memberSince,
      login,
      signup,
      logout,
      reloadProfile,
      requireAuth,
      modal,
      openAuth,
      setAuthView,
      closeAuth,
      completeAuth,
      justLoggedIn,
      clearJustLoggedIn,
    }),
    [
      status,
      profile,
      contributions,
      memberSince,
      login,
      signup,
      logout,
      reloadProfile,
      requireAuth,
      modal,
      openAuth,
      setAuthView,
      closeAuth,
      completeAuth,
      justLoggedIn,
      clearJustLoggedIn,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
