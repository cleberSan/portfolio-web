import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { getLatestPosts } from "@/content/posts";
import Home, { metadata } from "./page";

describe("Home", () => {
  it("apresenta nome e papel", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: site.name })).toBeInTheDocument();
    expect(screen.getByText(site.role)).toBeInTheDocument();
  });

  it("lista todas as áreas de foco", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Foco" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(site.focusAreas.length);
  });

  it("leva ao projeto CareFlow e ao diário", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("link", { name: "Conhecer o CareFlow" })).toHaveAttribute(
      "href",
      "/projetos/careflow",
    );
    expect(screen.getByRole("link", { name: "Ler o diário de bordo" })).toHaveAttribute(
      "href",
      "/diario",
    );
  });

  it("mostra os posts mais recentes do diário", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Diário de bordo" });
    for (const post of getLatestPosts(2)) {
      expect(within(section).getByRole("heading", { level: 3, name: post.title })).toBeVisible();
    }
  });

  it("lista os setores atendidos", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Para quem eu trabalho" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(site.sectors.length);
  });

  it("usa a home como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/");
  });
});
