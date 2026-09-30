import { useEffect, useState } from "react";
import type { LibraryDocument } from "../types";
import { FILE_KIND_EXTENSION, fileKind, type FileKind } from "./format";

export interface FileInfo {
  kind: FileKind;
  mime: string;
  size: number | null;
}

const cache = new Map<string, Promise<FileInfo>>();

/**
 * Stored files have no extension, so the real type and size are read from
 * the storage response headers (HEAD request, cached per URL).
 */
export function getFileInfo(url: string): Promise<FileInfo> {
  let pending = cache.get(url);
  if (!pending) {
    pending = fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        const mime = res.headers.get("content-type") || "";
        const length = Number(res.headers.get("content-length"));
        return {
          kind: fileKind(mime),
          mime,
          size: Number.isFinite(length) && length > 0 ? length : null,
        };
      })
      .catch((err) => {
        cache.delete(url);
        throw err;
      });
    cache.set(url, pending);
  }
  return pending;
}

type State =
  | { status: "loading" }
  | { status: "ready"; info: FileInfo }
  | { status: "error" };

export function useFileInfo(url: string | null) {
  const [state, setState] = useState<State>({ status: "loading" });
  useEffect(() => {
    if (!url) return;
    let alive = true;
    setState({ status: "loading" });
    getFileInfo(url)
      .then((info) => alive && setState({ status: "ready", info }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

function safeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9 ._-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "document"
  );
}

export function downloadName(doc: LibraryDocument, info?: FileInfo | null) {
  const base = safeFileName(
    [doc.type, doc.filiere, doc.title, doc.annee].filter(Boolean).join(" - "),
  );
  let ext = info ? FILE_KIND_EXTENSION[info.kind] : "";
  if (info?.kind === "image") ext = info.mime.includes("png") ? "png" : "jpg";
  return ext ? `${base}.${ext}` : base;
}

/**
 * Starts the download with a readable file name (Supabase's `download`
 * parameter makes the storage send it as an attachment).
 */
export async function downloadDocument(doc: LibraryDocument) {
  let info: FileInfo | null = null;
  try {
    info = await getFileInfo(doc.file_url);
  } catch {
    // The download still works without the metadata.
  }
  const url = new URL(doc.file_url);
  url.searchParams.set("download", downloadName(doc, info));
  const a = document.createElement("a");
  a.href = url.toString();
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
