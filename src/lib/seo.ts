// Page metadata and Schema.org structured data.
// Pure module (no DOM): used by the app at runtime (useSeoHead) AND at build
// time to pre-render the HTML pages, so both always describe a page the same way.
import type { LibraryDocument } from "../types";
import { CATEGORIES } from "./constants";
import {
  GAMA_LABS,
  SEO_CONFIG,
  SITE_DOMAIN,
  TEAM,
  findMember,
  gamaPhotoUrl,
  getConfiguredSocialLinks,
  memberPath,
  memberPhotoUrl,
  memberSummary,
  type TeamMemberConfig,
} from "./seoConfig";

export interface SeoMeta {
  title: string;
  description: string;
  /** Canonical path ("/", "/documents"…). */
  path: string;
  noindex?: boolean;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  ogImageAlt?: string;
  /** Breadcrumb trail after "Accueil" (the last one is the page itself). */
  breadcrumb?: { name: string; path: string }[];
  /** Schema.org nodes specific to the page (site-wide nodes are added automatically). */
  nodes?: Record<string, unknown>[];
}

export type SeoDocument = Pick<
  LibraryDocument,
  "id" | "title" | "filiere" | "annee" | "niveau" | "session" | "type" | "created_at"
> & { auteur?: string | null };

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export const absoluteUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SITE_DOMAIN}${path === "/" ? "/" : path}`;

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export function categoryLabel(type: string) {
  return CATEGORIES.find((c) => c.value === type)?.singular ?? (type || "Document");
}

/** Public page of a document: /documents/123-examen-analyse-1-miage-licence-1-2025 */
export function documentPath(doc: Pick<SeoDocument, "id" | "title" | "type" | "filiere" | "niveau" | "annee">) {
  const filiere = doc.filiere.split(/,\s*/)[0] ?? "";
  const slug = slugify([categoryLabel(doc.type), doc.title, filiere, doc.niveau, doc.annee].filter(Boolean).join(" "));
  return `/documents/${doc.id}${slug ? `-${slug}` : ""}`;
}

/** "123-examen-…" → 123 */
export const documentIdFromRef = (ref = "") => Number(/^(\d+)/.exec(ref)?.[1]) || null;

const ID = {
  website: `${SITE_DOMAIN}/#website`,
  library: `${SITE_DOMAIN}/#organization`,
  gama: `${SITE_DOMAIN}/#gama-labs`,
  university: `${SITE_DOMAIN}/#upb`,
  person: (m: TeamMemberConfig) => `${absoluteUrl(memberPath(m))}#person`,
};

// ---------------------------------------------------------------------------
// Site-wide entities
// ---------------------------------------------------------------------------

const sameAs = (socials: Parameters<typeof getConfiguredSocialLinks>[0]) =>
  getConfiguredSocialLinks(socials).map(({ url }) => url);

const image = (url: string, caption: string) => ({
  "@type": "ImageObject",
  url: absoluteUrl(url),
  contentUrl: absoluteUrl(url),
  caption,
});

function personNode(m: TeamMemberConfig) {
  const links = sameAs(m.socials);
  return {
    "@type": "Person",
    "@id": ID.person(m),
    name: m.name,
    url: absoluteUrl(memberPath(m)),
    description: memberSummary(m),
    ...(m.photos.length
      ? { image: m.photos.map((p, i) => image(memberPhotoUrl(p), i === 0 ? `Portrait de ${m.name}` : `${m.name}, photo ${i + 1}`)) }
      : {}),
    ...(m.role ? { jobTitle: m.role } : {}),
    ...(m.skills?.length ? { knowsAbout: m.skills } : {}),
    memberOf: { "@id": ID.gama },
    ...(links.length ? { sameAs: links } : {}),
  };
}

function gamaNode() {
  const links = sameAs(GAMA_LABS.socials);
  return {
    "@type": "Organization",
    "@id": ID.gama,
    name: GAMA_LABS.name,
    alternateName: GAMA_LABS.alternateNames,
    url: absoluteUrl("/gama-labs"),
    description: GAMA_LABS.description,
    logo: image(GAMA_LABS.logo, `Logo de ${GAMA_LABS.name}`),
    image: [GAMA_LABS.logo, ...GAMA_LABS.photos.map(gamaPhotoUrl)].map((u) => absoluteUrl(u)),
    ...(GAMA_LABS.email ? { email: GAMA_LABS.email } : {}),
    ...(GAMA_LABS.telephone ? { telephone: GAMA_LABS.telephone } : {}),
    ...(GAMA_LABS.foundingDate ? { foundingDate: GAMA_LABS.foundingDate } : {}),
    member: TEAM.map((m) => ({ "@id": ID.person(m) })),
    ...(links.length ? { sameAs: links } : {}),
  };
}

function siteNodes() {
  const librarySameAs = sameAs(SEO_CONFIG.organizationSocials);
  return [
    {
      "@type": "WebSite",
      "@id": ID.website,
      url: absoluteUrl("/"),
      name: SEO_CONFIG.siteName,
      alternateName: SEO_CONFIG.alternateNames,
      description: SEO_CONFIG.defaultDescription,
      inLanguage: "fr",
      publisher: { "@id": ID.library },
      // Credited in the footer of every page ("Conçu et développé par Gama Labs").
      creator: { "@type": "Organization", "@id": ID.gama, name: GAMA_LABS.name },
      copyrightYear: SEO_CONFIG.launchYear,
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_DOMAIN}/documents?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": ["Library", "Organization"],
      "@id": ID.library,
      name: SEO_CONFIG.siteName,
      legalName: SEO_CONFIG.organizationName,
      alternateName: SEO_CONFIG.alternateNames,
      url: absoluteUrl("/"),
      logo: image(SEO_CONFIG.logoUrl, `Logo de ${SEO_CONFIG.siteName}`),
      image: SEO_CONFIG.defaultOgImage,
      description: SEO_CONFIG.defaultDescription,
      email: SEO_CONFIG.contact.email,
      telephone: SEO_CONFIG.contact.telephone,
      address: { "@type": "PostalAddress", ...SEO_CONFIG.location },
      areaServed: { "@type": "Country", name: "Côte d'Ivoire" },
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
      parentOrganization: { "@id": ID.university },
      ...(librarySameAs.length ? { sameAs: librarySameAs } : {}),
    },
    {
      "@type": ["CollegeOrUniversity", "EducationalOrganization"],
      "@id": ID.university,
      name: SEO_CONFIG.universityName,
      alternateName: "UPB",
      url: SEO_CONFIG.universityUrl,
      address: { "@type": "PostalAddress", addressLocality: "Bingerville", addressCountry: "CI" },
    },
  ];
}

/** Gama Labs and its members are described only on their own pages, which
 *  show that information (structured data must match the visible content). */
export const isTeamPage = (path: string) => path === "/equipe" || path.startsWith("/equipe/") || path === "/gama-labs";

/** Full JSON-LD document for a page. */
export function buildJsonLd(meta: SeoMeta) {
  const url = absoluteUrl(meta.path);
  const crumbs = [{ name: "Accueil", path: "/" }, ...(meta.breadcrumb ?? [])];
  const nodes: Record<string, unknown>[] = [
    ...siteNodes(),
    ...(isTeamPage(meta.path) ? [gamaNode(), ...TEAM.map(personNode)] : []),
  ];

  if (crumbs.length > 1) {
    nodes.push({
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: absoluteUrl(c.path),
      })),
    });
  }

  const pageNodes = meta.nodes ?? [];
  const hasPage = pageNodes.some((n) => n["@id"] === `${url}#webpage`);
  if (!hasPage) {
    nodes.push(webPage(meta, "WebPage"));
  }
  nodes.push(...pageNodes);

  return { "@context": "https://schema.org", "@graph": nodes };
}

function webPage(meta: SeoMeta, type: string | string[], extra: Record<string, unknown> = {}) {
  const url = absoluteUrl(meta.path);
  return {
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name: meta.title,
    description: meta.description,
    inLanguage: "fr",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.library },
    ...(meta.ogImage ? { primaryImageOfPage: absoluteUrl(meta.ogImage) } : {}),
    ...((meta.breadcrumb?.length ?? 0) > 0 ? { breadcrumb: { "@id": `${url}#breadcrumb` } } : {}),
    ...extra,
  };
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

const SUFFIX = ` · ${SEO_CONFIG.siteName}`;
const PRIVATE = { noindex: true };

/** About the creators: only on the (unlinked) team pages and in llms-full.txt. */
export const CREATORS_FAQ = {
  q: `Qui a créé ${SEO_CONFIG.siteName} ?`,
  a: `${SEO_CONFIG.siteName} a été conçue et développée par ${GAMA_LABS.name}, dont l'équipe est composée de ${TEAM.map((m) => m.name).join(", ").replace(/, ([^,]*)$/, " et $1")}.`,
};

/** Questions shown on the "À propos" page. */
export const FAQ = [
  {
    q: `Qu'est-ce que ${SEO_CONFIG.siteName} ?`,
    a: `${SEO_CONFIG.siteName} est la bibliothèque numérique des étudiants de l'${SEO_CONFIG.universityName} (UPB), à Bingerville en Côte d'Ivoire. Elle rassemble des épreuves d'examens, des cours, des sujets de TD et de TP, des mémoires et des livres, classés par filière, par niveau et par année.`,
  },
  {
    q: "Quels documents trouve-t-on dans la bibliothèque ?",
    a: "Des épreuves d'examens (sessions 1 et 2), des cours, des sujets de travaux dirigés (TD) et de travaux pratiques (TP), des mémoires et des livres, pour les filières MIAGE, ASSRI, SEA, SEG, 3EA, SJAP et RIT, de la Licence 1 au Master.",
  },
  {
    q: "La bibliothèque est-elle gratuite ?",
    a: "Oui. Le catalogue est consultable par tous, et la lecture en ligne comme le téléchargement des documents sont gratuits : il suffit de créer un compte étudiant gratuit.",
  },
  {
    q: "Comment proposer un document ?",
    a: "Depuis la page « Proposer un document », n'importe quel étudiant peut envoyer une épreuve, un cours, un TD ou un TP. Chaque proposition est vérifiée par l'équipe avant d'être publiée.",
  },
  {
    q: "Comment contacter l'équipe ?",
    a: `Par le formulaire de la page Contact, ou par e-mail à ${SEO_CONFIG.contact.email}.`,
  },
];

const STATIC: Record<string, SeoMeta> = {
  "/": {
    title: `${SEO_CONFIG.siteName} · Bibliothèque numérique de l'UPB (examens, cours, TD, TP)`,
    description:
      "Examens, cours, TD, TP, mémoires et livres de l'Université Polytechnique de Bingerville, classés par filière et par niveau. Accès gratuit.",
    path: "/",
  },
  "/documents": {
    title: `Tous les documents : examens, cours, TD, TP${SUFFIX}`,
    description:
      "Le catalogue complet de la bibliothèque de l'UPB : épreuves d'examens, cours, TD, TP, mémoires et livres, par filière (MIAGE, ASSRI, SEA, SEG, 3EA, SJAP, RIT) et par niveau.",
    path: "/documents",
    breadcrumb: [{ name: "Documents", path: "/documents" }],
  },
  "/a-propos": {
    title: `À propos de ${SEO_CONFIG.siteName}, la bibliothèque numérique de l'UPB`,
    description: `Ce qu'est ${SEO_CONFIG.siteName}, ce que contient la bibliothèque, qui l'a créée (${GAMA_LABS.name}) et comment y contribuer.`,
    path: "/a-propos",
    breadcrumb: [{ name: "À propos", path: "/a-propos" }],
  },
  "/equipe": {
    title: `L'équipe de ${GAMA_LABS.name} derrière ${SEO_CONFIG.siteName}`,
    description: `Les membres de ${GAMA_LABS.name} qui ont conçu et développé ${SEO_CONFIG.siteName} : ${TEAM.map((m) => m.name).join(", ")}.`,
    path: "/equipe",
    ogImage: "/og/gama-labs.png",
    breadcrumb: [{ name: "L'équipe", path: "/equipe" }],
  },
  "/gama-labs": {
    title: `${GAMA_LABS.name} · Créateurs de ${SEO_CONFIG.siteName}`,
    description: `${GAMA_LABS.description} Découvrez ses membres et ses réseaux.`,
    path: "/gama-labs",
    ogImage: "/og/gama-labs.png",
    ogImageAlt: `Logo de ${GAMA_LABS.name}`,
    breadcrumb: [{ name: GAMA_LABS.name, path: "/gama-labs" }],
  },
  "/contact": {
    title: `Contact${SUFFIX}`,
    description:
      "Une question, un problème ou un document introuvable ? Contactez l'équipe de la bibliothèque numérique de l'Université Polytechnique de Bingerville.",
    path: "/contact",
    breadcrumb: [{ name: "Contact", path: "/contact" }],
  },
  "/proposer": {
    title: `Proposer un document${SUFFIX}`,
    description:
      "Enrichissez la bibliothèque de l'UPB : proposez une épreuve d'examen, un cours, un TD ou un TP. Chaque proposition est vérifiée avant publication.",
    path: "/proposer",
    breadcrumb: [{ name: "Proposer un document", path: "/proposer" }],
  },
  // Personal or administrative pages: never indexed.
  "/bibliotheque": { title: `Ma bibliothèque${SUFFIX}`, description: "Vos favoris, vos lectures récentes et vos collections.", path: "/bibliotheque", ...PRIVATE },
  "/profil": { title: `Mon compte${SUFFIX}`, description: "Votre compte et vos préférences.", path: "/profil", ...PRIVATE },
  "/ajouter": { title: `Publier un document${SUFFIX}`, description: "Publication de documents.", path: "/ajouter", ...PRIVATE },
  "/propositions": { title: `Propositions reçues${SUFFIX}`, description: "Modération des propositions.", path: "/propositions", ...PRIVATE },
  "/diffusion": { title: `Diffusion${SUFFIX}`, description: "Diffusion des nouveautés.", path: "/diffusion", ...PRIVATE },
  "/mot-de-passe-oublie": { title: `Nouveau mot de passe${SUFFIX}`, description: "Choisissez un nouveau mot de passe.", path: "/mot-de-passe-oublie", ...PRIVATE },
  "/404": { title: `Page introuvable${SUFFIX}`, description: "Cette page n'existe pas.", path: "/404", ...PRIVATE },
};

/** Public pages listed in the sitemap (order = importance). */
export const PUBLIC_PAGES = ["/", "/documents", "/a-propos", "/equipe", "/gama-labs", "/contact", "/proposer"];

function withNodes(meta: SeoMeta, documents: SeoDocument[] = []): SeoMeta {
  switch (meta.path) {
    case "/documents":
      return {
        ...meta,
        nodes: [
          webPage(meta, "CollectionPage", {
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: documents.length,
              itemListElement: documents.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(documentPath(d)),
                name: d.title,
              })),
            },
          }),
        ],
      };
    case "/a-propos":
      return {
        ...meta,
        nodes: [
          webPage(meta, ["AboutPage", "FAQPage"], {
            mainEntity: FAQ.map(({ q, a }) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        ],
      };
    case "/equipe":
      return {
        ...meta,
        nodes: [
          webPage(meta, "AboutPage", {
            mainEntity: {
              "@type": "ItemList",
              itemListElement: TEAM.map((m, i) => ({ "@type": "ListItem", position: i + 1, item: { "@id": ID.person(m) } })),
            },
          }),
        ],
      };
    case "/gama-labs":
      return { ...meta, nodes: [webPage(meta, "ProfilePage", { mainEntity: { "@id": ID.gama }, about: { "@id": ID.gama } })] };
    case "/contact":
      return { ...meta, nodes: [webPage(meta, "ContactPage")] };
    default:
      return meta;
  }
}

export function staticPageMeta(path: string, documents?: SeoDocument[]): SeoMeta | null {
  const normalized = path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  const meta = STATIC[normalized];
  return meta ? withNodes(meta, documents) : null;
}

export function memberMeta(m: TeamMemberConfig): SeoMeta {
  const path = memberPath(m);
  const meta: SeoMeta = {
    title: `${m.name}${m.role ? `, ${m.role}` : ""} · ${GAMA_LABS.name}`,
    description: memberSummary(m).slice(0, 300),
    path,
    ogType: "profile",
    ogImage: m.photos[0] ? memberPhotoUrl(m.photos[0]) : "/og/gama-labs.png",
    ogImageAlt: `Portrait de ${m.name}`,
    breadcrumb: [
      { name: "L'équipe", path: "/equipe" },
      { name: m.name, path },
    ],
  };
  return { ...meta, nodes: [webPage(meta, "ProfilePage", { mainEntity: { "@id": ID.person(m) }, about: { "@id": ID.person(m) } })] };
}

export function memberMetaBySlug(slug: string) {
  const m = findMember(slug);
  return m ? memberMeta(m) : null;
}

/** "Examen · MIAGE · Licence 1 · 2025 · Session 1" */
export function documentFacts(doc: SeoDocument) {
  return [categoryLabel(doc.type), doc.filiere, doc.niveau, doc.annee, doc.session].filter(Boolean);
}

export function documentDescription(doc: SeoDocument) {
  const details = [doc.filiere && `${doc.filiere.includes(",") ? "filières" : "filière"} ${doc.filiere}`, doc.niveau, doc.annee, doc.session].filter(Boolean).join(", ");
  return `${categoryLabel(doc.type)} « ${doc.title} »${details ? ` (${details})` : ""}${doc.auteur ? `, par ${doc.auteur}` : ""}. Disponible gratuitement sur ${SEO_CONFIG.siteName}, la bibliothèque numérique des étudiants de l'${SEO_CONFIG.universityName}.`;
}

export function documentMeta(doc: SeoDocument): SeoMeta {
  const path = documentPath(doc);
  const url = absoluteUrl(path);
  const facts = [doc.filiere, doc.niveau, doc.annee].filter(Boolean).join(" ");
  const meta: SeoMeta = {
    title: `${doc.title} · ${categoryLabel(doc.type)}${facts ? ` ${facts}` : ""} | ${SEO_CONFIG.siteName}`,
    description: documentDescription(doc),
    path,
    ogType: "article",
    breadcrumb: [
      { name: "Documents", path: "/documents" },
      { name: doc.title, path },
    ],
  };
  const filieres = doc.filiere.split(/,\s*/).filter(Boolean);
  return {
    ...meta,
    nodes: [
      webPage(meta, "ItemPage", { mainEntity: { "@id": `${url}#document` } }),
      {
        "@type": "LearningResource",
        "@id": `${url}#document`,
        name: doc.title,
        description: meta.description,
        url,
        learningResourceType: categoryLabel(doc.type),
        ...(doc.niveau ? { educationalLevel: doc.niveau } : {}),
        ...(doc.annee ? { temporalCoverage: doc.annee } : {}),
        ...(doc.created_at ? { datePublished: doc.created_at } : {}),
        ...(filieres.length ? { about: filieres.map((name) => ({ "@type": "Thing", name })) } : {}),
        keywords: [categoryLabel(doc.type), ...filieres, doc.niveau, doc.annee, doc.session, "UPB", SEO_CONFIG.universityName]
          .filter(Boolean)
          .join(", "),
        ...(doc.auteur ? { author: { "@type": "Person", name: doc.auteur } } : {}),
        inLanguage: "fr",
        isAccessibleForFree: true,
        audience: { "@type": "EducationalAudience", educationalRole: "student" },
        publisher: { "@id": ID.library },
        provider: { "@id": ID.library },
        isPartOf: { "@id": ID.website },
      },
    ],
  };
}

export const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

/** Tags written in <head>: same list at runtime and in the pre-rendered HTML. */
export function headTags(meta: SeoMeta) {
  const url = absoluteUrl(meta.path);
  const ogImage = absoluteUrl(meta.ogImage || SEO_CONFIG.defaultOgImage);
  const ogImageAlt = meta.ogImageAlt || `${SEO_CONFIG.siteName}, bibliothèque numérique de l'UPB`;
  return {
    title: meta.title,
    metas: [
      ["name", "description", meta.description],
      ["name", "robots", meta.noindex ? "noindex, nofollow" : ROBOTS_INDEX],
      ["property", "og:type", meta.ogType || "website"],
      ["property", "og:site_name", SEO_CONFIG.siteName],
      ["property", "og:locale", "fr_FR"],
      ["property", "og:url", url],
      ["property", "og:title", meta.title],
      ["property", "og:description", meta.description],
      ["property", "og:image", ogImage],
      ["property", "og:image:alt", ogImageAlt],
      ["name", "twitter:card", "summary_large_image"],
      ["name", "twitter:title", meta.title],
      ["name", "twitter:description", meta.description],
      ["name", "twitter:image", ogImage],
      ["name", "twitter:image:alt", ogImageAlt],
    ] as [attr: "name" | "property", key: string, content: string][],
    canonical: url,
    jsonLd: meta.noindex ? null : buildJsonLd(meta),
  };
}
