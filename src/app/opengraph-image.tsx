import { ImageResponse } from "next/og";
import { OgCard, ogSize, siteOgAlt } from "@/components/og-card";
import { site } from "@/config/site";

export const alt = siteOgAlt;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <OgCard
      eyebrow="Portfólio"
      title={site.name}
      subtitle={site.focusAreas.slice(0, 2).join(" · ")}
    />,
    size,
  );
}
