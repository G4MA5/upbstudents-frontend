import { useSeoHead } from "./useSeoHead";

/**
 * Hook de titre de page conservé pour la compatibilité descendante.
 * Délègue désormais au hook complet useSeoHead.
 */
export function usePageTitle(title?: string) {
  useSeoHead(title ? { title: `${title} · UpB Student's` } : undefined);
}
