import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ClipboardCheck, Heart, LogOut, Megaphone, Upload, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../lib/format";
import { popover } from "../../lib/motion";
// ---------- Divine : diffusion WhatsApp (admins) ----------
import { useBroadcastAccess } from "../../lib/useBroadcastAccess";
// ---------- Divine : fin ----------

export function Avatar({ size = 36, className = "" }: { size?: number; className?: string }) {
  const { profile } = useAuth();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-extrabold text-white ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials(profile?.prenom, profile?.nom, profile?.email)}
    </span>
  );
}

export function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

/** Every menu shares the global popover motion. */
export const dropdownMotion = popover;

/** Avatar + name + status, with the account menu (desktop top bar). */
export function UserMenu() {
  const { profile, logout } = useAuth();
  // ---------- Divine : diffusion WhatsApp (admins) ----------
  const { allowed: canBroadcast } = useBroadcastAccess();
  // ---------- Divine : fin ----------
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));

  const name = [profile?.prenom, profile?.nom].filter(Boolean).join(" ") || "Mon compte";
  const item =
    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-ink-soft transition hover:bg-sunken hover:text-ink";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Menu du compte de ${name}`}
        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-2 transition hover:bg-sunken"
      >
        {/* App logo in place of the initials. */}
        <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-brand-500/10">
          <img src="/logo5.png" alt="" width={26} height={26} className="h-[26px] w-[26px] object-contain" />
        </span>
        <span className="hidden max-w-[140px] truncate text-left text-sm font-bold text-ink xl:block">
          {profile?.prenom || name}
        </span>
        <ChevronDown className={`h-4 w-4 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            {...dropdownMotion}
            className="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-line bg-card p-2 shadow-elevated"
          >
            <div className="flex items-center gap-3 rounded-xl bg-sunken p-3">
              <Avatar size={40} />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">{name}</p>
                <p className="truncate text-xs text-ink-muted">{profile?.email}</p>
              </div>
            </div>
            <div className="mt-2 flex flex-col">
              <Link to="/profil" role="menuitem" className={item} onClick={() => setOpen(false)}>
                <UserRound className="h-4 w-4" aria-hidden /> Mon profil
              </Link>
              <Link to="/bibliotheque" role="menuitem" className={item} onClick={() => setOpen(false)}>
                <Heart className="h-4 w-4" aria-hidden /> Mes favoris
              </Link>
              {profile?.proprietaire && (
                <>
                  <Link to="/ajouter" role="menuitem" className={item} onClick={() => setOpen(false)}>
                    <Upload className="h-4 w-4" aria-hidden /> Publier un document
                  </Link>
                  <Link to="/propositions" role="menuitem" className={item} onClick={() => setOpen(false)}>
                    <ClipboardCheck className="h-4 w-4" aria-hidden /> Propositions à valider
                  </Link>
                </>
              )}
              {/* ---------- Divine : diffusion WhatsApp (admins autorisés par le serveur) ---------- */}
              {canBroadcast && (
                <Link to="/diffusion" role="menuitem" className={item} onClick={() => setOpen(false)}>
                  <Megaphone className="h-4 w-4" aria-hidden /> Diffusion WhatsApp
                </Link>
              )}
              {/* ---------- Divine : fin ---------- */}
              <div className="my-1 h-px bg-line" />
              <button
                type="button"
                role="menuitem"
                className={`${item} text-red-600 hover:bg-red-500/10 hover:text-red-600`}
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden /> Se déconnecter
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
