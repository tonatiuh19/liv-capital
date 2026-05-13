import { useEffect } from "react";

const SITE = {
  name: "LIV Capital",
  baseUrl: "https://livcapitalgdl.mx",
  defaultImage: "/og-image.jpg",
  twitterHandle: "@livcapital",
};

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  canonicalUrl?: string;
  keywords?: string;
  structuredData?: Record<string, unknown>;
  noIndex?: boolean;
}

export default function MetaTags({
  title,
  description,
  image = SITE.defaultImage,
  type = "website",
  canonicalUrl,
  keywords,
  structuredData,
  noIndex = false,
}: MetaTagsProps) {
  const fullTitle = `${title} | ${SITE.name}`;
  const canonical = canonicalUrl ?? SITE.baseUrl;
  const ogImage = image.startsWith("http") ? image : `${SITE.baseUrl}${image}`;

  useEffect(() => {
    document.title = fullTitle;

    const setMeta = (selector: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.includes("[name=")
          ? "name"
          : selector.includes("[property=")
            ? "property"
            : "name";
        const val = selector.match(/["']([^"']+)["']/)?.[1] ?? "";
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Basic meta
    setMeta('meta[name="description"]', description);
    if (keywords) setMeta('meta[name="keywords"]', keywords);
    setMeta(
      'meta[name="robots"]',
      noIndex ? "noindex,nofollow" : "index,follow",
    );

    // Canonical
    setLink("canonical", canonical);

    // Open Graph
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:image"]', ogImage);
    setMeta('meta[property="og:url"]', canonical);
    setMeta('meta[property="og:type"]', type);
    setMeta('meta[property="og:site_name"]', SITE.name);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:site"]', SITE.twitterHandle);
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', ogImage);

    // JSON-LD structured data
    if (structuredData) {
      let scriptEl = document.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"]',
      );
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.setAttribute("type", "application/ld+json");
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    }
  }, [
    fullTitle,
    description,
    keywords,
    noIndex,
    canonical,
    ogImage,
    type,
    structuredData,
  ]);

  return null;
}
