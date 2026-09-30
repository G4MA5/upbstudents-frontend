// Loaded on demand: text extraction of Word (.docx) files for the preview.
import { useEffect, useState } from "react";
import { Skeleton } from "../ui/Feedback";

export default function DocxViewer({ url, onError }: { url: string; onError?: () => void }) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [{ default: mammoth }, buffer] = await Promise.all([
          import("mammoth/mammoth.browser.min.js"),
          fetch(url).then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            return r.arrayBuffer();
          }),
        ]);
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        if (alive) setText(result.value.trim());
      } catch {
        if (alive) onError?.();
      }
    })();
    return () => {
      alive = false;
    };
  }, [url, onError]);

  if (text === null) {
    return (
      <div className="mx-auto w-full max-w-[820px] space-y-3 rounded-md bg-card p-8 shadow-raised">
        {[90, 100, 95, 70, 100, 85, 60].map((w, i) => (
          <div key={i} style={{ width: `${w}%` }}>
            <Skeleton className="h-3.5" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[820px] rounded-md bg-card p-6 shadow-raised sm:p-10">
      <p className="mb-4 rounded-lg bg-sunken px-3 py-2 text-xs text-accent">
        Aperçu du texte uniquement : la mise en page d'origine est visible après téléchargement.
      </p>
      <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-ink-soft">
        {text || "Ce document ne contient pas de texte lisible."}
      </div>
    </div>
  );
}
