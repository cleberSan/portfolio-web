"use client";

import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/locales";
import { LanguageLinks } from "./language-links";

/** Lê a rota atual para o seletor de idioma levar à mesma página no outro idioma. */
export function ActiveLanguageLinks({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  return <LanguageLinks locale={locale} pathname={pathname} />;
}
