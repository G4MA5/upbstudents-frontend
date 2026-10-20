import type { IconType } from "react-icons";
import {
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { getConfiguredSocialLinks, type SocialLinksConfig, type SocialPlatform } from "../../lib/seoConfig";

const ICONS: Record<SocialPlatform, IconType> = {
  linkedIn: FaLinkedin,
  github: FaGithub,
  facebook: FaFacebook,
  instagram: FaInstagram,
  x: FaXTwitter,
  twitter: FaTwitter,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  threads: FaThreads,
  whatsapp: FaWhatsapp,
  telegram: FaTelegram,
  website: FaGlobe,
};

/** Official profiles, as labelled pill links (rel="me" ties them to the person). */
export function SocialLinks({
  socials,
  owner,
  size = "md",
  className = "",
}: {
  socials: SocialLinksConfig;
  owner: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const links = getConfiguredSocialLinks(socials);
  if (links.length === 0) return null;
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {links.map(({ platform, label, url }) => {
        const Icon = ICONS[platform];
        return (
          <li key={platform}>
            <a
              href={url}
              target="_blank"
              rel="me noopener noreferrer"
              aria-label={`${label} de ${owner} (nouvel onglet)`}
              className={`inline-flex items-center gap-2 rounded-full border border-line bg-card font-semibold text-ink-soft transition hover:border-brand-500/40 hover:text-accent active:scale-[0.97] ${
                size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm"
              }`}
            >
              <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
