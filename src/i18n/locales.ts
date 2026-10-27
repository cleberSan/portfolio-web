/**
 * Idiomas do site. O português é o original e cobre tudo; o inglês cobre as páginas principais
 * (home e Sobre). Projetos, diário e Painel existem só em português (ADR-0006).
 */
export const locales = ["pt-BR", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

/** `og:locale` usa sublinhado em vez de hífen. */
export const openGraphLocale: Record<Locale, string> = { "pt-BR": "pt_BR", en: "en_US" };

/** Formato de números e listas de cada idioma, para o `Intl`. */
export const intlLocale: Record<Locale, string> = { "pt-BR": "pt-BR", en: "en-US" };
