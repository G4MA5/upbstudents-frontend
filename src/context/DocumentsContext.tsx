// The library is loaded once and shared by every page (it used to be
// fetched separately by the home page and the documents page).
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, errorMessage } from "../lib/api";
import type { LibraryDocument } from "../types";

type Status = "loading" | "ready" | "error";

interface DocumentsContextValue {
  documents: LibraryDocument[];
  status: Status;
  error: string | null;
  reload: () => void;
  add: (doc: LibraryDocument) => void;
  remove: (id: number) => void;
}

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

type ApiDocument = Partial<LibraryDocument> & { licence?: string };

function toDocument(d: ApiDocument): LibraryDocument {
  return {
    id: Number(d.id),
    title: d.title ?? "",
    filiere: d.filiere ?? "",
    annee: d.annee ?? "",
    niveau: d.niveau ?? d.licence ?? "",
    session: d.session ?? "",
    type: d.type ?? "",
    file_url: d.file_url ?? "",
    filePath: d.filePath ?? "",
    created_at: d.created_at ?? null,
  };
}

export function DocumentsProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<LibraryDocument[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    setStatus("loading");
    setError(null);
    try {
      const data = await api<{ document: ApiDocument[] }>("/api/afficher", {
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) return;
      setDocuments((data.document || []).map(toDocument));
      setStatus("ready");
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setError(errorMessage(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
    return () => controller.current?.abort();
  }, [load]);

  // Flaky mobile data: a load that failed offline is retried as soon as the
  // connection comes back, without the student having to tap "Réessayer".
  useEffect(() => {
    if (status !== "error") return;
    const retry = () => load();
    window.addEventListener("online", retry);
    return () => window.removeEventListener("online", retry);
  }, [status, load]);

  const add = useCallback((doc: LibraryDocument) => {
    setDocuments((list) => [toDocument(doc), ...list.filter((d) => d.id !== doc.id)]);
  }, []);

  const remove = useCallback((id: number) => {
    setDocuments((list) => list.filter((d) => d.id !== id));
  }, []);

  const value = useMemo(
    () => ({ documents, status, error, reload: load, add, remove }),
    [documents, status, error, load, add, remove],
  );

  return (
    <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useLibrary must be used inside DocumentsProvider");
  return ctx;
}
