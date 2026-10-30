import { describe, expect, it } from "vitest";
import type { Post } from "@/content/posts";
import { buildRobots, buildSitemap } from "./seo";

const post: Post = {
  slug: "um-post",
  title: "Um post",
  description: "Descrição",
  publishedAt: "2026-10-14",
  phase: 0,
  tags: [],
};

describe("buildRobots", () => {
  it("bloqueia rastreamento fora da produção", () => {
    // Act
    const robots = buildRobots({ url: new URL("http://localhost:3000"), indexable: false });

    // Assert
    expect(robots).toEqual({ rules: { userAgent: "*", disallow: "/" } });
  });

  it("libera rastreamento e aponta o sitemap em produção", () => {
    // Act
    const robots = buildRobots({ url: new URL("https://cleber.dev"), indexable: true });

    // Assert
    expect(robots.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(robots.sitemap).toBe("https://cleber.dev/sitemap.xml");
  });
});

describe("buildSitemap", () => {
  it("gera URLs absolutas para rotas fixas e posts", () => {
    // Act
    const sitemap = buildSitemap(new URL("https://cleber.dev"), ["/", "/sobre"], [post]);

    // Assert
    expect(sitemap.map((entry) => entry.url)).toEqual([
      "https://cleber.dev/",
      "https://cleber.dev/sobre",
      "https://cleber.dev/diario/um-post",
    ]);
  });

  it("usa a data de publicação como última modificação do post", () => {
    // Act
    const [entry] = buildSitemap(new URL("https://cleber.dev"), [], [post]);

    // Assert
    expect(entry.lastModified).toEqual(new Date("2026-10-14T00:00:00Z"));
  });
});

describe("buildSitemap com idiomas", () => {
  it("liga as versões em português e em inglês com hreflang", () => {
    // Act
    const [home, english, stack] = buildSitemap(
      new URL("https://cleber.dev"),
      ["/sobre", "/en/about", "/stack"],
      [],
    );

    // Assert
    const languages = {
      "pt-BR": "https://cleber.dev/sobre",
      en: "https://cleber.dev/en/about",
      "x-default": "https://cleber.dev/sobre",
    };
    expect(home.alternates).toEqual({ languages });
    expect(english.alternates).toEqual({ languages });
    expect(stack.alternates).toBeUndefined();
  });
});
