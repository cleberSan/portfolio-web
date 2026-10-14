import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getAllPosts } from "@/content/posts";
import DiarioPage, { metadata } from "./page";

describe("DiarioPage", () => {
  it("lista todos os posts do mais recente para o mais antigo", () => {
    // Act
    render(<DiarioPage />);

    // Assert
    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(getAllPosts().map((post) => post.title));
  });

  it("usa /diario como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/diario");
  });
});
