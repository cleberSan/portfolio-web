import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseIsoDate } from "@/lib/format-date";
import { getAllPosts, getLatestPosts, getPostBySlug } from "./posts";

const posts = getAllPosts();

describe("registro de posts", () => {
  it("tem pelo menos um post, exigência do generateStaticParams com Cache Components", () => {
    // Assert
    expect(posts.length).toBeGreaterThan(0);
  });

  it("não repete slugs", () => {
    // Arrange
    const slugs = posts.map((post) => post.slug);

    // Act
    const unique = new Set(slugs);

    // Assert
    expect(unique.size).toBe(slugs.length);
  });

  it.each(posts)("$slug tem slug seguro para URL e nome de arquivo", ({ slug }) => {
    // Assert
    expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it.each(posts)("$slug tem um arquivo MDX correspondente", ({ slug }) => {
    // Arrange
    const file = join(process.cwd(), "src", "content", "diario", `${slug}.mdx`);

    // Act
    const exists = existsSync(file);

    // Assert
    expect(exists).toBe(true);
  });

  it.each(posts)("$slug tem data válida, título e descrição", (post) => {
    // Act
    const act = () => parseIsoDate(post.publishedAt);

    // Assert
    expect(act).not.toThrow();
    expect(post.title.trim()).not.toBe("");
    expect(post.description.length).toBeGreaterThanOrEqual(50);
    expect(post.description.length).toBeLessThanOrEqual(200);
  });
});

describe("getAllPosts", () => {
  it("ordena do mais recente para o mais antigo e, no mesmo dia, pela fase mais avançada", () => {
    // Act
    const keys = posts.map((post) => `${post.publishedAt}#${String(post.phase).padStart(2, "0")}`);

    // Assert
    expect(keys).toEqual([...keys].sort().reverse());
  });

  it("devolve uma cópia que não altera o registro", () => {
    // Arrange
    const copy = getAllPosts() as unknown as unknown[];

    // Act
    copy.pop();

    // Assert
    expect(getAllPosts()).toHaveLength(posts.length);
  });
});

describe("getPostBySlug", () => {
  it("encontra um post existente", () => {
    // Arrange
    const [first] = posts;

    // Act
    const post = getPostBySlug(first.slug);

    // Assert
    expect(post).toBe(first);
  });

  it.each(["inexistente", "../../etc/passwd", "FASE-0-FUNDACAO", ""])(
    "não encontra slug desconhecido: %j",
    (slug) => {
      // Act
      const post = getPostBySlug(slug);

      // Assert
      expect(post).toBeUndefined();
    },
  );
});

describe("getLatestPosts", () => {
  it("limita a quantidade pedida", () => {
    // Act
    const latest = getLatestPosts(1);

    // Assert
    expect(latest).toEqual(posts.slice(0, 1));
  });

  it("trata quantidade negativa como zero", () => {
    // Act
    const latest = getLatestPosts(-1);

    // Assert
    expect(latest).toEqual([]);
  });
});
