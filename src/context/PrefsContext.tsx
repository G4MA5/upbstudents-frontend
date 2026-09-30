// Per-user preferences:
//  - favourites: stored in Supabase (via the API) for signed-in users;
//  - recently viewed documents and recent searches: kept on the device.
// Only document IDs are stored — every document itself comes from Supabase.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, ApiError, errorMessage } from "../lib/api";
import { readStorage, writeStorage } from "../lib/storage";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const RECENTS_KEY = "upb_recents";
const SEARCHES_KEY = "upb_recherches";
const MAX_RECENTS = 24;
const MAX_SEARCHES = 8;

interface PrefsValue {
  favorites: Set<number>;
  favoritesStatus: "idle" | "loading" | "ready" | "unavailable";
  isFavorite: (id: number) => boolean;
  toggleFavorite: (id: number, title?: string) => void;
  recents: number[];
  pushRecent: (id: number) => void;
  clearRecents: () => void;
  searches: string[];
  pushSearch: (q: string) => void;
  removeSearch: (q: string) => void;
  clearSearches: () => void;
}

const PrefsContext = createContext<PrefsValue | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [favoritesStatus, setFavoritesStatus] = useState<PrefsValue["favoritesStatus"]>("idle");
  const [recents, setRecents] = useState<number[]>(() => readStorage<number[]>(RECENTS_KEY) ?? []);
  const [searches, setSearches] = useState<string[]>(() => readStorage<string[]>(SEARCHES_KEY) ?? []);
  const pending = useRef(new Set<number>());

  // Favourites follow the account.
  useEffect(() => {
    if (status !== "authenticated") {
      setFavorites(new Set());
      setFavoritesStatus("idle");
      return;
    }
    let alive = true;
    setFavoritesStatus("loading");
    api<{ ids: number[] }>("/api/favoris", { auth: true })
      .then((res) => {
        if (!alive) return;
        setFavorites(new Set(res.ids));
        setFavoritesStatus("ready");
      })
      .catch((err) => {
        if (!alive) return;
        setFavoritesStatus(err instanceof ApiError && err.status === 503 ? "unavailable" : "ready");
      });
    return () => {
      alive = false;
    };
  }, [status]);

  const favoritesRef = useRef(favorites);
  favoritesRef.current = favorites;

  const toggleFavorite = useCallback(
    (id: number, title?: string) => {
      requireAuth(() => {
        if (pending.current.has(id)) return;
        pending.current.add(id);
        const adding = !favoritesRef.current.has(id);
        const apply = (add: boolean) =>
          setFavorites((prev) => {
            const next = new Set(prev);
            if (add) next.add(id);
            else next.delete(id);
            return next;
          });
        // Optimistic update, rolled back if the server refuses.
        apply(adding);
        api("/api/favoris", { method: adding ? "POST" : "DELETE", auth: true, body: { document_id: id } })
          .then(() => {
            if (adding) toast.success("Ajouté aux favoris", title);
            else toast.info("Retiré des favoris", title);
          })
          .catch((err) => {
            apply(!adding);
            toast.error("Favoris indisponibles", errorMessage(err));
          })
          .finally(() => pending.current.delete(id));
      }, "Connectez-vous pour enregistrer vos favoris.");
    },
    [requireAuth, toast],
  );

  const pushRecent = useCallback((id: number) => {
    setRecents((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX_RECENTS);
      writeStorage(RECENTS_KEY, next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    writeStorage(RECENTS_KEY, []);
  }, []);

  const pushSearch = useCallback((q: string) => {
    const value = q.trim();
    if (value.length < 2) return;
    setSearches((prev) => {
      const next = [value, ...prev.filter((x) => x.toLowerCase() !== value.toLowerCase())].slice(0, MAX_SEARCHES);
      writeStorage(SEARCHES_KEY, next);
      return next;
    });
  }, []);

  const removeSearch = useCallback((q: string) => {
    setSearches((prev) => {
      const next = prev.filter((x) => x !== q);
      writeStorage(SEARCHES_KEY, next);
      return next;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    writeStorage(SEARCHES_KEY, []);
  }, []);

  const value = useMemo<PrefsValue>(
    () => ({
      favorites,
      favoritesStatus,
      isFavorite: (id) => favorites.has(id),
      toggleFavorite,
      recents,
      pushRecent,
      clearRecents,
      searches,
      pushSearch,
      removeSearch,
      clearSearches,
    }),
    [favorites, favoritesStatus, toggleFavorite, recents, pushRecent, clearRecents, searches, pushSearch, removeSearch, clearSearches],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error("usePrefs must be used inside PrefsProvider");
  return ctx;
}
