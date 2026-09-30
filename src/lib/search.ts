import type { LibraryDocument } from "../types";
import { CATEGORIES } from "./constants";

const DIACRITICS = /[̀-ͯ]/g;

/** Lowercase, accent-insensitive form used for every comparison. */
export function normalize(value: string) {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase();
}

export function tokenize(query: string) {
  return normalize(query)
    .split(/[\s,;/]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function categoryLabel(type: string) {
  return CATEGORIES.find((c) => c.value === type)?.label ?? type;
}

/**
 * Relevance of a document for the query tokens (0 = no match). Every token
 * must match somewhere; matches in the title weigh more.
 */
export function scoreDocument(doc: LibraryDocument, tokens: string[]) {
  if (!tokens.length) return 1;
  const title = normalize(doc.title);
  const meta = normalize(
    [
      doc.filiere,
      doc.type,
      categoryLabel(doc.type),
      doc.niveau,
      doc.annee,
      doc.session,
    ].join(" "),
  );

  let score = 0;
  for (const token of tokens) {
    if (title.startsWith(token)) score += 6;
    else if (new RegExp(`\\b${escapeRegExp(token)}`).test(title)) score += 4;
    else if (title.includes(token)) score += 3;
    else if (meta.includes(token)) score += 1;
    else return 0;
  }
  return score;
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits `text` into highlighted / plain parts, accent-insensitively, while
 * keeping the original characters.
 */
export function highlightParts(text: string, tokens: string[]) {
  if (!tokens.length || !text) return [{ text, match: false }];

  // Map every normalized character back to its index in the original text.
  let normalized = "";
  const origin: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const n = normalize(text[i]);
    for (let j = 0; j < n.length; j++) {
      normalized += n[j];
      origin.push(i);
    }
  }

  const marked = new Array(text.length).fill(false);
  for (const token of tokens) {
    let from = 0;
    while (token && (from = normalized.indexOf(token, from)) !== -1) {
      for (let k = from; k < from + token.length; k++) marked[origin[k]] = true;
      from += token.length;
    }
  }

  const parts: { text: string; match: boolean }[] = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.match === marked[i]) last.text += text[i];
    else parts.push({ text: text[i], match: marked[i] });
  }
  return parts;
}
