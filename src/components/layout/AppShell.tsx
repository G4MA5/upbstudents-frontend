// Application frame.
// Desktop (≥1024px): sidebar · top bar · content · right rail (≥1280px,
// only when FEATURES.rightRail is on).
// Mobile: content + bottom tab bar.
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FEATURES } from "../../lib/features";
import { readStorage, writeStorage } from "../../lib/storage";
import { PreviewHost } from "../documents/PreviewHost";
import { BottomNav } from "./BottomNav";
import { Footer } from "./Footer";
import { RightRail } from "./RightRail";
import { SearchDialog } from "./SearchDialog";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const RAIL_ROUTES = ["/", "/documents", "/bibliotheque"];
const SIDEBAR_KEY = "upb_menu_replie";
const SIDEBAR_OPEN = "248px";
const SIDEBAR_FOLDED = "84px";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);
  const rail = FEATURES.rightRail && RAIL_ROUTES.includes(pathname);

  // Folded sidebar (icons only), remembered between visits.
  const [folded, setFolded] = useState(() => readStorage<boolean>(SIDEBAR_KEY) === true);
  const toggleSidebar = useCallback(() => {
    setFolded((f) => {
      writeStorage(SIDEBAR_KEY, !f);
      return !f;
    });
  }, []);

  // "/" or Ctrl/⌘ + K opens the search from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
      if ((e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Ctrl/⌘ + B folds or unfolds the sidebar.
      if (e.key.toLowerCase() === "b" && (e.metaKey || e.ctrlKey) && !typing) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggleSidebar]);

  return (
    <div
      className="min-h-screen bg-card"
      style={{ "--sidebar-w": folded ? SIDEBAR_FOLDED : SIDEBAR_OPEN } as React.CSSProperties}
    >
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:shadow-raised"
      >
        Aller au contenu
      </a>
      <Sidebar collapsed={folded} onToggle={toggleSidebar} />
      <div className="transition-[padding-left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:pl-[var(--sidebar-w)]">
        <Topbar onSearch={openSearch} />
        <div className="flex">
          <main id="contenu" tabIndex={-1} className="flex min-h-[calc(100vh-var(--topbar-h))] min-w-0 flex-1 flex-col focus:outline-none">
            {children}
            <div className="pb-bottomnav lg:pb-0">
              <Footer />
            </div>
          </main>
          {rail && <RightRail />}
        </div>
      </div>
      <BottomNav />
      <SearchDialog open={searchOpen} onClose={closeSearch} />
      <PreviewHost />
    </div>
  );
}
