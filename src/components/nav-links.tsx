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
    <ul className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "bg-surface text-foreground border-border block rounded-md border px-3 py-1.5 font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface block rounded-md border border-transparent px-3 py-1.5"
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
