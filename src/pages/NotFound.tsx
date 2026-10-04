import { ArrowLeft, BookOpen } from "lucide-react";
import { ButtonLink } from "../components/ui/Button";
import { useSeoHead } from "../lib/useSeoHead";

export default function NotFound() {
  useSeoHead({ customPath: "/404" });
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-extrabold text-brand-500">404</p>
      <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Cette page n'existe pas</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Le lien est peut-être incorrect ou la page a été déplacée.
      </p>
      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <ButtonLink to="/" variant="outline" icon={<ArrowLeft className="h-4 w-4" />}>
          Retour à l'accueil
        </ButtonLink>
        <ButtonLink to="/documents" icon={<BookOpen className="h-4 w-4" />}>
          Voir les documents
        </ButtonLink>
      </div>
    </div>
  );
}
