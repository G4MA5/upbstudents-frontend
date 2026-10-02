// Typographic "book cover" generated for every Supabase document (documents
// have no cover image). The design is stable per document and stays within
// the orange / white / blue identity of the logo.
import { memo } from "react";
import type { LibraryDocument } from "../../types";
import { categoryStyle } from "./category";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface Variant {
  bg: string;
  title: string;
  meta: string;
  ornament: (size: Size) => React.ReactNode;
}

const VARIANTS: Variant[] = [
  {
    // Orange, white title, big white circle
    bg: "bg-brand-500",
    title: "text-white",
    meta: "text-white/80",
    ornament: () => <span className="absolute -bottom-[18%] -right-[22%] aspect-square w-[78%] rounded-full bg-white/15" />,
  },
  {
    // White paper, black title, orange band
    bg: "bg-[#FFFDFA]",
    title: "text-[#161618]",
    meta: "text-[#161618]/60",
    ornament: () => <span className="absolute inset-x-0 bottom-[18%] h-[9%] bg-brand-500" />,
  },
  {
    // Logo blue, orange title (the colors of the logo)
    bg: "bg-navy-800",
    title: "text-brand-400",
    meta: "text-white/65",
    ornament: () => (
      <span className="absolute -right-[10%] top-[8%] aspect-square w-[46%] rounded-full border-[3px] border-brand-500/70" />
    ),
  },
  {
    // Cream orange, black title, diagonal
    bg: "bg-brand-100",
    title: "text-[#161618]",
    meta: "text-[#161618]/60",
    ornament: () => (
      <span className="absolute -bottom-[30%] -right-[30%] h-[70%] w-[110%] -rotate-[28deg] bg-brand-500" />
    ),
  },
  {
    // White, big orange sun (like the classic essay covers)
    bg: "bg-white",
    title: "text-[#161618]",
    meta: "text-[#161618]/55",
    ornament: () => <span className="absolute bottom-[12%] left-1/2 aspect-square w-[42%] -translate-x-1/2 rounded-full bg-brand-500" />,
  },
  {
    // Deep orange, white title, stripes
    bg: "bg-brand-700",
    title: "text-white",
    meta: "text-white/75",
    ornament: () => (
      <span className="absolute inset-x-0 bottom-0 h-[26%] bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.18)_0_6px,transparent_6px_14px)]" />
    ),
  },
];

const TITLE_SIZE: Record<Size, string> = {
  xs: "text-[7px] leading-[1.1]",
  sm: "text-[10px] leading-[1.1]",
  md: "text-[13px] leading-[1.1]",
  lg: "text-lg leading-[1.05]",
  xl: "text-2xl leading-[1.05]",
};

const META_SIZE: Record<Size, string> = {
  xs: "text-[5px]",
  sm: "text-[7px]",
  md: "text-[9px]",
  lg: "text-[11px]",
  xl: "text-xs",
};

const PAD: Record<Size, string> = {
  xs: "p-1.5",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
  xl: "p-5",
};

export function coverVariant(id: number) {
  return VARIANTS[Math.abs(id * 7 + 3) % VARIANTS.length];
}

function DocCoverBase({
  doc,
  size = "md",
  square = false,
  className = "",
}: {
  doc: LibraryDocument;
  size?: Size;
  square?: boolean;
  className?: string;
}) {
  const v = coverVariant(doc.id);
  const style = categoryStyle(doc.type);
  const kicker = [style.label, doc.session].filter(Boolean).join(" · ");

  return (
    <div
      aria-hidden
      className={`relative isolate overflow-hidden rounded-lg shadow-cover ${square ? "aspect-square" : "aspect-[3/4]"} ${v.bg} ${className}`}
    >
      {v.ornament(size)}
      {/* spine */}
      {!square && <span className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/20 via-black/5 to-transparent" />}
      <div className={`absolute inset-0 flex flex-col ${PAD[size]} ${square ? "" : "pl-[12%]"}`}>
        <span className={`font-bold uppercase tracking-[0.12em] ${META_SIZE[size]} ${v.meta}`}>{kicker}</span>
        <span
          className={`mt-[6%] line-clamp-4 break-words font-extrabold uppercase ${TITLE_SIZE[size]} ${v.title}`}
        >
          {doc.title}
        </span>
        <span className={`mt-auto font-semibold uppercase tracking-wider ${META_SIZE[size]} ${v.meta}`}>
          {doc.auteur ? `${doc.auteur} · ` : ""}
          {doc.filiere}
          {doc.annee ? ` · ${doc.annee}` : ""}
        </span>
      </div>
    </div>
  );
}

export const DocCover = memo(DocCoverBase);
