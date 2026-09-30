import { BookOpen, FileCheck2, FlaskConical, NotebookPen, type LucideIcon } from "lucide-react";
import { CATEGORIES } from "../../lib/constants";

interface CategoryStyle {
  label: string;
  plural: string;
  icon: LucideIcon;
}

const STYLES: Record<string, CategoryStyle> = {
  Examen: { label: "Examen", plural: "Examens", icon: FileCheck2 },
  TD: { label: "TD", plural: "TD", icon: NotebookPen },
  TP: { label: "TP", plural: "TP", icon: FlaskConical },
  Livre: { label: "Livre", plural: "Livres", icon: BookOpen },
};

export function categoryStyle(type: string): CategoryStyle {
  if (STYLES[type]) return STYLES[type];
  const known = CATEGORIES.find((c) => c.value.toLowerCase() === type?.toLowerCase());
  return known ? STYLES[known.value] : { label: type || "Document", plural: type || "Documents", icon: FileCheck2 };
}

export function CategoryChip({ type, className = "" }: { type: string; className?: string }) {
  const style = categoryStyle(type);
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {style.label}
    </span>
  );
}

/** Filière label, in the institutional blue (secondary identity color). */
export function FiliereBadge({ filiere, className = "" }: { filiere: string; className?: string }) {
  if (!filiere) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-secondary-soft px-2.5 py-0.5 text-xs font-bold text-secondary-text ${className}`}
    >
      {filiere}
    </span>
  );
}
