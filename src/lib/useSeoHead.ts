import { useEffect } from "react";
import { generateJsonLd, PAGES_SEO, SEO_CONFIG, SITE_DOMAIN, type PageSeoConfig } from "./seoConfig";

function setOrUpdateMeta(selector: string, attributeName: string, attributeValue: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setOrUpdateLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function injectJsonLd(jsonLdObject: object) {
  const scriptId = "seo-json-ld";
  let script = document.head.querySelector<HTMLScriptElement>(`#${scriptId}`);
  if (!script) {
    script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLdObject, null, 2);
}

/**
 * Hook React personnalisé pour la gestion dynamique des balises SEO (Head, Open Graph, Canonical & JSON-LD)
 */
export function useSeoHead(overrideConfig?: Partial<PageSeoConfig> & { customPath?: string }) {
  useEffect(() => {
    const currentPath = overrideConfig?.customPath || window.location.pathname || "/";
    const basePageConfig = PAGES_SEO[currentPath] || PAGES_SEO[currentPath.slice(1)] || {
      title: SEO_CONFIG.fullSiteTitle,
      description: SEO_CONFIG.defaultDescription,
      path: currentPath,
    };

    const title = overrideConfig?.title || basePageConfig.title;
    const description = overrideConfig?.description || basePageConfig.description;
    const noindex = overrideConfig?.noindex ?? basePageConfig.noindex ?? false;
    const ogImage = overrideConfig?.ogImage || basePageConfig.ogImage || SEO_CONFIG.defaultOgImage;
    const ogType = overrideConfig?.ogType || basePageConfig.ogType || "website";

    const canonicalUrl = `${SITE_DOMAIN}${currentPath === "/" ? "" : currentPath}`;

    // Title
    document.title = title;

    // Standard Meta
    setOrUpdateMeta('meta[name="description"]', "name", "description", description);
    setOrUpdateMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");

    // Canonical
    setOrUpdateLink("canonical", canonicalUrl);

    // Open Graph
    setOrUpdateMeta('meta[property="og:title"]', "property", "og:title", title);
    setOrUpdateMeta('meta[property="og:description"]', "property", "og:description", description);
    setOrUpdateMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setOrUpdateMeta('meta[property="og:image"]', "property", "og:image", ogImage);
    setOrUpdateMeta('meta[property="og:type"]', "property", "og:type", ogType);
    setOrUpdateMeta('meta[property="og:site_name"]', "property", "og:site_name", SEO_CONFIG.siteName);

    // Twitter Card
    setOrUpdateMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setOrUpdateMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    setOrUpdateMeta('meta[name="twitter:description"]', "name", "twitter:description", description);
    setOrUpdateMeta('meta[name="twitter:image"]', "name", "twitter:image", ogImage);

    // JSON-LD Schema.org
    if (!noindex) {
      const jsonLd = generateJsonLd(currentPath);
      injectJsonLd(jsonLd);
    } else {
      const script = document.head.querySelector("#seo-json-ld");
      if (script) script.remove();
    }
  }, [overrideConfig]);
}
