import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { MemberCard, MemberPhoto } from "../components/team/MemberCard";
import { SocialLinks } from "../components/team/SocialLinks";
import { memberMeta } from "../lib/seo";
import { findMember, GAMA_LABS, memberPhotoUrl, memberSummary, SEO_CONFIG, TEAM } from "../lib/seoConfig";
import { useSeoHead } from "../lib/useSeoHead";
import NotFound from "./NotFound";

export default function Membre() {
  const { slug = "" } = useParams();
  const member = findMember(slug);
  if (!member) return <NotFound />;
  return <MemberProfile key={member.slug} slug={member.slug} />;
}

function MemberProfile({ slug }: { slug: string }) {
  const member = findMember(slug)!;
  useSeoHead(memberMeta(member));
  const others = TEAM.filter((m) => m.slug !== member.slug);
  const gallery = member.photos.slice(1);

  return (
    <div className="pb-12">
      <div className="container-page pt-5 lg:pt-8">
        <nav aria-label="Fil d'Ariane" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-accent">Accueil</Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/equipe" className="hover:text-accent">L'équipe</Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="font-semibold text-ink">{member.name}</li>
          </ol>
        </nav>

        <article className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr] lg:gap-10">
          <div className="self-start overflow-hidden rounded-3xl border border-line bg-card shadow-card">
            <MemberPhoto member={member} className="aspect-[4/5] w-full" />
          </div>

          <div className="min-w-0">
            <Link
              to="/gama-labs"
              className="inline-flex items-center gap-2 rounded-full bg-accent-soft py-1 pl-1 pr-3 text-xs font-bold text-accent hover:bg-brand-500/15"
            >
              <img src={GAMA_LABS.logo} alt="" width={22} height={22} className="h-[22px] w-[22px] rounded-full bg-white object-contain p-0.5" />
              Membre de {GAMA_LABS.name}
            </Link>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight lg:text-4xl">{member.name}</h1>
            {member.role && <p className="mt-1 text-lg font-semibold text-ink-soft">{member.role}</p>}
            <p className="mt-4 max-w-2xl leading-relaxed text-ink-muted">{memberSummary(member)}</p>

            <SocialLinks socials={member.socials} owner={member.name} className="mt-5" />

            {member.skills && member.skills.length > 0 && (
              <section className="mt-7" aria-labelledby="competences">
                <h2 id="competences" className="text-sm font-bold uppercase tracking-wide text-ink-muted">Compétences</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {member.skills.map((s) => (
                    <li key={s} className="rounded-full bg-sunken px-3 py-1 text-sm font-semibold text-ink-soft">{s}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mt-7 rounded-2xl border border-line bg-card p-4 shadow-card" aria-labelledby="realisation">
              <h2 id="realisation" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden /> Réalisation
              </h2>
              <p className="mt-2 text-ink-soft">
                A participé à la conception et au développement de{" "}
                <Link to="/a-propos" className="font-semibold text-accent hover:underline">{SEO_CONFIG.siteName}</Link>, la
                bibliothèque numérique des étudiants de l'{SEO_CONFIG.universityName}, avec l'équipe de {GAMA_LABS.name}.
              </p>
            </section>

            {gallery.length > 0 && (
              <section className="mt-7" aria-labelledby="photos">
                <h2 id="photos" className="text-sm font-bold uppercase tracking-wide text-ink-muted">Photos</h2>
                <ul className="mt-2 grid grid-cols-3 gap-2">
                  {gallery.map((p, i) => (
                    <li key={p}>
                      <img
                        src={memberPhotoUrl(p)}
                        alt={`${member.name}, photo ${i + 2}`}
                        loading="lazy"
                        className="aspect-square w-full rounded-xl object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>
      </div>

      <section className="container-page mt-14" aria-labelledby="autres">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 id="autres" className="text-xl font-extrabold">Les autres membres de {GAMA_LABS.name}</h2>
          <Link to="/equipe" className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Toute l'équipe
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {others.map((m) => (
            <li key={m.slug} className="min-w-0">
              <MemberCard member={m} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
