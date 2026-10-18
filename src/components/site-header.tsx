import Link from "next/link";
import { Suspense } from "react";
import { navigation, site } from "@/config/site";
import { ActiveNavLinks } from "./active-nav-links";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="border-border bg-background/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-mono text-base font-medium tracking-tight"
        >
          <span
            aria-hidden="true"
            className="text-accent status-dot size-2 rounded-full bg-current"
          />
          {site.name}
        </Link>
        <nav aria-label="Principal">
          {/* Em rotas com parâmetro desconhecido no build, usePathname suspende; o fallback
              mantém o cabeçalho pré-renderizado, só sem destacar a seção atual. */}
          <Suspense fallback={<NavLinks items={navigation} />}>
            <ActiveNavLinks items={navigation} />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
