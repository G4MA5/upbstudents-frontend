import { highlightParts } from "../../lib/search";

export function Highlight({ text, tokens }: { text: string; tokens: string[] }) {
  return (
    <>
      {highlightParts(text, tokens).map((part, i) =>
        part.match ? (
          <mark key={i} className="rounded-sm bg-brand-500/15 px-0.5 text-inherit">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}
