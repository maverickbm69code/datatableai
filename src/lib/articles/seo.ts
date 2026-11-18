// Head tags (title, description, canonical, hreflang, Open Graph, JSON-LD) of the
// « Ressources & Conseils » pages. One description of the head, two consumers:
//  * src/lib/page-meta.ts applies it to the live document (client navigation),
//  * scripts/prerender.mjs writes it into the static HTML served to crawlers.
import { CATEGORY_LABELS } from "@/lib/articles/categories";
import { countWords, documentText } from "@/lib/articles/content";
import type { Article, ArticleSummary } from "@/lib/articles/types";
import type { Lang } from "@/lib/i18n";

export const SITE_URL = "https://datableia.com";
export const RESOURCES_PATH = "/ressources";
const LOGO_URL = `${SITE_URL}/logo-mark.png`;
const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1";

export type HeadTag = { tag: "meta" | "link"; attrs: Record<string, string> };

export type PageHead = {
  lang: Lang;
  title: string;
  description: string;
  canonical: string;
  tags: HeadTag[];
  jsonLd: Record<string, unknown>[];
};

const LOCALE: Record<Lang, string> = { fr: "fr_FR", en: "en_US" };

export const articleUrl = (slug: string) => `${SITE_URL}${RESOURCES_PATH}/${slug}`;
export const listingUrl = (lang: Lang) =>
  lang === "en" ? `${SITE_URL}${RESOURCES_PATH}?lang=en` : `${SITE_URL}${RESOURCES_PATH}`;

const COPY = {
  fr: {
    home: "Accueil",
    section: "Ressources & Conseils",
    listTitle: "Ressources & Conseils pour restaurateurs | Datable",
    listDescription:
      "Conseils concrets, analyses et ressources pour transformer les données de caisse de votre restaurant en opportunités : rentabilité, pilotage, menu engineering.",
    listName: "Ressources & Conseils",
  },
  en: {
    home: "Home",
    section: "Resources & Insights",
    listTitle: "Resources & Insights for restaurant operators | Datable",
    listDescription:
      "Practical advice, analysis and resources to turn your restaurant's POS data into opportunities: profitability, management, menu engineering.",
    listName: "Resources & Insights",
  },
} as const;

export const sectionLabel = (lang: Lang) => COPY[lang].section;

const meta = (attrs: Record<string, string>): HeadTag => ({ tag: "meta", attrs });
const link = (attrs: Record<string, string>): HeadTag => ({ tag: "link", attrs });

const ORGANIZATION = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Datable",
  alternateName: "DaTable",
  url: `${SITE_URL}/`,
  logo: { "@type": "ImageObject", url: LOGO_URL, width: 512, height: 512 },
};

function breadcrumb(lang: Lang, trail: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function commonTags(lang: Lang, title: string, description: string, canonical: string, type: string): HeadTag[] {
  return [
    meta({ name: "description", content: description }),
    meta({ name: "robots", content: ROBOTS_INDEX }),
    link({ rel: "canonical", href: canonical }),
    meta({ property: "og:type", content: type }),
    meta({ property: "og:site_name", content: "Datable" }),
    meta({ property: "og:locale", content: LOCALE[lang] }),
    meta({ property: "og:title", content: title }),
    meta({ property: "og:description", content: description }),
    meta({ property: "og:url", content: canonical }),
    meta({ property: "og:image", content: LOGO_URL }),
    meta({ property: "og:image:width", content: "512" }),
    meta({ property: "og:image:height", content: "512" }),
    meta({ property: "og:image:alt", content: "Logo Datable" }),
    meta({ name: "twitter:card", content: "summary" }),
    meta({ name: "twitter:title", content: title }),
    meta({ name: "twitter:description", content: description }),
  ];
}

/** Head of /ressources. The interface exists in both languages, like the home page. */
export function listingHead(lang: Lang, articles: ArticleSummary[]): PageHead {
  const t = COPY[lang];
  const canonical = listingUrl(lang);
  const tags = [
    ...commonTags(lang, t.listTitle, t.listDescription, canonical, "website"),
    meta({ property: "og:locale:alternate", content: LOCALE[lang === "fr" ? "en" : "fr"] }),
    link({ rel: "alternate", hreflang: "fr", href: listingUrl("fr") }),
    link({ rel: "alternate", hreflang: "en", href: listingUrl("en") }),
    link({ rel: "alternate", hreflang: "x-default", href: listingUrl("fr") }),
  ];

  const visible = articles.filter((article) => article.lang === lang);
  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: t.listName,
      description: t.listDescription,
      inLanguage: lang === "fr" ? "fr-FR" : "en-US",
      isPartOf: { "@id": `${SITE_URL}/#website` },
      publisher: ORGANIZATION,
      ...(visible.length
        ? {
            mainEntity: {
              "@type": "ItemList",
              itemListElement: visible.map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: articleUrl(article.slug),
                name: article.title,
              })),
            },
          }
        : {}),
    },
    breadcrumb(lang, [
      { name: t.home, url: `${SITE_URL}/` },
      { name: t.section, url: canonical },
    ]),
  ];

  return { lang, title: t.listTitle, description: t.listDescription, canonical, tags, jsonLd };
}

/**
 * Head of one article. hreflang links are only written when a PUBLISHED translation exists:
 * a link to a page that does not exist would be an error for search engines.
 */
export function articleHead(article: Article, translation?: ArticleSummary | null): PageHead {
  const lang = article.lang;
  const t = COPY[lang];
  const canonical = articleUrl(article.slug);
  const title = article.seo_title?.trim() || `${article.title} | Datable`;
  const description = article.seo_description?.trim() || article.excerpt;
  const modified = article.modified_at ?? article.published_at;

  const tags = [
    ...commonTags(lang, title, description, canonical, "article"),
    meta({ property: "article:published_time", content: article.published_at }),
    meta({ property: "article:modified_time", content: modified }),
    meta({ property: "article:section", content: CATEGORY_LABELS[lang][article.category] }),
    meta({ property: "article:author", content: article.author_name }),
  ];

  if (translation) {
    const otherLang: Lang = translation.lang;
    tags.push(meta({ property: "og:locale:alternate", content: LOCALE[otherLang] }));
    const fr = lang === "fr" ? canonical : articleUrl(translation.slug);
    const en = lang === "en" ? canonical : articleUrl(translation.slug);
    tags.push(
      link({ rel: "alternate", hreflang: "fr", href: fr }),
      link({ rel: "alternate", hreflang: "en", href: en }),
      link({ rel: "alternate", hreflang: "x-default", href: fr }),
    );
  }

  const body = documentText(article.content);

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonical}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      url: canonical,
      headline: article.title,
      description,
      inLanguage: lang === "fr" ? "fr-FR" : "en-US",
      datePublished: article.published_at,
      dateModified: modified,
      articleSection: CATEGORY_LABELS[lang][article.category],
      wordCount: countWords(body),
      timeRequired: `PT${article.reading_minutes}M`,
      author: {
        "@type": "Person",
        name: article.author_name,
        ...(article.author_role ? { jobTitle: article.author_role } : {}),
      },
      publisher: ORGANIZATION,
      ...(body ? { articleBody: body } : {}),
    },
    breadcrumb(lang, [
      { name: t.home, url: `${SITE_URL}/` },
      { name: t.section, url: `${SITE_URL}${RESOURCES_PATH}` },
      { name: article.title, url: canonical },
    ]),
  ];

  return { lang, title, description, canonical, tags, jsonLd };
}
