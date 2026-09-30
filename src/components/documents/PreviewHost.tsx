// Global document preview: any page opens it with ?doc=ID.
import { useCallback, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useLibrary } from "../../context/DocumentsContext";
import { usePrefs } from "../../context/PrefsContext";
import { useToast } from "../../context/ToastContext";
import { DocumentPreview } from "./DocumentPreview";

export function PreviewHost() {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { documents, status } = useLibrary();
  const { pushRecent } = usePrefs();
  const toast = useToast();

  const id = Number(params.get("doc")) || null;
  const doc = useMemo(() => (id ? documents.find((d) => d.id === id) ?? null : null), [documents, id]);
  const openedHere = Boolean((location.state as { preview?: boolean } | null)?.preview);

  const close = useCallback(() => {
    // Opened from the page: going back restores it exactly (and the phone's
    // back button keeps working as expected afterwards). Opened from a
    // shared link: the parameter is simply removed.
    if (openedHere) {
      navigate(-1);
      return;
    }
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("doc");
        return next;
      },
      { replace: true },
    );
  }, [navigate, openedHere, setParams]);

  // Previous / next document: replaces the entry, so "back" still closes.
  const show = useCallback(
    (nextId: number) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("doc", String(nextId));
          return next;
        },
        { replace: true, state: location.state },
      ),
    [location.state, setParams],
  );

  useEffect(() => {
    if (doc) pushRecent(doc.id);
  }, [doc, pushRecent]);

  useEffect(() => {
    if (id && status === "ready" && !doc) {
      toast.warning("Document introuvable", "Il a peut-être été retiré de la bibliothèque.");
      close();
    }
  }, [id, doc, status, toast, close]);

  return <DocumentPreview doc={doc} onClose={close} onNavigate={show} />;
}
