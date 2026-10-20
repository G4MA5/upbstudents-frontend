import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { GAMA_LABS, memberPath, memberPhotoUrl, type TeamMemberConfig } from "../../lib/seoConfig";
import { SocialLinks } from "./SocialLinks";

export function MemberPhoto({ member, className = "" }: { member: TeamMemberConfig; className?: string }) {
  const photo = member.photos[0];
  if (!photo) {
    const initials = member.name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0])
      .join("");
    return (
      <span className={`flex items-center justify-center bg-accent-soft text-2xl font-extrabold text-accent ${className}`} aria-hidden>
        {initials}
      </span>
    );
  }
  return (
    <img
      src={memberPhotoUrl(photo)}
      alt={`Portrait de ${member.name}`}
      loading="lazy"
      decoding="async"
      className={`bg-sunken object-cover object-top ${className}`}
    />
  );
}

/**
 * `linked`: links to the member's profile page. Off on the pages visitors
 * browse (Contact, À propos): the team pages are reached from search engines
 * only, never from the site's navigation.
 */
export function MemberCard({ member, linked = true }: { member: TeamMemberConfig; linked?: boolean }) {
  const photo = <MemberPhoto member={member} className="h-full w-full transition duration-500 group-hover:scale-[1.03]" />;
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-line bg-card shadow-card transition hover:-translate-y-0.5 hover:shadow-raised">
      {linked ? (
        <Link to={memberPath(member)} className="relative block aspect-[4/5] overflow-hidden" aria-label={`Profil de ${member.name}`}>
          {photo}
        </Link>
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden">{photo}</div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-extrabold leading-snug">
          {linked ? (
            <Link to={memberPath(member)} className="hover:text-accent">
              {member.name}
            </Link>
          ) : (
            member.name
          )}
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{member.role || `Membre de ${GAMA_LABS.name}`}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <SocialLinks socials={member.socials} owner={member.name} size="sm" />
          {linked && (
            <Link
              to={memberPath(member)}
              className="inline-flex items-center gap-1 text-sm font-bold text-accent hover:underline"
            >
              Profil <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
