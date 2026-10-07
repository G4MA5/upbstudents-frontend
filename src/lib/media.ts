// Divine : préparation des pièces jointes d'une diffusion WhatsApp (sticker ou image), dans le navigateur.
//  - Sticker : n'importe quelle image est convertie en WebP 512 × 512 (fond transparent), ≤ 100 Ko.
//  - Image   : JPEG / PNG / WebP, réduite automatiquement si elle dépasse ~900 Ko.
// Le serveur revérifie le format réel et la taille (wa-service).

export type MediaKind = "sticker" | "image";

export interface PreparedMedia {
  type: MediaKind;
  /** Contenu en base64 (sans le préfixe « data: »). */
  data: string;
  /** Adresse temporaire pour afficher l'aperçu (à libérer avec URL.revokeObjectURL). */
  previewUrl: string;
  size: number;
}

const STICKER_SIZE = 512;
const STICKER_MAX_BYTES = 100 * 1024;
const IMAGE_MAX_BYTES = 900 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Ce fichier n'est pas une image lisible."));
    };
    img.src = url;
  });
}

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Lecture du fichier impossible."));
    reader.readAsDataURL(blob);
  });
}

async function prepared(type: MediaKind, blob: Blob): Promise<PreparedMedia> {
  return { type, data: await blobToBase64(blob), previewUrl: URL.createObjectURL(blob), size: blob.size };
}

export async function prepareSticker(file: File): Promise<PreparedMedia> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = STICKER_SIZE;
  canvas.height = STICKER_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Votre navigateur ne permet pas de préparer l'image.");

  // L'image est centrée dans le carré, sans déformation (fond transparent).
  const scale = Math.min(STICKER_SIZE / img.width, STICKER_SIZE / img.height);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  ctx.drawImage(img, Math.round((STICKER_SIZE - w) / 2), Math.round((STICKER_SIZE - h) / 2), w, h);

  let blob: Blob | null = null;
  for (const quality of [0.92, 0.8, 0.65, 0.5, 0.35]) {
    blob = await toBlob(canvas, "image/webp", quality);
    // Certains navigateurs (Safari) ne savent pas encoder du WebP et renvoient du PNG.
    if (!blob || blob.type !== "image/webp") {
      throw new Error("Votre navigateur ne sait pas créer de sticker (WebP). Utilisez Chrome, Edge ou Firefox.");
    }
    if (blob.size <= STICKER_MAX_BYTES) break;
  }
  if (!blob || blob.size > STICKER_MAX_BYTES) {
    throw new Error("Ce sticker est trop détaillé (plus de 100 Ko). Choisissez une image plus simple.");
  }
  return prepared("sticker", blob);
}

export async function prepareImage(file: File): Promise<PreparedMedia> {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format non pris en charge : utilisez une image JPEG, PNG ou WebP.");
  }
  if (file.size <= IMAGE_MAX_BYTES) return prepared("image", file);

  // Trop lourde : on la réduit (côté le plus long limité) puis on la recompresse en JPEG.
  const img = await loadImage(file);
  for (const side of [1600, 1280, 1024, 800]) {
    const scale = Math.min(1, side / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#fff"; // le JPEG n'a pas de transparence
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.85, 0.72, 0.6]) {
      const blob = await toBlob(canvas, "image/jpeg", quality);
      if (blob && blob.size <= IMAGE_MAX_BYTES) return prepared("image", blob);
    }
  }
  throw new Error("Cette image est trop lourde : choisissez-en une plus petite.");
}
