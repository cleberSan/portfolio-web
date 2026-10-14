import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import Home from "./page";

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
    const list = screen.getByRole("list");
    expect(list.querySelectorAll("li")).toHaveLength(site.focusAreas.length);
  });

  it("aponta para o repositório do CareFlow", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("link", { name: /careflow/i })).toHaveAttribute(
      "href",
      site.links.careflow,
    );
  });
});
