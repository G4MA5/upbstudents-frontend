// Mobile tab bar: floating frosted capsule, outline icons that become
// filled and orange when active, a tinted capsule sliding behind the active
// tab, round count badges.
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { SPRING } from "../../lib/motion";
import { useUnseenDocuments } from "../../lib/useUnseenDocuments";
import { Avatar } from "./UserMenu";

type IconProps = { filled: boolean };

// 24×24 icons in the SF Symbols spirit: outline (inactive) / filled (active).
function HomeIcon({ filled }: IconProps) {
  const d = "M12 3.2 3.4 10.4V20a1 1 0 0 0 1 1h4.9v-6.1h5.4V21h4.9a1 1 0 0 0 1-1v-9.6z";
  return filled ? (
    <path d={d} fill="currentColor" />
  ) : (
    <path d={d} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
  );
}

function DocumentsIcon({ filled }: IconProps) {
  // Two stacked sheets (the document collection).
  const back = "M8.5 2.8h8.2a2.3 2.3 0 0 1 2.3 2.3v11.2";
  const sheet = "M6.3 5.6h8.4a1.8 1.8 0 0 1 1.8 1.8v12a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8v-12a1.8 1.8 0 0 1 1.8-1.8z";
  const lines = "M7.8 10.6h5.4M7.8 13.8h5.4M7.8 17h3.2";
  return filled ? (
    <>
      <path d={back} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
      <path d={sheet} fill="currentColor" />
      <path d={lines} stroke="rgb(var(--color-surface))" strokeWidth={1.5} strokeLinecap="round" />
    </>
  ) : (
    <>
      <path d={back} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
      <path d={sheet} fill="none" stroke="currentColor" strokeWidth={1.7} />
      <path d={lines} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </>
  );
}

function AddIcon({ filled }: IconProps) {
  const square = "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5z";
  const plus = "M11.1 7.2h1.8v3.9h3.9v1.8h-3.9v3.9h-1.8v-3.9H7.2v-1.8h3.9z";
  return filled ? (
    <path d={`${square}${plus}`} fill="currentColor" fillRule="evenodd" />
  ) : (
    <>
      <path d={square} fill="none" stroke="currentColor" strokeWidth={1.7} />
      <path d="M12 7.6v8.8M7.6 12h8.8" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" />
    </>
  );
}

function LibraryIcon({ filled }: IconProps) {
  const d = "M6.4 3h11.2a1.4 1.4 0 0 1 1.4 1.4V21l-7-4.6L5 21V4.4A1.4 1.4 0 0 1 6.4 3z";
  return filled ? (
    <path d={d} fill="currentColor" />
  ) : (
    <path d={d} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
  );
}

function ProfileIcon({ filled }: IconProps) {
  const head = "M12 3.4a4.2 4.2 0 1 1 0 8.4 4.2 4.2 0 0 1 0-8.4z";
  const body = "M4.2 20.1c.9-3.7 4-6.1 7.8-6.1s6.9 2.4 7.8 6.1a.8.8 0 0 1-.8 1H5a.8.8 0 0 1-.8-1z";
  return filled ? (
    <path d={`${head}${body}`} fill="currentColor" />
  ) : (
    <>
      <path d={head} fill="none" stroke="currentColor" strokeWidth={1.7} />
      <path d={body} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" />
    </>
  );
}

const TABS = [
  { to: "/", label: "Accueil", Icon: HomeIcon, end: true },
  { to: "/documents", label: "Documents", Icon: DocumentsIcon },
  { to: "/proposer", label: "Proposer", Icon: AddIcon },
  { to: "/bibliotheque", label: "Bibliothèque", Icon: LibraryIcon },
  { to: "/profil", label: "Profil", Icon: ProfileIcon },
];

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={SPRING.pop}
      className="absolute -top-2 left-[calc(50%+4px)] flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-brand-500 px-1.5 text-[13px] font-semibold leading-none text-white"
      aria-hidden
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

export function BottomNav() {
  const { status } = useAuth();
  const { pathname } = useLocation();
  const { unseen, markSeen } = useUnseenDocuments();

  // Opening Documents counts as having seen the new documents (like reading
  // a chat clears its WhatsApp badge).
  useEffect(() => {
    if (pathname === "/documents" && unseen > 0) markSeen();
  }, [pathname, unseen, markSeen]);

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-3 z-40 mx-auto max-w-md lg:hidden"
      style={{ bottom: "max(12px, calc(env(safe-area-inset-bottom) - 4px))" }}
    >
      {/* Floating "liquid glass" capsule (iOS 26 / WhatsApp). */}
      <ul className="liquid-glass flex h-[var(--tabbar-h)] items-stretch gap-0.5 rounded-full p-1.5">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to} className="relative flex min-w-0 flex-auto">
            <NavLink
              to={to}
              end={end}
              aria-label={to === "/documents" && unseen ? `${label}, ${unseen} nouveau${unseen > 1 ? "x" : ""}` : undefined}
              className={({ isActive }) =>
                `group relative flex w-full select-none flex-col items-center justify-center rounded-full px-1.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive ? "text-accent" : "text-ink-soft"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Grey capsule that slides to the active tab. */}
                  {isActive && (
                    <motion.span
                      layoutId="tabbar-capsule"
                      aria-hidden
                      className="absolute inset-0 rounded-full bg-brand-500/[0.12] dark:bg-brand-500/[0.18]"
                      transition={SPRING.snappy}
                    />
                  )}
                  <span className="relative flex flex-col items-center gap-[3px] transition-transform duration-150 group-active:scale-90">
                    <span className="relative flex h-[28px] items-center justify-center">
                      <motion.span
                        // Small bounce each time the tab becomes active.
                        key={isActive ? "on" : "off"}
                        initial={isActive ? { scale: 0.8 } : false}
                        animate={{ scale: 1 }}
                        transition={SPRING.pop}
                        className="flex"
                      >
                        {to === "/profil" && status === "authenticated" ? (
                          <span className="relative flex">
                            <Avatar size={28} className="ring-[1.5px] ring-black/20 dark:ring-white/30" />
                            <span className="absolute -right-0.5 -top-0.5 h-[11px] w-[11px] rounded-full bg-brand-500 ring-2 ring-white dark:ring-[#222225]" />
                          </span>
                        ) : (
                          <svg viewBox="0 0 24 24" width={28} height={28} aria-hidden>
                            <Icon filled={isActive} />
                          </svg>
                        )}
                      </motion.span>
                      {to === "/documents" && <Badge count={unseen} />}
                    </span>
                    <span
                      className={`whitespace-nowrap text-[11px] leading-none tracking-[-0.01em] xs:text-[12px] ${
                        isActive ? "font-bold" : "font-medium"
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
