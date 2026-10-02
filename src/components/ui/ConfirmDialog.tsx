import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  loading,
  loadingText = "Suppression…",
  tone = "danger",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  loading?: boolean;
  // ---------- Divine : options ajoutées pour la diffusion WhatsApp (valeurs par défaut = ancien comportement) ----------
  /** Texte du bouton pendant l'action (par défaut : suppression). */
  loadingText?: string;
  /** "danger" (rouge, suppression) ou "primary" (action normale). */
  tone?: "danger" | "primary";
  // ---------- Divine : fin ----------
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={() => !loading && onCancel()} size="sm" ariaLabel={title}>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === "danger" ? "bg-red-500/10 text-red-600" : "bg-accent-soft text-accent"}`}>
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <div className="mt-2 text-[15px] text-ink-muted">{children}</div>
        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant={tone} onClick={onConfirm} loading={loading} loadingText={loadingText}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
