import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { site } from "@/config/site";

export const alt = `${site.name}, ${site.role}`;
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
