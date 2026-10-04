/**
 * Configuration SEO centralisée pour la bibliothèque numérique UpB Student's.
 * Domaine officiel : https://upbstudents-labibliotheque.com
 */

export const SITE_DOMAIN = "https://upbstudents-labibliotheque.com";

export interface TeamMemberConfig {
  name: string;
  linkedIn: string;
  role?: string;
  imageFileName?: string;
  hasLocalImage: boolean;
}

export interface SocialLinksConfig {
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  twitter?: string;
  youtube?: string;
}

export const SEO_CONFIG = {
  domain: SITE_DOMAIN,
  siteName: "UpB Student's",
  fullSiteTitle: "UpB Student's · Bibliothèque numérique",
  defaultDescription:
    "Bibliothèque numérique des étudiants de l'Université Polytechnique de Bingerville (UPB) : examens, sujet de TD, TP et livres par filière et niveau.",
  defaultOgImage: `${SITE_DOMAIN}/logo5.png`,
  logoUrl: `${SITE_DOMAIN}/logo5.png`,
  organizationName: "UpB Student's - Bibliothèque numérique",
  universityName: "Université Polytechnique de Bingerville",
  location: {
    addressLocality: "Bingerville",
    addressRegion: "Abidjan",
    addressCountry: "CI",
    streetAddress: "Route de Bingerville, Université Polytechnique de Bingerville",
  },
  
  // Réseaux sociaux officiels de l'organisation (doivent appartenir uniquement à l'organisation)
  organizationSocials: {
    linkedIn: undefined, // "LINKEDIN_OFFICIEL_ORGANISATION" si créé ultérieurement
    facebook: undefined,
    instagram: undefined,
  } as SocialLinksConfig,

  // Membres de l'équipe et profils LinkedIn associés
  teamMembers: [
    {
      name: "Dakaud Uriel Jean Bedel",
      linkedIn: "https://www.linkedin.com/in/dakaud-uriel-jean-bedel-194788375",
      imageFileName: "dakaud-uriel-jean-bedel.jpg",
      hasLocalImage: false, // Passer à true après ajout du fichier dans public/images/team/
    },
    {
      name: "Olivier Grace Divine Graourou",
      linkedIn: "https://www.linkedin.com/in/olivier-grace-divine-graourou-b09490312",
      imageFileName: "olivier-grace-divine-graourou.jpg",
      hasLocalImage: false,
    },
    {
      name: "Desailly Caleb Deroux",
      linkedIn: "https://www.linkedin.com/in/desailly-caleb-deroux-398132375",
      imageFileName: "desailly-caleb-deroux.jpg",
      hasLocalImage: false,
    },
    {
      name: "Yao Eliakim Assale",
      linkedIn: "https://www.linkedin.com/in/yao-eliakim-assale-69224839a",
      imageFileName: "yao-eliakim-assale.jpg",
      hasLocalImage: false,
    },
    {
      name: "Serge Armel Bénie Ahoussi",
      linkedIn: "https://www.linkedin.com/in/serge-armel-bénie-ahoussi-604479332",
      imageFileName: "serge-armel-benie-ahoussi.jpg",
      hasLocalImage: false,
    },
    {
      name: "Baidoo Martin",
      linkedIn: "https://www.linkedin.com/in/baidoo-martin-02823b359",
      imageFileName: "baidoo-martin.jpg",
      hasLocalImage: false,
    },
  ] as TeamMemberConfig[],

  // Entité Gama Labs (Développeur / Organisation créatrice)
  // Note : Type de Gama Labs à confirmer (Personne vs Organisation vs Marque).
  gamaLabs: {
    name: "Gama Labs",
    linkedIn: "https://www.linkedin.com/in/gama-labs-523139375",
    logoUrl: `${SITE_DOMAIN}/logo_gama.png`,
    note: "Type de Gama Labs à confirmer.",
  },
};

export interface PageSeoConfig {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogType?: "website" | "article";
  ogImage?: string;
}

export const PAGES_SEO: Record<string, PageSeoConfig> = {
  home: {
    title: "UpB Student's · Bibliothèque numérique de l'UPB",
    description:
      "Accédez aux ressources pédagogiques de l'Université Polytechnique de Bingerville : épreuves d'examens, sujets de TD, TP et ouvrages par filière.",
    path: "/",
  },
  documents: {
    title: "Documents & Épreuves · UpB Student's",
    description:
      "Consultez et recherchez parmi le catalogue complet d'examens, TD, TP et livres pour toutes les filières de l'UPB.",
    path: "/documents",
  },
  bibliotheque: {
    title: "Mes Livres & Collection · UpB Student's",
    description:
      "Votre espace de consultation personnalisée : enregistrez vos favoris et retrouvez l'historique de vos lectures.",
    path: "/bibliotheque",
  },
  proposer: {
    title: "Proposer un document · UpB Student's",
    description:
      "Contribuez à la bibliothèque de l'UPB en proposant des sujets d'examens, des TD ou des corrigés.",
    path: "/proposer",
  },
  contact: {
    title: "Contact & Équipe · UpB Student's",
    description:
      "Contactez l'équipe d'administration de la bibliothèque numérique de l'Université Polytechnique de Bingerville.",
    path: "/contact",
  },
  ajouter: {
    title: "Publier un document · Zone Contributeurs",
    description: "Espace de publication directe pour les contributeurs autorisés.",
    path: "/ajouter",
    noindex: true,
  },
  profil: {
    title: "Mon Profil · UpB Student's",
    description: "Gestion du compte et des préférences de l'étudiant.",
    path: "/profil",
    noindex: true,
  },
  propositions: {
    title: "Propositions reçues · Modération",
    description: "Espace de modération et de validation des documents soumis.",
    path: "/propositions",
    noindex: true,
  },
  resetPassword: {
    title: "Réinitialisation du mot de passe · UpB Student's",
    description: "Formulaire de modification du mot de passe de compte.",
    path: "/mot-de-passe-oublie",
    noindex: true,
  },
  notFound: {
    title: "Page introuvable (404) · UpB Student's",
    description: "La page demandée n'existe pas sur la bibliothèque numérique.",
    path: "/404",
    noindex: true,
  },
};

/**
 * Générateur de données structurées JSON-LD conforme Schema.org
 */
export function generateJsonLd(path: string) {
  const canonicalUrl = `${SITE_DOMAIN}${path === "/" ? "" : path}`;

  const organizationSameAs = Object.values(SEO_CONFIG.organizationSocials).filter(
    (url): url is string => Boolean(url)
  );

  const organizationSchema = {
    "@type": "Library",
    "@id": `${SITE_DOMAIN}/#organization`,
    name: SEO_CONFIG.organizationName,
    url: SITE_DOMAIN,
    logo: SEO_CONFIG.logoUrl,
    image: SEO_CONFIG.defaultOgImage,
    description: SEO_CONFIG.defaultDescription,
    ...(organizationSameAs.length > 0 ? { sameAs: organizationSameAs } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: SEO_CONFIG.location.streetAddress,
      addressLocality: SEO_CONFIG.location.addressLocality,
      addressRegion: SEO_CONFIG.location.addressRegion,
      addressCountry: SEO_CONFIG.location.addressCountry,
    },
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: SEO_CONFIG.universityName,
      url: "https://upb.edu.ci",
    },
    founder: {
      "@type": "Organization",
      "@id": `${SITE_DOMAIN}/#gama-labs`,
      name: SEO_CONFIG.gamaLabs.name,
      url: SEO_CONFIG.gamaLabs.linkedIn,
      logo: SEO_CONFIG.gamaLabs.logoUrl,
      sameAs: [SEO_CONFIG.gamaLabs.linkedIn],
    },
  };

  const teamPeopleSchemas = SEO_CONFIG.teamMembers.map((member, index) => ({
    "@type": "Person",
    "@id": `${SITE_DOMAIN}/#person-${index + 1}`,
    name: member.name,
    ...(member.hasLocalImage && member.imageFileName
      ? { image: `${SITE_DOMAIN}/images/team/${member.imageFileName}` }
      : {}),
    ...(member.role ? { jobTitle: member.role } : {}),
    sameAs: [member.linkedIn],
    worksFor: {
      "@id": `${SITE_DOMAIN}/#organization`,
    },
  }));

  const websiteSchema = {
    "@type": "WebSite",
    "@id": `${SITE_DOMAIN}/#website`,
    url: SITE_DOMAIN,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    publisher: {
      "@id": `${SITE_DOMAIN}/#organization`,
    },
    inLanguage: "fr-CI",
  };

  const webpageSchema = {
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: PAGES_SEO[path]?.title || SEO_CONFIG.fullSiteTitle,
    description: PAGES_SEO[path]?.description || SEO_CONFIG.defaultDescription,
    isPartOf: {
      "@id": `${SITE_DOMAIN}/#website`,
    },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      websiteSchema,
      organizationSchema,
      webpageSchema,
      ...teamPeopleSchemas,
    ],
  };
}
