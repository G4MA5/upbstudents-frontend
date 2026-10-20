// Build step (Vite plugin): turns the single-page app into real HTML pages
// for search engines and AI crawlers (most AI crawlers do not run JavaScript).
//
// After `vite build` it writes into dist/:
//   - one HTML file per public page, document and team member, with its own
//     <title>, description, canonical URL, Open Graph tags, Schema.org data and
//     a readable version of the content (replaced by the app as soon as it loads);
//   - sitemap.xml (index) + sitemap-pages.xml, sitemap-equipe.xml, sitemap-documents.xml;
//   - robots.txt, llms.txt, llms-full.txt, humans.txt;
//   - app.html (shell for private pages) and 404.html.
//
// The documents come from the public API. If it cannot be reached, the build
// still succeeds (the document pages are then rendered by the app only).
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { CATEGORIES, FILIERES } from "../src/lib/constants";
import {
  absoluteUrl,
  categoryLabel,
  documentDescription,
  documentFacts,
  documentMeta,
  documentPath,
  CREATORS_FAQ,
  FAQ,
  headTags,
  memberMeta,
  PUBLIC_PAGES,
  staticPageMeta,
  type SeoDocument,
  type SeoMeta,
} from "../src/lib/seo";
import {
  GAMA_LABS,
  gamaPhotoUrl,
  getConfiguredSocialLinks,
  memberPath,
  memberPhotoUrl,
  memberSummary,
  SEO_CONFIG,
  SITE_DOMAIN,
  TEAM,
  type SocialLinksConfig,
} from "../src/lib/seoConfig";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const day = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : undefined);
const today = new Date().toISOString().slice(0, 10);
const link = (href: string, text: string, rel = "") => `<a href="${esc(href)}"${rel ? ` rel="${rel}"` : ""}>${esc(text)}</a>`;
const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

function socialsHtml(socials: SocialLinksConfig, owner: string) {
  const links = getConfiguredSocialLinks(socials);
  if (!links.length) return "";
  return `<p>Réseaux de ${esc(owner)} : ${links.map(({ label, url }) => link(url, label, "me noopener")).join(" · ")}</p>`;
}

async function fetchDocuments(apiUrl: string): Promise<SeoDocument[]> {
  try {
    const res = await fetch(`${apiUrl}/api/afficher`, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { document?: (SeoDocument & { licence?: string })[] };
    return (data.document ?? [])
      .map((d) => ({
        id: Number(d.id),
        title: d.title ?? "",
        filiere: d.filiere ?? "",
        annee: d.annee ?? "",
        niveau: d.niveau ?? d.licence ?? "",
        session: d.session ?? "",
        type: d.type ?? "",
        created_at: d.created_at ?? null,
        auteur: d.auteur ?? null,
      }))
      .filter((d) => d.id && d.title);
  } catch (err) {
    console.warn(`\n[seo] Documents non récupérés (${(err as Error).message}) : les pages des documents ne seront pas pré-générées.`);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Readable content of each page (shown without JavaScript)
// ---------------------------------------------------------------------------

const NAV = `<header><p><a href="/"><strong>${esc(SEO_CONFIG.siteName)}</strong></a> · Bibliothèque numérique de l'${esc(SEO_CONFIG.universityName)}</p>
<nav aria-label="Navigation principale">${[
  link("/", "Accueil"),
  link("/documents", "Documents"),
  ...CATEGORIES.map((c) => link(`/documents?type=${encodeURIComponent(c.value)}`, c.label)),
  link("/proposer", "Proposer un document"),
  link("/a-propos", "À propos"),
  link("/contact", "Contact"),
].join(" · ")}</nav></header>`;

const FOOTER = `<footer><p>${esc(SEO_CONFIG.siteName)} · Bibliothèque numérique de l'${esc(SEO_CONFIG.universityName)}, Bingerville, Côte d'Ivoire.</p>
<p>Conçu et développé par ${esc(GAMA_LABS.name)}.</p>
<p>Contact : ${link(`mailto:${SEO_CONFIG.contact.email}`, SEO_CONFIG.contact.email)}</p></footer>`;

function breadcrumbHtml(meta: SeoMeta) {
  if (!meta.breadcrumb?.length) return "";
  const crumbs = [{ name: "Accueil", path: "/" }, ...meta.breadcrumb];
  return `<nav aria-label="Fil d'Ariane"><ol>${crumbs
    .map((c, i) => `<li>${i === crumbs.length - 1 ? esc(c.name) : link(c.path, c.name)}</li>`)
    .join("")}</ol></nav>`;
}

const docLink = (d: SeoDocument) => `${link(documentPath(d), d.title)} (${esc(documentFacts(d).join(" · "))})`;

function countBy(documents: SeoDocument[]) {
  const byType: Record<string, number> = {};
  const byFiliere: Record<string, number> = {};
  for (const d of documents) {
    byType[d.type] = (byType[d.type] ?? 0) + 1;
    for (const f of d.filiere.split(/,\s*/).filter(Boolean)) byFiliere[f] = (byFiliere[f] ?? 0) + 1;
  }
  return { byType, byFiliere };
}

function homeBody(documents: SeoDocument[]) {
  const { byType, byFiliere } = countBy(documents);
  return `<h1>${esc(SEO_CONFIG.siteName)} : la bibliothèque numérique de l'${esc(SEO_CONFIG.universityName)}</h1>
<p>${esc(SEO_CONFIG.defaultDescription)}</p>
${documents.length ? `<p>${documents.length} documents en ligne.</p>` : ""}
<section><h2>Par catégorie</h2>${list(
    CATEGORIES.map((c) => `${link(`/documents?type=${encodeURIComponent(c.value)}`, c.label)}${byType[c.value] ? ` (${byType[c.value]})` : ""}`),
  )}</section>
<section><h2>Par filière</h2>${list(
    FILIERES.map((f) => `${link(`/documents?filiere=${encodeURIComponent(f)}`, f)}${byFiliere[f] ? ` (${byFiliere[f]})` : ""}`),
  )}</section>
${documents.length ? `<section><h2>Derniers documents ajoutés</h2>${list(documents.slice(0, 24).map(docLink))}<p>${link("/documents", "Voir tous les documents")}</p></section>` : ""}`;
}

function documentsBody(documents: SeoDocument[]) {
  const groups = new Map<string, SeoDocument[]>();
  for (const d of documents) {
    const key = d.filiere.split(/,\s*/)[0] || "Autres";
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  const sections = [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([filiere, docs]) => `<section><h2>${esc(filiere)} (${docs.length})</h2>${list(docs.map(docLink))}</section>`)
    .join("\n");
  return `<h1>Tous les documents de la bibliothèque</h1>
<p>Épreuves d'examens, cours, TD, TP, mémoires et livres de l'${esc(SEO_CONFIG.universityName)}, classés par filière.${documents.length ? ` ${documents.length} documents.` : ""}</p>
${sections}`;
}

function documentBody(doc: SeoDocument, documents: SeoDocument[], meta: SeoMeta) {
  const filiere = doc.filiere.split(/,\s*/)[0] ?? "";
  const related = documents.filter((d) => d.id !== doc.id && d.filiere.includes(filiere)).slice(0, 12);
  const facts: [string, string | null | undefined][] = [
    ["Catégorie", categoryLabel(doc.type)],
    ["Filière", doc.filiere],
    ["Niveau", doc.niveau],
    ["Année", doc.annee],
    ["Session", doc.session],
    ["Auteur", doc.auteur],
  ];
  return `${breadcrumbHtml(meta)}
<article><h1>${esc(doc.title)}</h1>
<p>${esc(documentDescription(doc))}</p>
<dl>${facts.filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
<p>Lecture et téléchargement gratuits avec un compte étudiant.</p></article>
${related.length ? `<section><h2>Autres documents en ${esc(filiere)}</h2>${list(related.map(docLink))}<p>${link(`/documents?filiere=${encodeURIComponent(filiere)}`, `Tous les documents ${filiere}`)}</p></section>` : ""}`;
}

function aboutBody(documents: SeoDocument[]) {
  const { byType } = countBy(documents);
  return `<h1>À propos de ${esc(SEO_CONFIG.siteName)}</h1>
<p>${esc(SEO_CONFIG.siteName)} rassemble en un seul endroit les ressources pédagogiques des étudiants de l'${esc(SEO_CONFIG.universityName)} (Bingerville, Côte d'Ivoire) : épreuves d'examens, cours, sujets de TD et de TP, mémoires et livres, classés par filière, par niveau et par année.</p>
<section><h2>Ce que contient la bibliothèque</h2>${list(
    CATEGORIES.map((c) => `${link(`/documents?type=${encodeURIComponent(c.value)}`, c.label)}${byType[c.value] ? ` : ${byType[c.value]}` : ""}`),
  )}<p>Filières : ${FILIERES.join(", ")}.</p></section>
<section><h2>Questions fréquentes</h2>${FAQ.map(({ q, a }) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join("")}</section>`;
}

function memberBlock(m: (typeof TEAM)[number], heading: "h1" | "h2") {
  return `<${heading}>${heading === "h2" ? link(memberPath(m), m.name) : esc(m.name)}</${heading}>
${m.photos.map((p, i) => `<img src="${memberPhotoUrl(p)}" alt="${esc(i === 0 ? `Portrait de ${m.name}` : `${m.name}, photo ${i + 1}`)}" width="320" loading="lazy">`).join("")}
<p>${m.role ? `${esc(m.role)} · ` : ""}Membre de ${link("/gama-labs", GAMA_LABS.name)}</p>
<p>${esc(memberSummary(m))}</p>
${m.skills?.length ? `<p>Compétences : ${esc(m.skills.join(", "))}</p>` : ""}
${socialsHtml(m.socials, m.name)}`;
}

function teamBody() {
  return `<h1>L'équipe de ${esc(GAMA_LABS.name)} derrière ${esc(SEO_CONFIG.siteName)}</h1>
<p>${esc(SEO_CONFIG.siteName)} a été conçue et développée par les ${TEAM.length} membres de ${link("/gama-labs", GAMA_LABS.name)}.</p>
${TEAM.map((m) => `<section>${memberBlock(m, "h2")}</section>`).join("\n")}`;
}

function memberBody(m: (typeof TEAM)[number], meta: SeoMeta) {
  return `${breadcrumbHtml(meta)}<article>${memberBlock(m, "h1")}
<h2>Réalisation</h2><p>A participé à la conception et au développement de ${link("/a-propos", SEO_CONFIG.siteName)}, la bibliothèque numérique des étudiants de l'${esc(SEO_CONFIG.universityName)}, avec l'équipe de ${esc(GAMA_LABS.name)}.</p></article>
<section><h2>Les autres membres de ${esc(GAMA_LABS.name)}</h2>${list(TEAM.filter((o) => o.slug !== m.slug).map((o) => link(memberPath(o), o.name)))}</section>`;
}

function gamaBody(documents: SeoDocument[]) {
  return `<h1>${esc(GAMA_LABS.name)}</h1>
<img src="${GAMA_LABS.logo}" alt="Logo de ${esc(GAMA_LABS.name)}" width="160" height="160">
<p>${esc(GAMA_LABS.description)}</p>
${GAMA_LABS.email ? `<p>Contact : ${link(`mailto:${GAMA_LABS.email}`, GAMA_LABS.email)}</p>` : ""}
${socialsHtml(GAMA_LABS.socials, GAMA_LABS.name)}
${GAMA_LABS.photos.map((p, i) => `<img src="${gamaPhotoUrl(p)}" alt="${esc(`${GAMA_LABS.name}, photo ${i + 1}`)}" width="480" loading="lazy">`).join("")}
<section><h2>Les membres de ${esc(GAMA_LABS.name)}</h2>${list(TEAM.map((m) => `${link(memberPath(m), m.name)}${m.role ? `, ${esc(m.role)}` : ""}`))}</section>
<section><h2>Réalisation : ${esc(SEO_CONFIG.siteName)}</h2><p>${link("/a-propos", SEO_CONFIG.siteName)}, la bibliothèque numérique des étudiants de l'${esc(SEO_CONFIG.universityName)}${documents.length ? ` (${documents.length} documents en ligne)` : ""}.</p></section>`;
}

const contactBody = () => `<h1>Contactez-nous</h1>
<p>Une question, un problème sur le site ou un document introuvable ? Écrivez-nous, nous vous répondrons par e-mail.</p>
<ul><li>E-mail : ${link(`mailto:${SEO_CONFIG.contact.email}`, SEO_CONFIG.contact.email)}</li><li>Téléphone : ${link(`tel:${SEO_CONFIG.contact.telephone}`, "+225 01 72 48 93 31")}</li><li>Adresse : ${esc(SEO_CONFIG.location.streetAddress)}, ${esc(SEO_CONFIG.location.addressLocality)}, Côte d'Ivoire</li></ul>`;

const proposeBody = () => `<h1>Proposer un document</h1>
<p>Vous avez une épreuve d'examen, un cours, un TD ou un TP qui n'est pas encore dans la bibliothèque ? Proposez-le : chaque proposition est vérifiée par l'équipe avant d'être publiée.</p>`;

// ---------------------------------------------------------------------------
// HTML assembly
// ---------------------------------------------------------------------------

const jsonForScript = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

function renderHead(meta: SeoMeta) {
  const t = headTags(meta);
  return [
    `<title>${esc(t.title)}</title>`,
    ...t.metas.map(([attr, key, content]) => `<meta ${attr}="${key}" content="${esc(content)}" />`),
    `<link rel="canonical" href="${esc(t.canonical)}" />`,
    t.jsonLd ? `<script id="seo-json-ld" type="application/ld+json">${jsonForScript(t.jsonLd)}</script>` : "",
  ]
    .filter(Boolean)
    .join("\n    ");
}

function renderPage(shell: string, meta: SeoMeta, body: string) {
  const head = shell.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, `<!--seo:start-->\n    ${renderHead(meta)}\n    <!--seo:end-->`);
  const content = body ? `<div class="ssg">${NAV}<main>${body}</main>${FOOTER}</div>` : "";
  return head.replace('<div id="root"></div>', `<div id="root">${content}</div>`);
}

// ---------------------------------------------------------------------------
// Sitemaps, robots, llms
// ---------------------------------------------------------------------------

type SitemapEntry = { path: string; lastmod?: string; images?: string[] };

function urlset(entries: SitemapEntry[]) {
  const urls = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${esc(absoluteUrl(e.path))}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}${(e.images ?? [])
          .map((img) => `\n    <image:image><image:loc>${esc(absoluteUrl(img))}</image:loc></image:image>`)
          .join("")}\n  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
}

function sitemapIndex(files: { name: string; lastmod: string }[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${files.map((f) => `  <sitemap>\n    <loc>${SITE_DOMAIN}/${f.name}</loc>\n    <lastmod>${f.lastmod}</lastmod>\n  </sitemap>`).join("\n")}
</sitemapindex>
`;
}

const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Googlebot-Image",
  "Google-Extended",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Applebot",
  "Applebot-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "meta-externalagent",
  "DuckAssistBot",
  "MistralAI-User",
  "CCBot",
];

// Personal and administrative pages: never useful in search results.
const PRIVATE_PATHS = ["/profil", "/ajouter", "/propositions", "/diffusion", "/mot-de-passe-oublie", "/bibliotheque"];

function robotsTxt() {
  const rules = ["Allow: /", ...PRIVATE_PATHS.map((p) => `Disallow: ${p}`)].join("\n");
  return `# ${SEO_CONFIG.siteName} · ${SITE_DOMAIN}
# Moteurs de recherche et assistants IA sont les bienvenus sur toutes les pages publiques.

User-agent: *
${rules}

${AI_AND_SEARCH_BOTS.map((b) => `User-agent: ${b}`).join("\n")}
${rules}

Sitemap: ${SITE_DOMAIN}/sitemap.xml
`;
}

const mdSocials = (socials: SocialLinksConfig) =>
  getConfiguredSocialLinks(socials)
    .map(({ label, url }) => `[${label}](${url})`)
    .join(", ");

function llmsTxt(documents: SeoDocument[]) {
  const { byType } = countBy(documents);
  return `# ${SEO_CONFIG.siteName}

> ${SEO_CONFIG.siteName} (${SITE_DOMAIN}) est la bibliothèque numérique des étudiants de l'${SEO_CONFIG.universityName} (UPB), à Bingerville en Côte d'Ivoire. Elle a été conçue et développée par ${GAMA_LABS.name}.

La bibliothèque rassemble ${documents.length ? `${documents.length} documents : ` : ""}${CATEGORIES.map((c) => `${/^[A-Z]+$/.test(c.label) ? c.label : c.label.toLowerCase()}${byType[c.value] ? ` (${byType[c.value]})` : ""}`).join(", ")}, classés par filière (${FILIERES.join(", ")}), par niveau et par année. Le catalogue est consultable par tous ; la lecture et le téléchargement sont gratuits avec un compte étudiant.

## Pages principales

- [Accueil](${SITE_DOMAIN}/) : présentation et derniers documents
- [Tous les documents](${SITE_DOMAIN}/documents) : catalogue complet, avec un lien vers la page de chaque document
- [À propos](${SITE_DOMAIN}/a-propos) : présentation détaillée et questions fréquentes
- [Proposer un document](${SITE_DOMAIN}/proposer) : contribution des étudiants, vérifiée avant publication
- [Contact](${SITE_DOMAIN}/contact)

## Créateurs

- [${GAMA_LABS.name}](${SITE_DOMAIN}/gama-labs) : ${GAMA_LABS.description}${mdSocials(GAMA_LABS.socials) ? ` Réseaux : ${mdSocials(GAMA_LABS.socials)}.` : ""}
- [L'équipe](${SITE_DOMAIN}/equipe) : les membres de ${GAMA_LABS.name}
${TEAM.map((m) => `- [${m.name}](${absoluteUrl(memberPath(m))})${m.role ? `, ${m.role}` : ""} : membre de ${GAMA_LABS.name}${mdSocials(m.socials) ? `. ${mdSocials(m.socials)}` : ""}`).join("\n")}

## Optional

- [Version complète pour les IA](${SITE_DOMAIN}/llms-full.txt) : présentation, FAQ, équipe et liste de tous les documents
- [Plan du site](${SITE_DOMAIN}/sitemap.xml)
`;
}

function llmsFullTxt(documents: SeoDocument[]) {
  const groups = new Map<string, SeoDocument[]>();
  for (const d of documents) groups.set(d.type, [...(groups.get(d.type) ?? []), d]);
  return `${llmsTxt(documents).replace(/\n## Optional[\s\S]*$/, "")}
## Questions fréquentes

${[CREATORS_FAQ, ...FAQ].map(({ q, a }) => `### ${q}\n\n${a}`).join("\n\n")}

## ${GAMA_LABS.name}

${GAMA_LABS.description}
${GAMA_LABS.email ? `\nContact : ${GAMA_LABS.email}\n` : ""}
Membres :

${TEAM.map((m) => `### ${m.name}\n\n${memberSummary(m)}\n\nProfil : ${absoluteUrl(memberPath(m))}${mdSocials(m.socials) ? `\nRéseaux : ${mdSocials(m.socials)}` : ""}${m.skills?.length ? `\nCompétences : ${m.skills.join(", ")}` : ""}`).join("\n\n")}

## Catalogue des documents

${[...groups.entries()]
  .map(([type, docs]) => `### ${CATEGORIES.find((c) => c.value === type)?.label ?? type}\n\n${docs.map((d) => `- [${d.title}](${absoluteUrl(documentPath(d))}) : ${documentFacts(d).slice(1).join(", ")}`).join("\n")}`)
  .join("\n\n")}
`;
}

function humansTxt() {
  return `/* TEAM */
${TEAM.map((m) => `  ${m.role || "Développeur"} : ${m.name}\n  Profil : ${absoluteUrl(memberPath(m))}${m.socials.linkedIn ? `\n  LinkedIn : ${m.socials.linkedIn}` : ""}`).join("\n\n")}

/* STUDIO */
  ${GAMA_LABS.name} · ${absoluteUrl("/gama-labs")}${GAMA_LABS.email ? `\n  Contact : ${GAMA_LABS.email}` : ""}

/* SITE */
  ${SEO_CONFIG.siteName} · ${SITE_DOMAIN}
  Langue : français
  Technologies : React, Vite, Tailwind CSS, Next.js, Supabase
`;
}

/**
 * Netlify routing (processed before netlify.toml): every pre-rendered page at
 * its clean address, short document links → canonical address, then the app.
 */
function redirects(documents: SeoDocument[]) {
  const pages = [...PUBLIC_PAGES.filter((p) => p !== "/"), ...TEAM.map(memberPath), ...documents.map(documentPath)];
  return [
    "# Généré au build par seo/prerender.ts : ne pas modifier à la main.",
    "",
    "# Ancienne page des examens",
    "/examen query=:q  /documents?q=:q  301",
    "/examen  /documents  301",
    "",
    "# Liens courts des documents → adresse complète",
    ...documents.map((d) => `/documents/${d.id}  ${documentPath(d)}  301`),
    "",
    "# Pages pré-générées",
    ...pages.map((p) => `${p}  ${p}.html  200`),
    "",
    "# Documents ajoutés depuis le dernier build : l'application les affiche",
    "/documents/*  /app-index.html  200",
    "",
    "# Pages personnelles et d'administration (non indexées)",
    ...PRIVATE_PATHS.map((p) => `${p}  /app.html  200`),
    "",
    "# Adresse inconnue : vraie erreur 404 (l'application affiche la page)",
    "/*  /404.html  404",
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

export function seoPrerender({ apiUrl }: { apiUrl: string }): Plugin {
  let config: ResolvedConfig;

  return {
    name: "upb-seo-prerender",
    apply: "build",
    configResolved(resolved) {
      config = resolved;
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir);
      const shell = await readFile(path.join(outDir, "index.html"), "utf8");
      if (!shell.includes("<!--seo:start-->") || !shell.includes('<div id="root"></div>')) {
        throw new Error("[seo] index.html doit contenir <!--seo:start-->…<!--seo:end--> et <div id=\"root\"></div>.");
      }

      const documents = await fetchDocuments(apiUrl);
      const newest = day(documents.map((d) => d.created_at).filter(Boolean).sort().at(-1)) ?? today;

      const write = async (file: string, content: string) => {
        const target = path.join(outDir, file);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, content);
      };
      // "/equipe" → equipe.html (served at /equipe without a trailing slash).
      const fileFor = (p: string) => (p === "/" ? "index.html" : `${p.slice(1)}.html`);

      // Public pages
      const bodies: Record<string, () => string> = {
        "/": () => homeBody(documents),
        "/documents": () => documentsBody(documents),
        "/a-propos": () => aboutBody(documents),
        "/equipe": teamBody,
        "/gama-labs": () => gamaBody(documents),
        "/contact": contactBody,
        "/proposer": proposeBody,
      };
      for (const p of PUBLIC_PAGES) {
        await write(fileFor(p), renderPage(shell, staticPageMeta(p, documents)!, bodies[p]()));
      }

      for (const m of TEAM) {
        const meta = memberMeta(m);
        await write(fileFor(meta.path), renderPage(shell, meta, memberBody(m, meta)));
      }

      for (const d of documents) {
        const meta = documentMeta(d);
        await write(fileFor(meta.path), renderPage(shell, meta, documentBody(d, documents, meta)));
      }

      // Shells: private pages (never indexed), documents added since the last
      // build (indexable, completed by the app), and unknown addresses.
      await write("app.html", renderPage(shell, staticPageMeta("/profil")!, ""));
      await write("app-index.html", shell);
      await write(
        "404.html",
        renderPage(
          shell,
          staticPageMeta("/404")!,
          `<h1>Cette page n'existe pas</h1><p>${link("/", "Retour à l'accueil")} · ${link("/documents", "Voir les documents")}</p>`,
        ),
      );

      // Sitemaps
      const pagesSitemap: SitemapEntry[] = PUBLIC_PAGES.map((p) => ({
        path: p,
        lastmod: p === "/" || p === "/documents" ? newest : today,
        images: p === "/" ? [SEO_CONFIG.logoUrl, SEO_CONFIG.defaultOgImage] : undefined,
      })).filter((e) => !["/equipe", "/gama-labs"].includes(e.path));
      const teamSitemap: SitemapEntry[] = [
        { path: "/equipe", lastmod: today, images: TEAM.flatMap((m) => m.photos.map(memberPhotoUrl)) },
        { path: "/gama-labs", lastmod: today, images: [GAMA_LABS.logo, ...GAMA_LABS.photos.map(gamaPhotoUrl), "/og/gama-labs.png"] },
        ...TEAM.map((m) => ({ path: memberPath(m), lastmod: today, images: m.photos.map(memberPhotoUrl) })),
      ];
      const docsSitemap: SitemapEntry[] = documents.map((d) => ({ path: documentPath(d), lastmod: day(d.created_at) }));

      const sitemaps = [
        { name: "sitemap-pages.xml", entries: pagesSitemap, lastmod: newest },
        { name: "sitemap-equipe.xml", entries: teamSitemap, lastmod: today },
        { name: "sitemap-documents.xml", entries: docsSitemap, lastmod: newest },
      ].filter((s) => s.entries.length);
      for (const s of sitemaps) await write(s.name, urlset(s.entries));
      await write("sitemap.xml", sitemapIndex(sitemaps));

      await write("_redirects", redirects(documents));
      await write("robots.txt", robotsTxt());
      await write("llms.txt", llmsTxt(documents));
      await write("llms-full.txt", llmsFullTxt(documents));
      await write("humans.txt", humansTxt());

      const total = PUBLIC_PAGES.length + TEAM.length + documents.length;
      console.log(`\n[seo] ${total} pages pré-générées (${documents.length} documents, ${TEAM.length} membres), sitemaps, robots.txt et llms.txt écrits.`);
    },
  };
}
