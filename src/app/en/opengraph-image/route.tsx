import { siteOgImageResponse } from "@/lib/site-og-image";

/** Imagem Open Graph padrão em inglês, gerada no build. */
export function GET() {
  return siteOgImageResponse("en");
}
