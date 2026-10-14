import type { MetadataRoute } from "next";
import type { SiteUrl } from "@/config/site-url";
import type { Post } from "@/content/posts";
import { parseIsoDate } from "./format-date";

/**
 * Sem `SITE_URL` (ambientes de preview e CI), o site pede para não ser rastreado:
 * melhor não indexar do que indexar URLs canônicas apontando para localhost.
 */
export function buildRobots({ url, configured }: SiteUrl): MetadataRoute.Robots {
  if (!configured) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", url).href,
  };
}

export function buildSitemap(
  base: URL,
  routes: readonly string[],
  posts: readonly Post[],
): MetadataRoute.Sitemap {
  return [
    ...routes.map((route) => ({ url: new URL(route, base).href })),
    ...posts.map((post) => ({
      url: new URL(`/diario/${post.slug}`, base).href,
      lastModified: parseIsoDate(post.publishedAt),
    })),
  ];
}
