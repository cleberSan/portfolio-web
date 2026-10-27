import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { careflow } from "@/content/careflow";

export const alt = `${careflow.name}: ${careflow.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow="Projeto vitrine" title={careflow.name} subtitle={careflow.tagline} />,
    size,
  );
}
