import { dictionaries } from "@/i18n/dictionaries";
import { type Locale, locales } from "@/i18n/locales";
import { localizedPath } from "@/i18n/routes";

const shortNames: Record<Locale, string> = { "pt-BR": "PT-BR", en: "EN" };

type LanguageLinksProps = {
  /** Idioma da página atual. */
  locale: Locale;
  /** Rota atual; sem ela (fallback do prerender), o outro idioma leva à home dele. */
  pathname?: string;
};

/**
 * Seletor de idioma feito só de links, sem script: funciona com a CSP sem nonce e sem JavaScript.
 * O link do outro idioma leva à mesma página nele ou, quando ela só existe em português, à home.
 */
export function LanguageLinks({ locale, pathname }: LanguageLinksProps) {
  const { header, languageNames } = dictionaries[locale];

  return (
    <ul aria-label={header.languageLabel} className="flex items-center gap-1 font-mono text-xs">
      {locales.map((target) => (
        <li key={target}>
          {target === locale ? (
            // O idioma atual não é link: a página já está nele, e a URL atual pode ser a da 404.
            <span
              lang={target}
              title={languageNames[target]}
              aria-current="true"
              className="bg-surface text-foreground border-border block rounded-md border px-2 py-1 font-medium"
            >
              {shortNames[target]}
            </span>
          ) : (
            <a
              href={localizedPath(pathname, target)}
              hrefLang={target}
              lang={target}
              title={languageNames[target]}
              className="text-muted hover:text-foreground hover:bg-surface block rounded-md border border-transparent px-2 py-1"
            >
              {shortNames[target]}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
