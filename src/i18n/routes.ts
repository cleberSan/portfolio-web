import type { Locale } from "./locales";

export type LocalizedPath = `/${string}`;

/**
 * Páginas que existem nos dois idiomas. As URLs em português são as originais e não mudam; as em
 * inglês ficam abaixo de `/en`. O resto do site existe só em português.
 */
export const translatedRoutes = [
  { "pt-BR": "/", en: "/en" },
  { "pt-BR": "/sobre", en: "/en/about" },
] as const satisfies readonly Record<Locale, LocalizedPath>[];

export const homePath: Record<Locale, LocalizedPath> = { "pt-BR": "/", en: "/en" };

function findRoute(path: string) {
  return translatedRoutes.find((route) => route["pt-BR"] === path || route.en === path);
}

/**
 * Para onde o seletor de idioma leva: a mesma página no outro idioma ou, quando ela só existe em
 * português, a home do idioma escolhido. Sem rota conhecida (fallback do prerender), vai para a home.
 */
export function localizedPath(pathname: string | undefined, target: Locale): LocalizedPath {
  const route = pathname ? findRoute(pathname) : undefined;
  return route ? route[target] : homePath[target];
}

/**
 * Versões alternativas da página para o `hreflang`: os dois idiomas e o português como `x-default`.
 * Páginas só em português não têm alternativa.
 */
export function languageAlternates(
  path: string,
): Record<Locale | "x-default", LocalizedPath> | undefined {
  const route = findRoute(path);
  if (!route) {
    return undefined;
  }

  return { "pt-BR": route["pt-BR"], en: route.en, "x-default": route["pt-BR"] };
}
