import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/config/site";
import { homePath, languageAlternates, localizedPath, translatedRoutes } from "./routes";

describe("localizedPath", () => {
  it.each([
    ["/", "en", "/en"],
    ["/sobre", "en", "/en/about"],
    ["/en", "pt-BR", "/"],
    ["/en/about", "pt-BR", "/sobre"],
    ["/sobre", "pt-BR", "/sobre"],
  ] as const)("leva %s para %s em %s", (pathname, target, expected) => {
    // Act
    const path = localizedPath(pathname, target);

    // Assert
    expect(path).toBe(expected);
  });

  it.each(["/diario", "/diario/fase-0-fundacao", "/projetos/careflow", "/_not-found"])(
    "leva %s, que só existe em português, para a home em inglês",
    (pathname) => {
      // Act
      const path = localizedPath(pathname, "en");

      // Assert
      expect(path).toBe("/en");
    },
  );

  it("sem rota conhecida, leva para a home do idioma", () => {
    // Assert
    expect(localizedPath(undefined, "en")).toBe(homePath.en);
    expect(localizedPath(undefined, "pt-BR")).toBe(homePath["pt-BR"]);
  });
});

describe("languageAlternates", () => {
  it("dá as duas versões e o português como x-default", () => {
    // Act
    const alternates = languageAlternates("/en/about");

    // Assert
    expect(alternates).toEqual({ "pt-BR": "/sobre", en: "/en/about", "x-default": "/sobre" });
  });

  it("não inventa alternativa para página só em português", () => {
    // Assert
    expect(languageAlternates("/stack")).toBeUndefined();
  });
});

describe("translatedRoutes", () => {
  it("só aponta para rotas publicadas, com o inglês abaixo de /en", () => {
    // Assert
    for (const route of translatedRoutes) {
      expect(staticRoutes).toContain(route["pt-BR"]);
      expect(staticRoutes).toContain(route.en);
      expect(route.en).toMatch(/^\/en(\/|$)/);
      expect(route["pt-BR"]).not.toMatch(/^\/en(\/|$)/);
    }
  });
});
