import type { Metadata } from "next";
import { AboutPage } from "@/components/about/about-page";
import { aboutText } from "@/components/about/about-text";
import { pageMetadata } from "@/lib/metadata";

const { title, description, path } = aboutText["pt-BR"];

export const metadata: Metadata = pageMetadata({ title, description, path });

export default function SobrePage() {
  return <AboutPage locale="pt-BR" />;
}
