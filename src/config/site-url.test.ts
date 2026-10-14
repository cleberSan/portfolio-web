import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl sem configuração", () => {
  it.each([undefined, "", "   "])("usa localhost e bloqueia indexação para %j", (raw) => {
    // Act
    const result = resolveSiteUrl({ SITE_URL: raw });

    // Assert
    expect(result.url.href).toBe("http://localhost:3000/");
    expect(result.indexable).toBe(false);
  });
});

describe("resolveSiteUrl com SITE_URL", () => {
  it("aceita uma origem https e libera indexação fora da Vercel", () => {
    // Act
    const result = resolveSiteUrl({ SITE_URL: "https://cleber.dev" });

    // Assert
    expect(result.url.origin).toBe("https://cleber.dev");
    expect(result.indexable).toBe(true);
  });

  it("ignora espaços nas pontas", () => {
    // Act
    const result = resolveSiteUrl({ SITE_URL: "  https://cleber.dev/  " });

    // Assert
    expect(result.url.origin).toBe("https://cleber.dev");
  });

  it("tem prioridade sobre o domínio detectado na Vercel", () => {
    // Act
    const result = resolveSiteUrl({
      SITE_URL: "https://cleber.dev",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio-web.vercel.app",
    });

    // Assert
    expect(result.url.origin).toBe("https://cleber.dev");
    expect(result.indexable).toBe(true);
  });

  it.each(["preview", "development"])(
    "não libera indexação num ambiente %s da Vercel",
    (vercelEnv) => {
      // Act
      const result = resolveSiteUrl({ SITE_URL: "https://cleber.dev", VERCEL_ENV: vercelEnv });

      // Assert
      expect(result.url.origin).toBe("https://cleber.dev");
      expect(result.indexable).toBe(false);
    },
  );

  it.each(["http://localhost:3000", "http://127.0.0.1:3100"])(
    "aceita http apenas em loopback: %s",
    (raw) => {
      // Act
      const result = resolveSiteUrl({ SITE_URL: raw });

      // Assert
      expect(result.url.protocol).toBe("http:");
    },
  );

  it.each(["http://cleber.dev", "ftp://cleber.dev", "javascript:alert(1)"])(
    "recusa protocolo inseguro: %s",
    (raw) => {
      // Act
      const act = () => resolveSiteUrl({ SITE_URL: raw });

      // Assert
      expect(act).toThrow("SITE_URL deve usar https (http só é aceito para localhost).");
    },
  );

  it("recusa texto que não é URL", () => {
    // Act
    const act = () => resolveSiteUrl({ SITE_URL: "cleber.dev" });

    // Assert
    expect(act).toThrow("SITE_URL não é uma URL válida.");
  });

  it.each([
    "https://cleber.dev/blog",
    "https://cleber.dev/?utm=x",
    "https://cleber.dev/#topo",
    "https://admin:segredo@cleber.dev",
  ])("recusa valores além da origem: %s", (raw) => {
    // Act
    const act = () => resolveSiteUrl({ SITE_URL: raw });

    // Assert
    expect(act).toThrow(/apenas a origem/);
  });

  it("não repete o valor recebido na mensagem de erro", () => {
    // Act
    const act = () => resolveSiteUrl({ SITE_URL: "https://admin:segredo@cleber.dev" });

    // Assert
    expect(act).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("segredo") }),
    );
  });
});

describe("resolveSiteUrl na Vercel sem SITE_URL", () => {
  it("usa o domínio de produção do projeto com https e libera indexação em produção", () => {
    // Act
    const result = resolveSiteUrl({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio-web.vercel.app",
    });

    // Assert
    expect(result.url.href).toBe("https://portfolio-web.vercel.app/");
    expect(result.indexable).toBe(true);
  });

  it.each(["preview", "development", undefined])(
    "aponta canônicas para produção, mas bloqueia indexação com VERCEL_ENV=%s",
    (vercelEnv) => {
      // Act
      const result = resolveSiteUrl({
        VERCEL_ENV: vercelEnv,
        VERCEL_PROJECT_PRODUCTION_URL: "portfolio-web.vercel.app",
      });

      // Assert
      expect(result.url.origin).toBe("https://portfolio-web.vercel.app");
      expect(result.indexable).toBe(false);
    },
  );

  it.each(["portfolio-web.vercel.app/blog", "admin:segredo@portfolio-web.vercel.app"])(
    "recusa domínio de produção malformado: %s",
    (host) => {
      // Act
      const act = () =>
        resolveSiteUrl({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: host });

      // Assert
      expect(act).toThrow(/VERCEL_PROJECT_PRODUCTION_URL deve conter apenas a origem/);
    },
  );
});
