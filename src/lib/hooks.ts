import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useMediaQuery(query: string) {
  const get = () => typeof window !== "undefined" && window.matchMedia(query).matches;
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    // Safari < 14 only supports addListener.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    // Safety net: some browsers/emulators miss the "change" event (e.g. when
    // a tablet rotates across the breakpoint).
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, [query]);
  return matches;
}

/** Desktop layout (sidebar + top bar) from 1024px. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/**
 * Opens the document preview on the current page (?doc=ID), so it works from
 * any screen and the back button closes it.
 */
export function useOpenDocument() {
  const [, setParams] = useSearchParams();
  return useCallback(
    (doc: { id: number }) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("doc", String(doc.id));
          return next;
        },
        // Lets the preview know it may close with a "back" (no duplicate
        // history entry left behind).
        { state: { preview: true } },
      ),
    [setParams],
  );
}
