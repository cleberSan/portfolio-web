import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import { demoBackend } from "./src/config/demo-backend";
import { buildSecurityHeaders } from "./src/config/security-headers";

const nextConfig: NextConfig = {
  cacheComponents: true,
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
