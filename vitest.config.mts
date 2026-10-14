import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // Os testes E2E (e2e/*.spec.ts) rodam no Playwright, não no Vitest.
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        // Depende de next/font, que só existe no build do Next.js.
        "src/app/layout.tsx",
        // Componente assíncrono com import dinâmico de MDX e rotas de imagem do next/og:
        // cobertos pelos testes E2E (ver ADR-0001).
        "src/app/diario/[[]slug]/page.tsx",
        "src/app/**/opengraph-image.tsx",
      ],
      reporter: ["text", "lcov", "cobertura"],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
});
