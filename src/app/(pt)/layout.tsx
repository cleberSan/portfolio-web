import type { Metadata } from "next";
import { RootDocument } from "@/components/root-document";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";

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

/** Layout raiz da versão em português, a original: todas as páginas fora de `/en`. */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return <RootDocument locale="pt-BR">{children}</RootDocument>;
}
