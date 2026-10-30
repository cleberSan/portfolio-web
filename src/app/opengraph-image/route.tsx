import { siteOgImageResponse } from "@/lib/site-og-image";

/** Imagem Open Graph padrão em português, gerada no build. */
export function GET() {
  return siteOgImageResponse("pt-BR");
}
