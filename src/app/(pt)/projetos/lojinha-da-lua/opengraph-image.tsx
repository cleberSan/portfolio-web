import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { lojinha } from "@/content/lojinha";

export const alt = `${lojinha.name}: ${lojinha.tagline}`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard eyebrow="Projeto para uma loja real" title={lojinha.name} subtitle={lojinha.tagline} />,
    size,
  );
}
