import type { Metadata } from "next";
import { AboutPage } from "@/components/about/about-page";
import { aboutText } from "@/components/about/about-text";
import { pageMetadata } from "@/lib/metadata";

const { title, description, path } = aboutText.en;

export const metadata: Metadata = pageMetadata({ title, description, path, locale: "en" });

export default function EnglishAboutPage() {
  return <AboutPage locale="en" />;
}
