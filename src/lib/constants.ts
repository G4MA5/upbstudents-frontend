export const FILIERES = [
  "MIAGE",
  "ASSRI",
  "SEA",
  "SEG",
  "3EA",
  "SJAP",
  "RIT",
] as const;

export const NIVEAUX_INSCRIPTION = ["Licence 1", "Licence 2", "Licence 3"];
export const NIVEAUX = [...NIVEAUX_INSCRIPTION, "Master 1", "Master 2"];

export const SESSIONS = ["Session 1", "Session 2"];

/** Document categories. `value` is the stored `type`. */
export const CATEGORIES = [
  { value: "Examen", label: "Examens", singular: "Examen" },
  { value: "TD", label: "TD", singular: "TD" },
  { value: "TP", label: "TP", singular: "TP" },
  { value: "Livre", label: "Livres", singular: "Livre" },
] as const;

export const TYPES = CATEGORIES.map((c) => c.value) as string[];

const FIRST_YEAR = 2018;
export const ANNEES = Array.from(
  { length: new Date().getFullYear() - FIRST_YEAR + 1 },
  (_, i) => String(new Date().getFullYear() - i),
);

/** Sessions only apply to exams (same rule as the original form). */
export function typeHasSession(type: string) {
  return !type || type === "Examen";
}

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export const ACCEPTED_FILES = ".pdf,.doc,.docx,.png,.jpg,.jpeg";

export const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};
