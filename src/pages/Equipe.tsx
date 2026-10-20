import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { MemberCard } from "../components/team/MemberCard";
import { SocialLinks } from "../components/team/SocialLinks";
import { GAMA_LABS, SEO_CONFIG, TEAM } from "../lib/seoConfig";
import { useSeoHead } from "../lib/useSeoHead";

export default function Equipe() {
  useSeoHead();

  return (
    <div className="pb-12">
      <div className="page-head">
        <p className="eyebrow !text-accent">L'équipe</p>
        <h1 className="mt-2 text-2xl font-extrabold lg:text-3xl">Les créateurs de {SEO_CONFIG.siteName}</h1>
        <p className="mt-2 max-w-2xl text-ink-muted">
          {SEO_CONFIG.siteName} a été conçue et développée par les {TEAM.length} membres de{" "}
          <Link to="/gama-labs" className="font-semibold text-accent hover:underline">
            {GAMA_LABS.name}
          </Link>
          .
        </p>
      </div>

      <ul className="container-page mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {TEAM.map((member) => (
          <li key={member.slug} className="min-w-0">
            <MemberCard member={member} />
          </li>
        ))}
      </ul>

      <section className="container-page mt-12" aria-labelledby="gama-titre">
        <div className="flex flex-col gap-5 rounded-3xl border border-line bg-card p-5 shadow-card sm:flex-row sm:items-center sm:p-7">
          <img
            src={GAMA_LABS.logo}
            alt={`Logo de ${GAMA_LABS.name}`}
            width={72}
            height={72}
            loading="lazy"
            className="h-[72px] w-[72px] shrink-0 rounded-2xl bg-white object-contain p-2.5 ring-1 ring-black/5"
          />
          <div className="min-w-0 flex-1">
            <h2 id="gama-titre" className="text-lg font-extrabold">
              {GAMA_LABS.name}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">{GAMA_LABS.description}</p>
            <SocialLinks socials={GAMA_LABS.socials} owner={GAMA_LABS.name} size="sm" className="mt-3" />
          </div>
          <Link
            to="/gama-labs"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-700 px-5 text-[15px] font-semibold text-white transition hover:bg-brand-800 active:scale-[0.97]"
          >
            Découvrir {GAMA_LABS.name} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}
