import { intlLocale, type Locale } from "@/i18n/locales";

const listFormats: Record<Locale, Intl.ListFormat> = {
  "pt-BR": new Intl.ListFormat(intlLocale["pt-BR"], { style: "long", type: "conjunction" }),
  en: new Intl.ListFormat(intlLocale.en, { style: "long", type: "conjunction" }),
};

/** "pagamentos digitais, saúde e educação": lista natural em minúsculas, para o meio da frase. */
export function formatList(items: readonly string[], locale: Locale = "pt-BR"): string {
  return listFormats[locale].format(items.map((item) => item.toLowerCase()));
}
