"use client";

import { usePathname } from "next/navigation";
import type { NavigationItem } from "@/config/site";
import { NavLinks } from "./nav-links";

/** Única parte do cabeçalho que roda no cliente: marca a seção atual com `aria-current`. */
export function ActiveNavLinks({ items }: { items: readonly NavigationItem[] }) {
  const pathname = usePathname();
  return <NavLinks items={items} pathname={pathname} />;
}
