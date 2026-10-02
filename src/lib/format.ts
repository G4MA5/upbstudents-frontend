import { MIME_BY_EXTENSION } from "./constants";

export function formatBytes(bytes?: number | null) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} Mo`;
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export type FileKind = "pdf" | "image" | "docx" | "doc" | "other";

export function fileKind(mime?: string | null): FileKind {
  const m = (mime || "").toLowerCase();
  if (m.includes("pdf")) return "pdf";
  if (m.startsWith("image/")) return "image";
  if (m.includes("wordprocessingml")) return "docx";
  if (m.includes("msword")) return "doc";
  return "other";
}

export const FILE_KIND_LABEL: Record<FileKind, string> = {
  pdf: "PDF",
  image: "Image",
  docx: "Word (DOCX)",
  doc: "Word (DOC)",
  other: "Fichier",
};

export const FILE_KIND_EXTENSION: Record<FileKind, string> = {
  pdf: "pdf",
  image: "",
  docx: "docx",
  doc: "doc",
  other: "",
};

export function extensionOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

/**
 * Some phones report an empty MIME type for Office files: the type is then
 * derived from the extension so the upload is accepted.
 */
export function withReliableType(file: File): File {
  const expected = MIME_BY_EXTENSION[extensionOf(file.name)];
  if (!expected || file.type === expected) return file;
  return new File([file], file.name, { type: expected });
}

export function initials(prenom?: string, nom?: string, email?: string) {
  const a = (prenom || "").trim()[0] || "";
  const b = (nom || "").trim()[0] || "";
  return (a + b || (email || "?")[0]).toUpperCase();
}

export function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("fr-FR")} ${n > 1 ? many : one}`;
}

// ---------- Divine : diffusion WhatsApp (date + heure pour l'historique) ----------
/** "2 octobre 2026 à 09:41" */
export function formatDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} à ${date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}
// ---------- Divine : fin ----------
