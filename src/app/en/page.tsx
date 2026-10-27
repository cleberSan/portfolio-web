import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";
import { getSiteText, site } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";

const { role, description } = getSiteText("en");

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${role}`,
  description,
  path: "/en",
  absoluteTitle: true,
  locale: "en",
});

export default function EnglishHome() {
  return <HomePage locale="en" />;
}
