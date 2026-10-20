import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { MemberCard } from "../components/team/MemberCard";
import { SocialLinks } from "../components/team/SocialLinks";
import { useLibrary } from "../context/DocumentsContext";
import { GAMA_LABS, gamaPhotoUrl, SEO_CONFIG, TEAM } from "../lib/seoConfig";
import { useSeoHead } from "../lib/useSeoHead";

export default function GamaLabs() {
  useSeoHead();
  const { documents, status } = useLibrary();

  return (
    <div className="pb-12">
      <section className="container-page pt-6 lg:pt-10">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-line bg-card p-6 shadow-card sm:flex-row sm:items-center sm:p-8">
          <img
            src={GAMA_LABS.logo}
            alt={`Logo de ${GAMA_LABS.name}`}
            width={112}
            height={112}
            className="h-24 w-24 shrink-0 rounded-3xl bg-white object-contain p-3 ring-1 ring-black/5 sm:h-28 sm:w-28"
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow !text-accent">Créateurs de {SEO_CONFIG.siteName}</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight lg:text-4xl">{GAMA_LABS.name}</h1>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-muted">{GAMA_LABS.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {GAMA_LABS.email && (
                <a
                  href={`mailto:${GAMA_LABS.email}`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.97]"
                >
                  <Mail className="h-4 w-4" aria-hidden /> {GAMA_LABS.email}
                </a>
              )}
              <SocialLinks socials={GAMA_LABS.socials} owner={GAMA_LABS.name} />
            </div>
          </div>
        </div>
      </section>

      {GAMA_LABS.photos.length > 0 && (
        <section className="container-page mt-10" aria-labelledby="gama-photos">
          <h2 id="gama-photos" className="mb-4 text-xl font-extrabold">En images</h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {GAMA_LABS.photos.map((p, i) => (
              <li key={p}>
                <img
                  src={gamaPhotoUrl(p)}
                  alt={`${GAMA_LABS.name}, photo ${i + 1}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="container-page mt-10" aria-labelledby="gama-membres">
        <h2 id="gama-membres" className="mb-4 text-xl font-extrabold">
          Les membres de {GAMA_LABS.name}
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
          {TEAM.map((m) => (
            <li key={m.slug} className="min-w-0">
              <MemberCard member={m} />
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-10" aria-labelledby="gama-projet">
        <h2 id="gama-projet" className="mb-4 text-xl font-extrabold">Réalisation</h2>
        <Link
          to="/a-propos"
          className="group flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-6 text-white shadow-raised sm:flex-row sm:items-center sm:p-8"
        >
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white">
            <img src="/logo5.png" alt="" width={40} height={48} className="h-12 w-auto" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl font-extrabold">{SEO_CONFIG.siteName}</span>
            <span className="mt-1 block text-white/85">
              La bibliothèque numérique des étudiants de l'{SEO_CONFIG.universityName}
              {status === "ready" && documents.length > 0 ? ` : ${documents.length} documents en ligne.` : "."}
            </span>
          </span>
          <ArrowRight className="h-6 w-6 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
