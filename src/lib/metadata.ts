import type { Metadata } from "next";
import { site } from "@/config/site";

type PageMetadataInput = {
  title: string;
  description: string;
  /** Caminho canônico da página; a origem vem de `metadataBase` no layout raiz. */
  path: `/${string}`;
  /** Usa o título sem o sufixo do template (home). */
  absoluteTitle?: boolean;
  article?: { publishedTime: string; tags: readonly string[] };
};

/**
 * O Next.js substitui (não mescla) o objeto `openGraph` do layout quando a página define
 * o seu. Este helper monta sempre o conjunto completo para nenhuma página perder campos.
 */
export function pageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  article,
}: PageMetadataInput): Metadata {
  const shared = {
    title,
    description,
    url: path,
    siteName: site.name,
    locale: "pt_BR",
  };

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
      : { ...shared, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}
