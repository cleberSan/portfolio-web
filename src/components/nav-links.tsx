import Link from "next/link";
import type { NavigationItem } from "@/config/site";

/** Uma seção está ativa na própria rota e em qualquer rota abaixo dela. */
export function isActivePath(pathname: string | undefined, href: string): boolean {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinksProps = {
  items: readonly NavigationItem[];
  /** Rota atual; sem ela, nenhum item é marcado (fallback do prerender). */
  pathname?: string;
};

export function NavLinks({ items, pathname }: NavLinksProps) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "text-foreground font-medium underline decoration-2 underline-offset-8"
                  : "text-muted hover:text-foreground underline-offset-8 hover:underline"
              }
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
