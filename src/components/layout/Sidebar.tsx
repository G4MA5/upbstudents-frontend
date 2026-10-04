// Desktop sidebar, foldable to icons only:
//   Accueil · Documents (categories) · Ma bibliothèque · Contribuer, then the
//   account and contact links pinned at the bottom.
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  FileCheck2,
  FilePlus2,
  FlaskConical,
  GraduationCap,
  Heart,
  History,
  House,
  Layers,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  NotebookPen,
  Scroll,
  Upload,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SPRING, TRANSITION } from "../../lib/motion";
// ---------- Divine : diffusion WhatsApp (admins) ----------
import { useBroadcastAccess } from "../../lib/useBroadcastAccess";
// ---------- Divine : fin ----------
import { Logo } from "../ui/Logo";
import { Tooltip } from "../ui/Tooltip";

interface Item {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Returns true when this entry is the current page. */
  match: (path: string, params: URLSearchParams) => boolean;
}

const docsWith = (type: string | null) => (path: string, p: URLSearchParams) =>
  path === "/documents" && (p.get("type") ?? null) === type;
const libraryView = (view: string) => (path: string, p: URLSearchParams) =>
  path === "/bibliotheque" && (p.get("vue") ?? "favoris") === view;

const HOME: Item[] = [{ label: "Accueil", to: "/", icon: House, match: (p) => p === "/" }];

const DOCUMENTS: Item[] = [
  { label: "Tous les documents", to: "/documents", icon: LayoutGrid, match: docsWith(null) },
  { label: "Examens", to: "/documents?type=Examen", icon: FileCheck2, match: docsWith("Examen") },
  { label: "Cours", to: "/documents?type=Cours", icon: GraduationCap, match: docsWith("Cours") },
  { label: "TD", to: "/documents?type=TD", icon: NotebookPen, match: docsWith("TD") },
  { label: "TP", to: "/documents?type=TP", icon: FlaskConical, match: docsWith("TP") },
  { label: "Mémoires", to: "/documents?type=Mémoire", icon: Scroll, match: docsWith("Mémoire") },
  { label: "Livres", to: "/documents?type=Livre", icon: BookOpen, match: docsWith("Livre") },
];

const LIBRARY: Item[] = [
  { label: "Favoris", to: "/bibliotheque?vue=favoris", icon: Heart, match: libraryView("favoris") },
  { label: "Récents", to: "/bibliotheque?vue=recents", icon: History, match: libraryView("recents") },
  { label: "Collections", to: "/bibliotheque?vue=collections", icon: Layers, match: libraryView("collections") },
];

function NavGroup({ title, items, collapsed }: { title?: string; items: Item[]; collapsed: boolean }) {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  return (
    <div>
      {title && (
        <p className="relative mb-2 h-4 whitespace-nowrap px-7 text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
          <span className={`transition-opacity duration-standard ${collapsed ? "opacity-0" : "opacity-100"}`}>{title}</span>
          {/* Folded: the section title becomes a short separator. */}
          <span
            aria-hidden
            className={`absolute left-7 top-1/2 h-px w-7 bg-line-strong transition-opacity duration-standard ${collapsed ? "opacity-100" : "opacity-0"}`}
          />
        </p>
      )}
      <ul>
        {items.map(({ label, to, icon: Icon, match }) => {
          const active = match(pathname, params);
          return (
            <li key={to} className="relative">
              <Tooltip label={label} disabled={!collapsed}>
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  aria-label={collapsed ? label : undefined}
                  className={`group relative isolate flex items-center gap-3.5 whitespace-nowrap px-7 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "text-accent" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {/* Active marker slides between entries of the menu. */}
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      transition={SPRING.snappy}
                      className="absolute inset-y-1 left-3 right-3 -z-10 rounded-xl bg-accent-soft"
                      aria-hidden
                    />
                  )}
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-[background-color,color,transform] group-active:scale-90 ${
                      active ? "bg-brand-500 text-white shadow-glow" : "text-ink-faint group-hover:text-ink-soft"
                    }`}
                  >
                    <Icon className="h-[17px] w-[17px]" aria-hidden />
                  </span>
                  <span className={`transition-opacity duration-standard ${collapsed ? "opacity-0" : "opacity-100 delay-75"}`}>
                    {label}
                  </span>
                </Link>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { profile, status } = useAuth();
  // ---------- Divine : diffusion WhatsApp (admins) ----------
  const { allowed: canBroadcast } = useBroadcastAccess();
  // ---------- Divine : fin ----------

  const contribute: Item[] = [
    { label: "Proposer un document", to: "/proposer", icon: FilePlus2, match: (p) => p === "/proposer" },
    ...(profile?.proprietaire
      ? [
          { label: "Publier", to: "/ajouter", icon: Upload, match: (p: string) => p === "/ajouter" },
          { label: "Propositions", to: "/propositions", icon: ClipboardCheck, match: (p: string) => p === "/propositions" },
        ]
      : []),
    // ---------- Divine : diffusion WhatsApp (admins autorisés par le serveur) ----------
    ...(canBroadcast
      ? [{ label: "Diffusion", to: "/diffusion", icon: Megaphone, match: (p: string) => p === "/diffusion" }]
      : []),
    // ---------- Divine : fin ----------
  ];

  const account: Item[] = [
    {
      label: status === "authenticated" ? "Mon compte" : "Compte",
      to: "/profil",
      icon: UserRound,
      match: (p) => p === "/profil",
    },
    { label: "Contact et aide", to: "/contact", icon: MessageCircle, match: (p) => p === "/contact" },
  ];

  const toggleLabel = collapsed ? "Déplier le menu" : "Replier le menu";

  return (
    <>
      <aside
        id="menu-principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-w)] flex-col overflow-x-hidden border-r border-line bg-card transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex"
        aria-label="Navigation principale"
      >
        <div className="flex h-[var(--topbar-h)] shrink-0 items-center px-6">
          <Logo compact={collapsed} />
        </div>
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin">
          <NavGroup items={HOME} collapsed={collapsed} />
          <NavGroup title="Documents" items={DOCUMENTS} collapsed={collapsed} />
          <NavGroup title="Ma bibliothèque" items={LIBRARY} collapsed={collapsed} />
          <NavGroup title="Contribuer" items={contribute} collapsed={collapsed} />
          <div className="mt-auto border-t border-line pt-3">
            <NavGroup items={account} collapsed={collapsed} />
          </div>
        </nav>
      </aside>

      {/* Fold / unfold, on the edge of the menu (Ctrl/⌘ + B). */}
      <div
        className="fixed z-50 hidden -translate-x-1/2 -translate-y-1/2 transition-[left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block"
        style={{ left: "var(--sidebar-w)", top: "calc(var(--topbar-h) / 2)" }}
      >
        <Tooltip label={`${toggleLabel} (Ctrl + B)`}>
          <button
            type="button"
            onClick={onToggle}
            aria-label={toggleLabel}
            aria-expanded={!collapsed}
            aria-controls="menu-principal"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-card text-ink-muted shadow-raised transition hover:border-brand-500 hover:text-accent"
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={TRANSITION.large} className="flex">
              <ChevronLeft className="h-4 w-4" />
            </motion.span>
          </button>
        </Tooltip>
      </div>
    </>
  );
}
