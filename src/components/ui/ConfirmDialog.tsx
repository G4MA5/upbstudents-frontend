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
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={() => !loading && onCancel()} size="sm" ariaLabel={title}>
      <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-600">
          <AlertTriangle className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        <div className="mt-2 text-[15px] text-ink-muted">{children}</div>
        <div className="mt-6 flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} loadingText="Suppression…">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
