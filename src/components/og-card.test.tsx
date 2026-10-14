import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { OgCard, ogSize } from "./og-card";

describe("OgCard", () => {
  it("mostra chamada, título, subtítulo e assinatura", () => {
    // Act
    render(<OgCard eyebrow="Diário de bordo" title="Título" subtitle="Subtítulo" />);

    // Assert
    expect(screen.getByText("DIÁRIO DE BORDO")).toBeInTheDocument();
    expect(screen.getByText("Título")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo")).toBeInTheDocument();
    expect(screen.getByText(`${site.name} · ${site.role}`)).toBeInTheDocument();
  });

  it("usa o tamanho recomendado para Open Graph", () => {
    // Assert
    expect(ogSize).toEqual({ width: 1200, height: 630 });
  });
});
