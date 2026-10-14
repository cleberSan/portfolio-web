import Link from "next/link";
import { Suspense } from "react";
import { navigation, site } from "@/config/site";
import { ActiveNavLinks } from "./active-nav-links";
import { NavLinks } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
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
