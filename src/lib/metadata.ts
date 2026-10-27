import type { Metadata } from "next";
import { ogSize, siteOgAlt } from "@/components/og-card";
import { site } from "@/config/site";
import { type Locale, openGraphLocale } from "@/i18n/locales";
import { languageAlternates } from "@/i18n/routes";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Caminho canônico da página; a origem vem de `metadataBase` no layout raiz. */
  path: `/${string}`;
  /** Usa o título sem o sufixo do template (home). */
  absoluteTitle?: boolean;
  article?: { publishedTime: string; tags: readonly string[] };
  /**
   * A página tem `opengraph-image.tsx` no próprio segmento. A imagem padrão fica de fora
   * para a do segmento valer também no `twitter:image` e não disputar com ela.
   */
  ownImage?: boolean;
  /** Idioma da página; o padrão é o português, o idioma original do site. */
  locale?: Locale;
};

const ogImagePath: Record<Locale, string> = {
  "pt-BR": "/opengraph-image",
  en: "/en/opengraph-image",
};

/**
 * Imagem padrão de cada idioma, gerada pelos Route Handlers `app/opengraph-image` e
 * `app/en/opengraph-image` (`src/lib/site-og-image.tsx`). O helper a coloca em toda página que não
 * tem imagem própria, já que o `openGraph` da página substitui o do layout.
 */
function siteOgImage(locale: Locale) {
  return { url: ogImagePath[locale], ...ogSize, alt: siteOgAlt(locale), type: "image/png" };
}

/**
 * O Next.js substitui (não mescla) o objeto `openGraph` do layout quando a página define
 * o seu. Este helper monta sempre o conjunto completo para nenhuma página perder campos.
 * Posts e páginas com `ownImage` não recebem a imagem padrão: a imagem própria vem do
 * arquivo `opengraph-image.tsx` do segmento, que tem prioridade sobre a configuração.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  article,
  ownImage = false,
  locale = "pt-BR",
}: PageMetadataInput): Metadata {
  const languages = languageAlternates(path);
  const shared = {
    title,
    description,
    url: path,
    siteName: site.name,
    locale: openGraphLocale[locale],
    ...(languages ? { alternateLocale: [openGraphLocale[locale === "en" ? "pt-BR" : "en"]] } : {}),
  };

  const images = article || ownImage ? {} : { images: [siteOgImage(locale)] };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path, ...(languages ? { languages } : {}) },
    openGraph: article
      ? {
          ...shared,
          type: "article",
          publishedTime: article.publishedTime,
          authors: [site.name],
          tags: [...article.tags],
        }
      : { ...shared, type: "website", ...images },
    twitter: { card: "summary_large_image", title, description, ...images },
  };
}
