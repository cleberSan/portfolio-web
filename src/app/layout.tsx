import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mainContentId, SkipLink } from "@/components/skip-link";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: siteUrl.url,
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.links.github }],
  creator: site.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${plexSans.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <SiteHeader />
        <main
          id={mainContentId}
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-6 py-14 focus:outline-none sm:py-20"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
