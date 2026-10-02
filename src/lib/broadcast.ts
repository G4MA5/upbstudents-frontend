// Diffusion WhatsApp (admins) : types, libellés et appels API.
// Backend : /api/diffusion (voir services/README.md du backend).
import { api } from "./api";

export type BroadcastStatus = "en_cours" | "terminee" | "annulee" | "echec" | "interrompue";
export type BroadcastType = "tous" | "filiere" | "niveau" | "contributeurs" | "liste" | "mixte";

export interface BroadcastTarget {
  filieres: string[];
  niveaux: string[];
  contributeurs: boolean;
  emails: string[];
}

export interface FailedNumber {
  numero: string;
  nom: string;
  raison: string;
}

export interface Campaign {
  id: string;
  creeLe: string;
  termineLe: string | null;
  admin: string;
  canal: string;
  type: BroadcastType;
  cible: Partial<BroadcastTarget>;
  message: string;
  statut: BroadcastStatus;
  total: number;
  envoyes: number;
  echecs: number;
  annules: number;
  restants: number;
  erreurs: Record<string, number>;
  /** Numéros en échec (vide si le détail n'est pas disponible). */
  echecsDetail?: FailedNumber[];
}

export interface BroadcastOptions {
  autorise: boolean;
  filieres?: string[];
  niveaux?: string[];
  maxDestinataires?: number;
  longueurMax?: number;
  limiteJournaliere?: number;
}

export interface Preview {
  total: number;
  sansNumero: number;
  /** Numéro valide mais WhatsApp non accepté par l'étudiant (exclus de la diffusion). */
  sansConsentement?: number;
  tronque: boolean;
  depasseLimite: boolean;
  dureeEstimeeMinutes: number;
  exemples: { prenom: string; filiere: string; niveau: string; numero: string }[];
}

export const TYPE_LABEL: Record<BroadcastType, string> = {
  tous: "Tous les étudiants",
  filiere: "Par filière",
  niveau: "Par niveau",
  contributeurs: "Contributeurs",
  liste: "Liste d'e-mails",
  mixte: "Ciblage combiné",
};

export const STATUS_LABEL: Record<BroadcastStatus, { label: string; tone: "brand" | "success" | "neutral" | "danger" | "warning" }> = {
  en_cours: { label: "En cours", tone: "brand" },
  terminee: { label: "Terminée", tone: "success" },
  annulee: { label: "Annulée", tone: "neutral" },
  echec: { label: "Échec", tone: "danger" },
  interrompue: { label: "Interrompue", tone: "warning" },
};

export const ERROR_LABEL: Record<string, string> = {
  numero_absent_de_whatsapp: "Numéro absent de WhatsApp",
  echec_envoi: "Échec d'envoi",
  raison: "Raison",
};

/** Résumé lisible de la cible choisie ("MIAGE, SEA · Licence 1"). */
export function describeTarget(t: Partial<BroadcastTarget>) {
  const parts: string[] = [];
  if (t.filieres?.length) parts.push(t.filieres.join(", "));
  if (t.niveaux?.length) parts.push(t.niveaux.join(", "));
  if (t.contributeurs) parts.push("Contributeurs");
  if (t.emails?.length) parts.push(`${t.emails.length} e-mail${t.emails.length > 1 ? "s" : ""}`);
  return parts.length ? parts.join(" · ") : "Tous les étudiants inscrits";
}

export const isFinished = (c: Campaign) => c.statut !== "en_cours";

export function progressOf(c: Campaign) {
  return c.total > 0 ? (c.envoyes + c.echecs + c.annules) / c.total : 0;
}

export const fetchOptions = () => api<BroadcastOptions>("/api/diffusion", { auth: true });

export const previewAudience = (cible: BroadcastTarget) =>
  api<Preview>("/api/diffusion", { auth: true, body: { action: "apercu", cible } });

export const sendBroadcast = (body: {
  message: string;
  cible: BroadcastTarget;
  confirmer: number;
  campagneId: string;
}) =>
  api<{ campagneId: string; campagne: Campaign; doublon?: boolean }>("/api/diffusion", {
    auth: true,
    timeoutMs: 30000,
    body: { action: "envoyer", ...body },
  });

export const fetchCampaign = (id: string) =>
  api<{ campagne: Campaign }>(`/api/diffusion?campagne=${encodeURIComponent(id)}`, { auth: true });

export const fetchHistory = (page: number) =>
  api<{ historique: Campaign[]; page: number; parPage: number; total: number }>(
    `/api/diffusion?historique=1&page=${page}`,
    { auth: true },
  );

export const cancelCampaign = (id: string) =>
  api<{ campagne: Campaign }>(`/api/diffusion?campagne=${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
