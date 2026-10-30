import Link from "next/link";
import { Suspense } from "react";
import { getNavigation, site } from "@/config/site";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { homePath } from "@/i18n/routes";
import { ActiveLanguageLinks } from "./active-language-links";
import { ActiveNavLinks } from "./active-nav-links";
import { LanguageLinks } from "./language-links";
import { NavLinks } from "./nav-links";

export function SiteHeader({ locale }: { locale: Locale }) {
  const navigation = getNavigation(locale);

  return (
    <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3 lg:flex-nowrap">
        <Link
          href={homePath[locale]}
          className="flex shrink-0 items-center gap-2.5 font-mono text-base font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="text-accent status-dot size-2 rounded-full bg-current"
          />
          {site.name}
        </Link>
        {/* No celular o menu desce para a linha de baixo e o seletor de idioma fica ao lado do nome;
            no desktop a ordem visual é a do HTML: nome, menu e idioma. */}
        <nav
          aria-label={dictionaries[locale].header.navLabel}
          className="order-last w-full min-w-0 lg:order-none lg:ml-auto lg:w-auto"
        >
          {/* Em rotas com parâmetro desconhecido no build, usePathname suspende; o fallback
              mantém o cabeçalho pré-renderizado, só sem destacar a seção atual. */}
          <Suspense fallback={<NavLinks items={navigation} />}>
            <ActiveNavLinks items={navigation} />
          </Suspense>
        </nav>
        <Suspense fallback={<LanguageLinks locale={locale} />}>
          <ActiveLanguageLinks locale={locale} />
        </Suspense>
      </div>
    </header>
  );
}
