// Single HTTP client for the backend: base URL, timeouts, auth header,
// one automatic session refresh on 401, and French error messages.

// Development: same-origin "/api", forwarded by the Vite proxy (no CORS).
// Production: the Vercel backend, unless VITE_API_URL says otherwise.
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "https://upbstudents-backend.vercel.app")
).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  field?: string;

  constructor(message: string, status = 0, code?: string, field?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

interface AuthBridge {
  /** Returns a valid access token (refreshing it if needed), or null. */
  getToken: () => Promise<string | null>;
  /** Forces a refresh after a 401; returns the new token or null. */
  refresh: () => Promise<string | null>;
  /** Called when the session cannot be recovered. */
  onExpired: () => void;
}

let auth: AuthBridge | null = null;

export function connectAuth(bridge: AuthBridge) {
  auth = bridge;
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  method?: Method;
  body?: unknown;
  /** true: token required · "optional": sent when available */
  auth?: boolean | "optional";
  signal?: AbortSignal;
  timeoutMs?: number;
}

const STATUS_MESSAGES: Record<number, string> = {
  401: "Votre session a expiré. Veuillez vous reconnecter.",
  403: "Vous n'avez pas l'autorisation d'effectuer cette action.",
  404: "La ressource demandée est introuvable.",
  413: "Le fichier est trop volumineux.",
  429: "Trop de tentatives. Veuillez patienter quelques minutes.",
};

function fallbackMessage(status: number) {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) {
    return "Le serveur rencontre un problème. Veuillez réessayer dans quelques instants.";
  }
  return "Une erreur est survenue. Veuillez réessayer.";
}

export function networkErrorMessage() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Vous semblez hors ligne. Vérifiez votre connexion internet puis réessayez.";
  }
  return "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez.";
}

async function send(
  path: string,
  options: RequestOptions,
  token: string | null,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(new DOMException("timeout", "TimeoutError")),
    options.timeoutMs ?? 20000,
  );
  const abortFromCaller = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abortFromCaller);

  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    return await fetch(`${API_URL}${path}`, {
      method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (options.signal?.aborted) throw err;
    if (controller.signal.aborted) {
      throw new ApiError(
        "Le serveur met trop de temps à répondre. Veuillez réessayer.",
        0,
        "TIMEOUT",
      );
    }
    throw new ApiError(networkErrorMessage(), 0, "NETWORK");
  } finally {
    window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function parse<T>(res: Response): Promise<T> {
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON body (proxy error page, HTML…): handled below.
  }
  if (!res.ok || data?.status === "error") {
    throw new ApiError(
      (typeof data?.message === "string" && data.message) ||
        fallbackMessage(res.status),
      res.status,
      data?.code,
      data?.field,
    );
  }
  return data as T;
}

export async function api<T = any>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  let token: string | null = null;
  if (options.auth && auth) {
    token = await auth.getToken();
    if (!token && options.auth === true) {
      throw new ApiError(STATUS_MESSAGES[401], 401, "AUTH_REQUIRED");
    }
  }

  let res = await send(path, options, token);

  if (res.status === 401 && token && auth) {
    const fresh = await auth.refresh();
    if (fresh) {
      res = await send(path, options, fresh);
    }
    if (res.status === 401) auth.onExpired();
  }

  return parse<T>(res);
}

/** Readable message for any thrown value (never a raw technical error). */
export function errorMessage(err: unknown) {
  if (err instanceof ApiError) return err.message;
  return "Une erreur inattendue est survenue. Veuillez réessayer.";
}
