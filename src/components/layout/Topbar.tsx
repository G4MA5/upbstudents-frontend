// Desktop top bar: search (also Ctrl/⌘ + K or "/"), new documents, account.
import { LogIn, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../ui/Feedback";
import { Notifications } from "./Notifications";
import { UserMenu } from "./UserMenu";

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export function Topbar({ onSearch }: { onSearch: () => void }) {
  const { status, openAuth } = useAuth();

  return (
    <header className="sticky top-0 z-30 hidden h-[var(--topbar-h)] items-center gap-4 border-b border-line bg-card/85 px-8 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 lg:flex">
      <button
        type="button"
        onClick={onSearch}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K"
        className="group flex h-10 w-full max-w-md items-center gap-3 rounded-full bg-sunken pl-4 pr-2 text-left text-sm text-ink-faint transition hover:bg-line/80 active:scale-[0.99]"
      >
        <Search className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-ink-soft" aria-hidden />
        <span className="min-w-0 flex-1 truncate">Rechercher un document…</span>
        <kbd className="hidden shrink-0 rounded-md border border-line bg-card px-1.5 py-0.5 font-sans text-[11px] font-semibold text-ink-muted xl:inline">
          {isMac ? "⌘ K" : "Ctrl K"}
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-4">
        <Notifications />
        <span className="h-8 w-px bg-line" aria-hidden />
        {status === "loading" ? (
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="hidden h-8 w-20 xl:block" />
          </div>
        ) : status === "authenticated" ? (
          <UserMenu />
        ) : (
          <button
            type="button"
            onClick={() => openAuth("login")}
            className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-brand-700 px-5 text-sm font-bold text-white shadow-glow transition hover:bg-brand-800 active:scale-[0.97]"
          >
            <LogIn className="h-4 w-4" aria-hidden /> Se connecter
          </button>
        )}
      </div>
    </header>
  );
}
