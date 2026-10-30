import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { demoBackend } from "./src/config/demo-backend";
import { buildSecurityHeaders } from "./src/config/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // Um layout raiz por idioma (ADR-0006): a 404 de URL sem rota vem de `global-not-found.tsx`.
    globalNotFound: true,
  },
  partialPrefetching: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    const securityHeaders = buildSecurityHeaders({
      isDevelopment: process.env.NODE_ENV === "development",
      demoBackend,
    });
    return [{ source: "/:path*", headers: [...securityHeaders] }];
  },
  async redirects() {
    // O currículo saiu do site em 2026-10-27 (decisão do Cleber): o site mostra quem ele é e como
    // trabalha, e o Sobre já conta a trajetória.
    return [{ source: "/curriculo", destination: "/sobre", permanent: true }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// Os posts em MDX são importados pelas rotas do diário; não viram páginas pelo sistema de arquivos.
const withMDX = createMDX();

export default withMDX(nextConfig);
