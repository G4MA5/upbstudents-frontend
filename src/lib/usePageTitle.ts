import { useEffect } from "react";

const SITE = "UpB Student's";

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SITE}` : `${SITE} · Bibliothèque numérique`;
  }, [title]);
}
