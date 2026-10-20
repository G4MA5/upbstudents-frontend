import { useEffect } from "react";
import { headTags, staticPageMeta, type SeoMeta } from "./seo";
import { SEO_CONFIG } from "./seoConfig";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(data: object | null) {
  let el = document.head.querySelector<HTMLScriptElement>("#seo-json-ld");
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = "seo-json-ld";
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Title, description, canonical URL, Open Graph and Schema.org data of the
 * current page. The same values are pre-rendered in the HTML at build time
 * (seo/prerender.ts), so search engines and AI crawlers see them without JS.
 *
 * Without argument: the page is looked up by its path. A full `SeoMeta`
 * (document or member pages) or a partial override can be passed.
 */
export function useSeoHead(override?: Partial<SeoMeta> & { customPath?: string }) {
  const key = JSON.stringify(override ?? null);

  useEffect(() => {
    const path = override?.customPath || override?.path || window.location.pathname || "/";
    // Unknown path without its own metadata: not indexed. A page that passes
    // its own metadata (document, member) is indexable unless it says otherwise.
    const base = staticPageMeta(path) ?? {
      title: SEO_CONFIG.fullSiteTitle,
      description: SEO_CONFIG.defaultDescription,
      path,
      noindex: !override?.title,
    };
    const meta: SeoMeta = { ...base, ...override, path: override?.path || base.path };
    const tags = headTags(meta);

    document.title = tags.title;
    for (const [attr, name, content] of tags.metas) setMeta(attr, name, content);
    setCanonical(tags.canonical);
    setJsonLd(tags.jsonLd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
