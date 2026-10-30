import type { Metadata } from "next";
import { RootDocument } from "@/components/root-document";
import { getSiteText, site } from "@/config/site";
import { siteUrl } from "@/config/site-url";

const { role, description } = getSiteText("en");

export const metadata: Metadata = {
  metadataBase: siteUrl.url,
  title: {
    default: `${site.name} | ${role}`,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name, url: site.links.linkedin }],
  creator: site.name,
};

/** Layout raiz da versão em inglês (`/en`), com `<html lang="en">` (ADR-0006). */
export default function EnglishRootLayout({ children }: LayoutProps<"/en">) {
  return <RootDocument locale="en">{children}</RootDocument>;
}
