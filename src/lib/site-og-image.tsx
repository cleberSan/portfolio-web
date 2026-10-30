import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { getSiteText, site } from "@/config/site";
import type { Locale } from "@/i18n/locales";

const eyebrow: Record<Locale, string> = { "pt-BR": "Portfólio", en: "Portfolio" };

/**
 * Imagem Open Graph padrão de cada idioma. Sai de um Route Handler com URL fixa, e não do arquivo
 * `opengraph-image.tsx`, porque dentro do grupo `(pt)` o Next acrescenta um hash ao caminho desse
 * arquivo, e o `pageMetadata` precisa repetir a URL em toda página (ADR-0006).
 */
export function siteOgImageResponse(locale: Locale): ImageResponse {
  return new ImageResponse(
    <OgCard
      eyebrow={eyebrow[locale]}
      title={site.name}
      subtitle={getSiteText(locale).focusAreas.slice(0, 2).join(" · ")}
      locale={locale}
    />,
    ogSize,
  );
}
