import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Post } from "@/content/posts";
import { PostList } from "./post-list";

const post: Post = {
  slug: "exemplo",
  title: "Um post de exemplo",
  description: "Descrição do post de exemplo usada apenas neste teste de componente.",
  publishedAt: "2026-10-14",
  phase: 2,
  tags: ["PostgreSQL", "Concorrência"],
};

describe("PostList", () => {
  it("mostra título com link, data legível e fase", () => {
    // Act
    render(<PostList posts={[post]} />);

    // Assert
    expect(screen.getByRole("link", { name: post.title })).toHaveAttribute(
      "href",
      "/diario/exemplo",
    );
    expect(screen.getByText("14 de outubro de 2026").tagName).toBe("TIME");
    expect(screen.getByText("14 de outubro de 2026")).toHaveAttribute("datetime", "2026-10-14");
    expect(screen.getByText(/Fase/)).toHaveTextContent("Fase 2");
  });

  it("lista as tags do post", () => {
    // Act
    render(<PostList posts={[post]} />);

    // Assert
    const tags = screen.getByRole("list", { name: `Tags de ${post.title}` });
    expect(within(tags).getAllByRole("listitem")).toHaveLength(2);
  });

  it.each([2, 3] as const)("usa título de nível %i", (level) => {
    // Act
    render(<PostList posts={[post]} headingLevel={level} />);

    // Assert
    expect(screen.getByRole("heading", { level, name: post.title })).toBeInTheDocument();
  });

  it("avisa quando não há posts", () => {
    // Act
    render(<PostList posts={[]} />);

    // Assert
    expect(screen.getByText("Nenhum post publicado ainda.")).toBeInTheDocument();
  });
});
