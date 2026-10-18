import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { mainContentId, SkipLink } from "@/components/skip-link";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl.url,
  title: {
    default: `${site.name} | ${site.role}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.links.linkedin }],
  creator: site.name,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SkipLink />
        <SiteHeader />
        <main
          id={mainContentId}
          tabIndex={-1}
          className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 focus:outline-none sm:py-20"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
