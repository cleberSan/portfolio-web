import { describe, expect, it } from "vitest";
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

const production = buildSecurityHeaders({ isDevelopment: false });

const headerValue = (key: string) => production.find((header) => header.key === key)?.value;

const directives = (csp: string) =>
  new Map(
    csp.split(";").map((directive) => {
      const [name, ...sources] = directive.trim().split(/\s+/);
      return [name, sources] as const;
    }),
  );

describe("buildSecurityHeaders", () => {
  it.each([
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
  ])("define o cabeçalho %s", (key) => {
    // Act
    const value = headerValue(key);

    // Assert
    expect(value).toBeTruthy();
  });

  it("não declara o mesmo cabeçalho duas vezes", () => {
    // Arrange
    const keys = production.map((header) => header.key.toLowerCase());

    // Act
    const unique = new Set(keys);

    // Assert
    expect(unique.size).toBe(keys.length);
  });

  it("impede que o site seja embutido em iframes de terceiros", () => {
    // Act
    const csp = directives(headerValue("Content-Security-Policy") ?? "");

    // Assert
    expect(csp.get("frame-ancestors")).toEqual(["'none'"]);
    expect(headerValue("X-Frame-Options")).toBe("DENY");
  });

  it("exige HSTS de pelo menos um ano", () => {
    // Arrange
    const hsts = headerValue("Strict-Transport-Security") ?? "";

    // Act
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);

    // Assert
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });
});

describe("buildContentSecurityPolicy", () => {
  it("não declara a mesma diretiva duas vezes", () => {
    // Arrange
    const csp = buildContentSecurityPolicy({ isDevelopment: false });

    // Act
    const names = csp.split(";").map((directive) => directive.trim().split(/\s+/)[0]);

    // Assert
    expect(new Set(names).size).toBe(names.length);
  });

  it("restringe todas as origens à própria origem por padrão", () => {
    // Act
    const csp = directives(buildContentSecurityPolicy({ isDevelopment: false }));

    // Assert
    expect(csp.get("default-src")).toEqual(["'self'"]);
    expect(csp.get("connect-src")).toEqual(["'self'"]);
    expect(csp.get("object-src")).toEqual(["'none'"]);
    expect(csp.get("base-uri")).toEqual(["'self'"]);
    expect(csp.get("form-action")).toEqual(["'self'"]);
  });

  it("bloqueia handlers inline em atributos", () => {
    // Act
    const csp = directives(buildContentSecurityPolicy({ isDevelopment: false }));

    // Assert
    expect(csp.get("script-src-attr")).toEqual(["'none'"]);
  });

  it("não permite eval em produção", () => {
    // Act
    const csp = directives(buildContentSecurityPolicy({ isDevelopment: false }));

    // Assert
    expect(csp.get("script-src")).not.toContain("'unsafe-eval'");
  });

  it("permite eval apenas em desenvolvimento", () => {
    // Act
    const csp = directives(buildContentSecurityPolicy({ isDevelopment: true }));

    // Assert
    expect(csp.get("script-src")).toContain("'unsafe-eval'");
  });

  it("não aceita scripts de outras origens", () => {
    // Act
    const sources = directives(buildContentSecurityPolicy({ isDevelopment: false })).get(
      "script-src",
    );

    // Assert
    expect(sources).toEqual(["'self'", "'unsafe-inline'"]);
  });
});
