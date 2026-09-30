// Documents added since the last visit (desktop bell, mobile tab badge).
// The "last seen" marker is one shared store: the bell and the tab badge
// used to keep separate copies, so clearing one left the other stale.
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useLibrary } from "../context/DocumentsContext";
import { readStorage, writeStorage } from "./storage";

const KEY = "upb_dernier_vu";

let lastSeen: number | null = readStorage<number>(KEY);
const listeners = new Set<() => void>();

function setLastSeen(value: number) {
  if (value === lastSeen) return;
  lastSeen = value;
  writeStorage(KEY, value);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => lastSeen;

export function useUnseenDocuments() {
  const { documents, status } = useLibrary();
  const seen = useSyncExternalStore(subscribe, getSnapshot);

  const maxId = useMemo(() => documents.reduce((m, d) => Math.max(m, d.id), 0), [documents]);

  // First visit: everything counts as seen (no flood of notifications).
  useEffect(() => {
    if (status === "ready" && seen === null && maxId > 0) setLastSeen(maxId);
  }, [status, seen, maxId]);

  const unseen = seen === null ? 0 : documents.filter((d) => d.id > seen).length;

  const markSeen = useCallback(() => {
    if (maxId) setLastSeen(maxId);
  }, [maxId]);

  return { unseen, lastSeen: seen, markSeen };
}
