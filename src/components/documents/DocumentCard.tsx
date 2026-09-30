import { memo } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { usePrefs } from "../../context/PrefsContext";
import { listItem, SPRING } from "../../lib/motion";
import type { LibraryDocument } from "../../types";
import { Skeleton } from "../ui/Feedback";
import { DocCover } from "./DocCover";
import { Highlight } from "./Highlight";

export function subtitleOf(doc: LibraryDocument) {
  return [doc.filiere, doc.niveau].filter(Boolean).join(" · ");
}

/** Cover + title + subtitle ("Recently played" / "Trending" tiles). */
function CoverTileBase({
  doc,
  onOpen,
  tokens = [],
  index = 0,
  square = false,
  size = "md",
}: {
  doc: LibraryDocument;
  onOpen: (doc: LibraryDocument) => void;
  tokens?: string[];
  index?: number;
  square?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const { isFavorite, toggleFavorite } = usePrefs();
  const fav = isFavorite(doc.id);

  return (
    <motion.article {...listItem(index)} className="group relative min-w-0">
      {/* Lifts on hover; on touch screens, a short press-in instead. */}
      <div className="relative transition-transform duration-standard group-hover:-translate-y-1 group-active:translate-y-0 group-active:scale-[0.98]">
        <DocCover doc={doc} square={square} size={size} />
        <span className="pointer-events-none absolute inset-0 rounded-lg bg-black/0 transition duration-standard group-hover:bg-black/10" />
      </div>
      <button
        type="button"
        onClick={() => toggleFavorite(doc.id, doc.title)}
        aria-pressed={fav}
        aria-label={fav ? `Retirer des favoris : ${doc.title}` : `Ajouter aux favoris : ${doc.title}`}
        className={`absolute right-1.5 top-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#161618] shadow-card backdrop-blur transition hover:scale-105 active:scale-90 ${
          fav ? "opacity-100" : "opacity-100 lg:opacity-0 lg:focus-visible:opacity-100 lg:group-hover:opacity-100"
        }`}
      >
        <motion.span key={fav ? "on" : "off"} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={SPRING.pop} className="flex">
          <Heart className={`h-4 w-4 ${fav ? "fill-brand-500 text-brand-500" : ""}`} />
        </motion.span>
      </button>
      <h3 className="mt-2.5 line-clamp-1 text-[13px] font-bold text-ink sm:text-sm">
        <button
          type="button"
          onClick={() => onOpen(doc)}
          className="text-left after:absolute after:inset-0 after:content-[''] focus:outline-none"
          aria-label={`Voir le document : ${doc.title}`}
        >
          <Highlight text={doc.title} tokens={tokens} />
        </button>
      </h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{subtitleOf(doc)}</p>
    </motion.article>
  );
}

export const CoverTile = memo(CoverTileBase);

/** Horizontal card with thumbnail ("Most popular"); the whole card opens the document. */
function RowCardBase({
  doc,
  onOpen,
  index = 0,
}: {
  doc: LibraryDocument;
  onOpen: (doc: LibraryDocument) => void;
  index?: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(doc)}
      {...listItem(index)}
      className="group flex w-full items-center gap-3.5 rounded-2xl border border-line bg-card p-2.5 pr-4 text-left shadow-card transition duration-standard hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-raised active:scale-[0.98]"
    >
      <DocCover doc={doc} square size="xs" className="w-16 shrink-0 rounded-md sm:w-[72px]" />
      <span className="min-w-0 flex-1">
        <span className="line-clamp-1 text-sm font-bold text-ink">{doc.title}</span>
        <span className="mt-1 block truncate text-xs text-ink-muted">
          {[doc.type, doc.filiere, doc.annee].filter(Boolean).join(" · ")}
        </span>
      </span>
    </motion.button>
  );
}

export const RowCard = memo(RowCardBase);

export function CoverTileSkeleton({ square = false }: { square?: boolean }) {
  return (
    <div aria-hidden>
      <Skeleton className={`${square ? "aspect-square" : "aspect-[3/4]"} w-full rounded-lg`} />
      <Skeleton className="mt-2.5 h-3.5 w-4/5" />
      <Skeleton className="mt-1.5 h-3 w-1/2" />
    </div>
  );
}

export function RowCardSkeleton() {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-card p-2.5" aria-hidden>
      <Skeleton className="h-16 w-16 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export function CoverGridSkeleton({ count = 10, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={className} role="status" aria-label="Chargement des documents…">
      {Array.from({ length: count }, (_, i) => (
        <CoverTileSkeleton key={i} />
      ))}
    </div>
  );
}
