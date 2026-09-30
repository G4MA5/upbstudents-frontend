import { Link } from "react-router-dom";

export function Footer() {
  const year = Math.max(new Date().getFullYear(), 2026);
  return (
    <footer className="mt-auto border-t border-line px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="text-sm text-ink-muted">
          <p className="font-bold text-ink">UpB Student's · Bibliothèque numérique</p>
          <p className="mt-1">Université Polytechnique de Bingerville, Côte d’Ivoire</p>
          <p className="mt-1">
            <a href="mailto:Gamalabs2.0@gmail.com" className="hover:text-accent">Gamalabs2.0@gmail.com</a>
            <span className="mx-2 text-ink-faint">·</span>
            <a href="tel:+2250172489331" className="hover:text-accent">+225 01 72 48 93 31</a>
          </p>
          <nav className="mt-3 flex flex-wrap gap-x-5 gap-y-1 font-semibold" aria-label="Liens utiles">
            <Link to="/documents" className="hover:text-accent">Documents</Link>
            <Link to="/proposer" className="hover:text-accent">Proposer un document</Link>
            <Link to="/contact" className="hover:text-accent">Contact</Link>
            <Link to={`/contact?objet=${encodeURIComponent("Signaler un problème")}`} className="hover:text-accent">
              Signaler un problème
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3 text-sm text-ink-muted lg:items-end">
          <a
            href="mailto:Gamalabs2.0@gmail.com"
            className="group inline-flex w-fit items-center gap-3 rounded-full border border-line bg-card py-1.5 pl-1.5 pr-4 shadow-card transition hover:border-brand-500/40"
          >
            <img src="/logo_gama.png" alt="" width={30} height={30} loading="lazy" className="h-[30px] w-[30px] rounded-full bg-white object-contain p-0.5" />
            <span>
              Conçu et développé par{" "}
              <strong className="font-extrabold text-ink group-hover:text-accent">Gama Labs</strong>
            </span>
          </a>
          <p className="text-xs">© 2025–{year} UpB Student’s. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
