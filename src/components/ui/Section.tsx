import React from "react";
import { Link } from "react-router-dom";

/** Section heading: uppercase label on desktop, title + "Voir tout" on mobile. */
export function Section({
  title,
  accent,
  to,
  action,
  children,
  className = "",
}: {
  title: string;
  /** Muted second part of the title (mobile style: "Trending · This week"). */
  accent?: string;
  to?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold lg:eyebrow">
          {title}
          {accent && <span className="font-medium text-ink-muted lg:font-extrabold lg:text-ink"> {accent}</span>}
        </h2>
        {action ??
          (to && (
            <Link to={to} className="shrink-0 text-[13px] font-semibold text-ink-muted transition hover:text-accent">
              Voir tout
            </Link>
          ))}
      </div>
      {children}
    </section>
  );
}

/** Horizontal scroller (mobile rows), with scroll snapping. */
export function HScroll({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`-mx-4 flex snap-x-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 scrollbar-none ${className}`}>
      {children}
    </div>
  );
}
