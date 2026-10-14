import { NextResponse, type NextRequest } from "next/server";
import { getPostBySlug } from "@/content/posts";

/** Caminho sem rota no app: o rewrite cai no `not-found.tsx` com status 404. */
export const notFoundRewritePath = "/404";

/**
 * Com Cache Components e Partial Prefetching, um slug desconhecido recebe primeiro o
 * App Shell de `/diario/[slug]` com status 200, e o `notFound()` da página só chega
 * depois, já no streaming. Barrar aqui, antes da renderização, devolve 404 desde a
 * primeira requisição e impede que URLs inventadas criem entradas no cache de páginas
 * (ver ADR-0004).
 */
export function proxy(request: NextRequest) {
  const slug = safeDecode(request.nextUrl.pathname.split("/")[2] ?? "");

  if (slug !== undefined && getPostBySlug(slug)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(notFoundRewritePath, request.url));
}

function safeDecode(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment);
  } catch {
    return undefined;
  }
}

export const config = {
  // Só a página do post; a imagem Open Graph já responde 404 sozinha.
  matcher: "/diario/:slug",
};
