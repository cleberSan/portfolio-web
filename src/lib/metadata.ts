import type { Metadata } from "next";
import { ogSize, siteOgAlt } from "@/components/og-card";
import { site } from "@/config/site";

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
};

/**
 * Imagem gerada por `src/app/opengraph-image.tsx`. Ela só é aplicada sozinha na home; nas
 * demais páginas o `openGraph` da própria página a descarta, então o helper a repete.
 */
const siteOgImage = { url: "/opengraph-image", ...ogSize, alt: siteOgAlt, type: "image/png" };

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
}: PageMetadataInput): Metadata {
  const shared = {
    title,
    description,
    url: path,
    siteName: site.name,
    locale: "pt_BR",
  };

  const images = article || ownImage ? {} : { images: [siteOgImage] };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
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
