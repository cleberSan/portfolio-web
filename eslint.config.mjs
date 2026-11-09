import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // O three (≈150 KB comprimido) só pode entrar na cena 3D de /ecossistema, que é baixada por
  // import dinâmico. Importá-lo em outro lugar o levaria para o pacote de todas as páginas
  // (spec 0001, CA-11; ADR-0009).
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ecossistema/cena/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "three", message: "Use o three só em src/components/ecossistema/cena/." },
          ],
          patterns: [
            {
              group: ["three/*"],
              message: "Use o three só em src/components/ecossistema/cena/.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "test-results/**",
    "playwright-report/**",
    "blob-report/**",
  ]),
]);

export default eslintConfig;
