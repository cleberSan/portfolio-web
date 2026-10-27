import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";

export const alt = "Painel de Privacidade e Resiliência do CareFlow";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="CareFlow · Demonstração"
      title="Painel de Privacidade e Resiliência"
      subtitle="Uma execução real com paciente sintético, do trace à eliminação."
    />,
    size,
  );
}
