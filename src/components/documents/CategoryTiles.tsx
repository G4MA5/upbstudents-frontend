// Entry points of the "Documents" section: one tile per category, with the
// number of documents it holds (home page, desktop and mobile).
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLibrary } from "../../context/DocumentsContext";
import { CATEGORIES } from "../../lib/constants";
import { listItem } from "../../lib/motion";
import { Skeleton } from "../ui/Feedback";
import { categoryStyle } from "./category";

export function CategoryTiles() {
  const { documents, status } = useLibrary();
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const d of documents) c[d.type] = (c[d.type] ?? 0) + 1;
    return c;
  }, [documents]);

  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {CATEGORIES.map((c, i) => {
        const Icon = categoryStyle(c.value).icon;
        const n = counts[c.value] ?? 0;
        return (
          <motion.li key={c.value} {...listItem(i)}>
            <Link
              to={`/documents?type=${encodeURIComponent(c.value)}`}
              className="group flex h-full flex-col items-start gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-raised active:scale-[0.98] sm:flex-row sm:items-center sm:p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent transition-colors duration-standard group-hover:bg-brand-500 group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="w-full min-w-0 flex-1">
                <span className="block truncate font-bold text-ink">{c.label}</span>
                <span className="block truncate text-xs text-ink-muted">
                  {status === "loading" ? (
                    <Skeleton className="mt-1 h-3 w-16" />
                  ) : n ? (
                    `${n.toLocaleString("fr-FR")} document${n > 1 ? "s" : ""}`
                  ) : (
                    "Aucun document"
                  )}
                </span>
              </span>
              <ChevronRight
                className="hidden h-4 w-4 shrink-0 text-ink-faint transition group-hover:translate-x-0.5 group-hover:text-accent sm:block"
                aria-hidden
              />
            </Link>
          </motion.li>
        );
      })}
    </ul>
  );
}
