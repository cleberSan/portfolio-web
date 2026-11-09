import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";

export const alt = "Ecossistema: o mapa dos projetos de Cleber Costa Santos";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Mapa dos projetos"
      title="Ecossistema"
      subtitle="Projetos, agentes e decisões num mapa só, com execuções gravadas pelo CI."
    />,
    size,
  );
}
