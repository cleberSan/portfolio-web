import { afterEach, describe, expect, it, vi } from "vitest";
import { staticRoutes } from "@/config/site";
import type { SiteUrlEnv } from "@/config/site-url";
import { getAllPosts } from "@/content/posts";

// `siteUrl` é lido na carga do módulo, então cada teste recarrega as rotas com o ambiente desejado.
// Variáveis não informadas ficam vazias para o resultado não depender da máquina que roda o teste.
async function loadRoutes(env: SiteUrlEnv) {
  vi.resetModules();
  vi.stubEnv("SITE_URL", env.SITE_URL ?? "");
  vi.stubEnv("VERCEL_ENV", env.VERCEL_ENV ?? "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", env.VERCEL_PROJECT_PRODUCTION_URL ?? "");
  const [{ default: robots }, { default: sitemap }] = await Promise.all([
    import("./robots"),
    import("./sitemap"),
  ]);
  return { robots, sitemap };
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt", () => {
  it("bloqueia rastreamento sem endereço público, como no CI", async () => {
    // Arrange
    const { robots } = await loadRoutes({});

    // Act
    const result = robots();

    // Assert
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("libera rastreamento com SITE_URL configurada", async () => {
    // Arrange
    const { robots } = await loadRoutes({ SITE_URL: "https://cleber.dev" });

    // Act
    const result = robots();

    // Assert
    expect(result.sitemap).toBe("https://cleber.dev/sitemap.xml");
  });

  it("libera rastreamento na produção da Vercel sem nenhuma variável manual", async () => {
    // Arrange
    const { robots } = await loadRoutes({
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio-web.vercel.app",
    });

    // Act
    const result = robots();

    // Assert
    expect(result.sitemap).toBe("https://portfolio-web.vercel.app/sitemap.xml");
  });

  it("bloqueia rastreamento num preview da Vercel", async () => {
    // Arrange
    const { robots } = await loadRoutes({
      VERCEL_ENV: "preview",
      VERCEL_PROJECT_PRODUCTION_URL: "portfolio-web.vercel.app",
    });

    // Act
    const result = robots();

    // Assert
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
  });
});

describe("sitemap.xml", () => {
  it("inclui todas as rotas fixas e todos os posts na origem configurada", async () => {
    // Arrange
    const { sitemap } = await loadRoutes({ SITE_URL: "https://cleber.dev" });

    // Act
    const result = sitemap();

    // Assert
    expect(result).toHaveLength(staticRoutes.length + getAllPosts().length);
    expect(result.every((entry) => entry.url.startsWith("https://cleber.dev/"))).toBe(true);
  });
});
