import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/locales";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { mainContentId, SkipLink } from "./skip-link";
import "@/app/globals.css";

// IBM Plex é livre (SIL Open Font License). O next/font baixa os arquivos no build e serve pela
// própria origem, então a CSP continua com `font-src 'self'`.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

type RootDocumentProps = { locale: Locale; children: ReactNode };

/**
 * Documento inteiro de uma versão do site, com o `lang` do idioma. Cada idioma tem o próprio layout
 * raiz (`app/(pt)` e `app/en`), porque o `<html lang>` só é definido no layout raiz (ADR-0006).
 */
export function RootDocument({ locale, children }: RootDocumentProps) {
  return (
    <html lang={locale} className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SkipLink locale={locale} />
        <SiteHeader locale={locale} />
        <main
          id={mainContentId}
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-6 py-14 focus:outline-none sm:py-20 print:p-0"
        >
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
