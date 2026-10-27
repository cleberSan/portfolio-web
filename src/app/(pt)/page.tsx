import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${site.role}`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  return <HomePage locale="pt-BR" />;
}
