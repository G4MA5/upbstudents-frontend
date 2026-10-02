import React, { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, FileText, Image as ImageIcon, Trash2, UploadCloud } from "lucide-react";
import { ACCEPTED_FILES, MAX_UPLOAD_BYTES, MIME_BY_EXTENSION } from "../../lib/constants";
import { extensionOf, formatBytes } from "../../lib/format";

export function checkFile(file: File): string {
  if (!MIME_BY_EXTENSION[extensionOf(file.name)]) {
    return "Format non pris en charge. Formats acceptés : PDF, DOC, DOCX, PNG, JPG.";
  }
  if (file.size === 0) return "Ce fichier est vide.";
  if (file.size > MAX_UPLOAD_BYTES) return "Le fichier dépasse la taille maximale de 20 Mo.";
  return "";
}

export function FileDropzone({
  file,
  onChange,
  error,
  disabled,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const shownError = localError || error;

  const pick = (candidate?: File | null) => {
    if (!candidate) return;
    const problem = checkFile(candidate);
    setLocalError(problem);
    onChange(problem ? null : candidate);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) pick(e.dataTransfer.files?.[0]);
  };

  const isImage = file && /\.(png|jpe?g)$/i.test(file.name);

  return (
    <div className="flex w-full min-w-0 max-w-full flex-col gap-1.5 overflow-hidden">
      <span className="text-sm font-medium text-ink-soft" id={`${id}-label`}>
        Fichier
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {file ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex w-full min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-card text-emerald-700 shadow-card">
              {isImage ? <ImageIcon className="h-6 w-6" aria-hidden /> : <FileText className="h-6 w-6" aria-hidden />}
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate font-medium text-ink break-all" title={file.name}>
                {file.name}
              </p>
              <p className="truncate text-sm text-ink-muted">
                {extensionOf(file.name).toUpperCase()} · {formatBytes(file.size)}
              </p>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition hover:bg-red-500/10 hover:text-red-600"
                aria-label="Retirer le fichier"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.label
            key="drop"
            htmlFor={id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-[background-color,border-color,box-shadow] duration-200 focus-within:border-ink-faint focus-within:bg-card focus-within:shadow-raised max-w-full overflow-hidden ${
              dragging
                ? "border-brand-500 bg-accent-soft"
                : shownError
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-line-strong bg-canvas hover:border-brand-500/40 hover:bg-accent-soft"
            }`}
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-card text-accent shadow-card">
              <UploadCloud className="h-6 w-6" aria-hidden />
            </span>
            <span className="mt-3 max-w-full truncate font-semibold text-ink">
              <span className="text-accent">Choisissez un fichier</span>
              <span className="hidden sm:inline"> ou glissez-le ici</span>
            </span>
            <span className="mt-1 max-w-full truncate text-sm text-ink-muted">PDF, DOC, DOCX, PNG ou JPG · 20 Mo maximum</span>
            <input
              id={id}
              type="file"
              accept={ACCEPTED_FILES}
              disabled={disabled}
              className="sr-only"
              aria-labelledby={`${id}-label`}
              aria-describedby={shownError ? `${id}-error` : undefined}
              onChange={(e) => {
                pick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </motion.label>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {shownError && !file && (
          <motion.p
            id={`${id}-error`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-1.5 text-[13px] font-medium text-red-600"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {shownError}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
