import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import SobrePage, { metadata } from "./page";

describe("SobrePage", () => {
  it("tem um único h1", () => {
    // Act
    render(<SobrePage />);

    // Assert
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("descreve as práticas de trabalho", () => {
    // Act
    render(<SobrePage />);

    // Assert
    expect(screen.getByText("Arquitetura orientada a domínio")).toBeInTheDocument();
    expect(screen.getByText(/OpenTelemetry e Serilog/)).toBeInTheDocument();
  });

  it("cita os setores atendidos em lista natural", () => {
    // Act
    render(<SobrePage />);

    // Assert
    expect(
      screen.getByText(
        /pagamentos digitais, fundos de investimento, saúde, previdência e educação/,
      ),
    ).toBeInTheDocument();
  });

  it("publica dados estruturados de pessoa", () => {
    // Act
    const { container } = render(<SobrePage />);

    // Assert
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "{}")).toMatchObject({
      "@type": "Person",
      name: site.name,
      sameAs: [site.links.github],
    });
  });

  it("aponta o GitHub como contato", () => {
    // Act
    render(<SobrePage />);

    // Assert
    expect(screen.getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
      "href",
      site.links.github,
    );
  });

  it("usa /sobre como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });
});
