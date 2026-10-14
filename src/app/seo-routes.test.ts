import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { staticRoutes } from "@/config/site";
import { getAllPosts } from "@/content/posts";

// `siteUrl` é lido na carga do módulo, então cada teste recarrega as rotas com o ambiente desejado.
async function loadRoutes(siteUrl: string) {
  vi.resetModules();
  vi.stubEnv("SITE_URL", siteUrl);
  const [{ default: robots }, { default: sitemap }] = await Promise.all([
    import("./robots"),
    import("./sitemap"),
  ]);
  return { robots, sitemap };
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("robots.txt", () => {
  it("bloqueia rastreamento sem SITE_URL, como no CI", async () => {
    // Arrange
    const { robots } = await loadRoutes("");

    // Act
    const result = robots();

    // Assert
    expect(result.rules).toEqual({ userAgent: "*", disallow: "/" });
  });

  it("libera rastreamento com SITE_URL configurada", async () => {
    // Arrange
    const { robots } = await loadRoutes("https://cleber.dev");

    // Act
    const result = robots();

    // Assert
    expect(result.sitemap).toBe("https://cleber.dev/sitemap.xml");
  });
});

describe("sitemap.xml", () => {
  it("inclui todas as rotas fixas e todos os posts na origem configurada", async () => {
    // Arrange
    const { sitemap } = await loadRoutes("https://cleber.dev");

    // Act
    const result = sitemap();

    // Assert
    expect(result).toHaveLength(staticRoutes.length + getAllPosts().length);
    expect(result.every((entry) => entry.url.startsWith("https://cleber.dev/"))).toBe(true);
  });
});
