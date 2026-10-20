/**
 * Données publiques du site (référencement, pages Équipe et Gama Labs,
 * sitemaps, llms.txt). C'est le SEUL fichier à modifier pour compléter les
 * informations : rôle, biographie, réseaux sociaux, photos.
 *
 * Règle : n'indiquez que des informations exactes et publiques. Un champ vide
 * (ou absent) n'est simplement pas affiché ni envoyé aux moteurs de recherche.
 *
 * Domaine officiel : https://upbstudents-labibliotheque.com
 */

export const SITE_DOMAIN = "https://upbstudents-labibliotheque.com";

export const SOCIAL_PLATFORM_LABELS = {
  linkedIn: "LinkedIn",
  github: "GitHub",
  facebook: "Facebook",
  instagram: "Instagram",
  x: "X",
  twitter: "Twitter",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  website: "Site web",
} as const;

export type SocialPlatform = keyof typeof SOCIAL_PLATFORM_LABELS;
export type SocialLinksConfig = Partial<Record<SocialPlatform, string>>;

export interface TeamMemberConfig {
  /** Adresse de la page : /equipe/<slug>. Ne plus la changer une fois indexée. */
  slug: string;
  name: string;
  /** Ex. « Développeur front-end », « Designer UI/UX ». */
  role?: string;
  /** Présentation en 2 à 4 phrases, à la 3ᵉ personne. */
  bio?: string;
  /** Domaines de compétence (ex. ["React", "Supabase", "UI design"]). */
  skills?: string[];
  /** Fichiers dans public/images/team/ (la première est la photo principale). */
  photos: string[];
  socials: SocialLinksConfig;
}

export interface OrganizationConfig {
  name: string;
  alternateNames: string[];
  description: string;
  email?: string;
  telephone?: string;
  /** Fichiers dans public/images/gama-labs/ (logo, photos d'équipe…). */
  photos: string[];
  logo: string;
  foundingDate?: string;
  socials: SocialLinksConfig;
}

export function getConfiguredSocialLinks(socials: SocialLinksConfig) {
  return (Object.keys(SOCIAL_PLATFORM_LABELS) as SocialPlatform[]).flatMap((platform) => {
    const url = socials[platform]?.trim();
    return url ? [{ platform, label: SOCIAL_PLATFORM_LABELS[platform], url }] : [];
  });
}

export const SEO_CONFIG = {
  domain: SITE_DOMAIN,
  siteName: "UpB Student's",
  alternateNames: ["UpB Students", "UpB Student's Bibliothèque", "Bibliothèque numérique UPB"],
  fullSiteTitle: "UpB Student's · Bibliothèque numérique",
  defaultDescription:
    "Bibliothèque numérique des étudiants de l'Université Polytechnique de Bingerville (UPB) : examens, cours, TD, TP, mémoires et livres par filière et par niveau, en accès gratuit.",
  defaultOgImage: `${SITE_DOMAIN}/og/upb-students.png`,
  logoUrl: `${SITE_DOMAIN}/logo-upb-students.png`,
  organizationName: "UpB Student's - Bibliothèque numérique",
  universityName: "Université Polytechnique de Bingerville",
  universityUrl: "https://upb.edu.ci",
  launchYear: "2025",
  contact: {
    email: "Gamalabs2.0@gmail.com",
    telephone: "+2250172489331",
  },
  location: {
    addressLocality: "Bingerville",
    addressRegion: "Abidjan",
    addressCountry: "CI",
    streetAddress: "Route de Bingerville, Université Polytechnique de Bingerville",
  },

  // Réseaux sociaux officiels de la bibliothèque UpB Student's (pas ceux de
  // Gama Labs ni des membres). Exemple : instagram: "https://www.instagram.com/…"
  organizationSocials: {} as SocialLinksConfig,

  // ---------------------------------------------------------------------------
  // Gama Labs : l'équipe qui a conçu et développé la bibliothèque.
  // ---------------------------------------------------------------------------
  gamaLabs: {
    name: "Gama Labs",
    alternateNames: ["GamaLabs", "Gamalabs"],
    description:
      "Gama Labs est l'équipe qui a conçu et développé UpB Student's, la bibliothèque numérique des étudiants de l'Université Polytechnique de Bingerville (Côte d'Ivoire).",
    email: "Gamalabs2.0@gmail.com",
    logo: "/logo_gama.png",
    // Ajoutez ici des photos de l'équipe (fichiers dans public/images/gama-labs/).
    photos: [],
    foundingDate: undefined,
    socials: {
      linkedIn: "https://www.linkedin.com/in/gama-labs-523139375",
      // github: "https://github.com/…",
      // instagram: "https://www.instagram.com/…",
      // facebook: "https://www.facebook.com/…",
      // x: "https://x.com/…",
      // tiktok: "https://www.tiktok.com/@…",
      // youtube: "https://www.youtube.com/@…",
      // website: "https://…",
    },
  } as OrganizationConfig,

  // ---------------------------------------------------------------------------
  // Membres de Gama Labs, qui ont développé la bibliothèque.
  // Pour chaque membre : role, bio, skills, réseaux sociaux et photos
  // supplémentaires (public/images/team/) peuvent être complétés ici.
  // ---------------------------------------------------------------------------
  teamMembers: [
    {
      slug: "dakaud-uriel-jean-bedel",
      name: "Dakaud Uriel Jean Bedel",
      photos: ["dakaud-uriel-jean-bedel.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/dakaud-uriel-jean-bedel-194788375",
      },
    },
    {
      slug: "olivier-grace-divine-graourou",
      name: "Olivier Grace Divine Graourou",
      photos: ["olivier-grace-divine-graourou.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/olivier-grace-divine-graourou-b09490312",
      },
    },
    {
      slug: "desailly-caleb-deroux",
      name: "Desailly Caleb Deroux",
      photos: ["desailly-caleb-deroux.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/desailly-caleb-deroux-398132375",
      },
    },
    {
      slug: "yao-eliakim-assale",
      name: "Yao Eliakim Assale",
      photos: ["yao-eliakim-assale.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/yao-eliakim-assale-69224839a",
      },
    },
    {
      slug: "serge-armel-benie-ahoussi",
      name: "Serge Armel Bénie Ahoussi",
      photos: ["serge-armel-benie-ahoussi.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/serge-armel-b%C3%A9nie-ahoussi-604479332",
      },
    },
    {
      slug: "baidoo-martin",
      name: "Baidoo Martin",
      photos: ["baidoo-martin.jpeg"],
      socials: {
        linkedIn: "https://www.linkedin.com/in/baidoo-martin-02823b359",
      },
    },
  ] as TeamMemberConfig[],
};

export const TEAM = SEO_CONFIG.teamMembers;
export const GAMA_LABS = SEO_CONFIG.gamaLabs;

export const memberPath = (m: Pick<TeamMemberConfig, "slug">) => `/equipe/${m.slug}`;
export const memberPhotoUrl = (file: string) => `/images/team/${file}`;
export const gamaPhotoUrl = (file: string) => `/images/gama-labs/${file}`;
export const findMember = (slug: string) => TEAM.find((m) => m.slug === slug) ?? null;

/** Présentation affichée quand la biographie n'est pas encore renseignée. */
export function memberSummary(m: TeamMemberConfig) {
  return (
    m.bio ||
    `${m.name} est membre de ${GAMA_LABS.name}${m.role ? ` (${m.role})` : ""} et fait partie de l'équipe qui a conçu et développé ${SEO_CONFIG.siteName}, la bibliothèque numérique des étudiants de l'${SEO_CONFIG.universityName}.`
  );
}
