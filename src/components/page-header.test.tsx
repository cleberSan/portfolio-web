import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renderiza o título como h1 com chamada e texto de apoio", () => {
    // Act
    render(
      <PageHeader title="Sobre" eyebrow="Quem sou">
        Texto de apoio
      </PageHeader>,
    );

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: "Sobre" })).toBeInTheDocument();
    expect(screen.getByText("Quem sou")).toBeInTheDocument();
    expect(screen.getByText("Texto de apoio")).toBeInTheDocument();
  });

  it("omite chamada e texto de apoio quando ausentes", () => {
    // Act
    const { container } = render(<PageHeader title="Stack" />);

    // Assert
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.querySelector("div")).toBeNull();
  });
});
