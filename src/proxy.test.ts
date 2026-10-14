// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/content/posts";
import { config, notFoundRewritePath, proxy } from "./proxy";

const request = (path: string) => new NextRequest(new URL(path, "http://localhost:3000"));

describe("proxy", () => {
  it.each(getAllPosts().map((post) => post.slug))("deixa passar o post existente %s", (slug) => {
    // Act
    const response = proxy(request(`/diario/${slug}`));

    // Assert
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("aceita o slug com caracteres codificados", () => {
    // Arrange
    const [post] = getAllPosts();
    const encoded = post.slug.replaceAll("-", "%2D");

    // Act
    const response = proxy(request(`/diario/${encoded}`));

    // Assert
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["nao-existe", "FASE-0-FUNDACAO", "%E0%A4%A", "..%2F..%2Fetc%2Fpasswd"])(
    "reescreve o slug desconhecido %s para a página 404",
    (slug) => {
      // Act
      const response = proxy(request(`/diario/${slug}`));

      // Assert
      expect(response.headers.get("x-middleware-rewrite")).toBe(
        `http://localhost:3000${notFoundRewritePath}`,
      );
    },
  );

  it("reescreve para 404 quando não há segmento de slug", () => {
    // Act
    const response = proxy(request("/diario"));

    // Assert
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      `http://localhost:3000${notFoundRewritePath}`,
    );
  });

  it("só intercepta a página do post", () => {
    // Assert
    expect(config.matcher).toBe("/diario/:slug");
  });
});
