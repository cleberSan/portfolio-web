import { staticRoutes } from "../src/config/site";
import { getAllPosts } from "../src/content/posts";

/** Todas as páginas públicas: rotas fixas e cada post do diário. */
export const allPages: readonly string[] = [
  ...staticRoutes,
  ...getAllPosts().map((post) => `/diario/${post.slug}`),
];
