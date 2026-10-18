import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { profile } from "@/content/profile";
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
    const section = screen.getByRole("region", { name: "Para quem" });
    expect(
      within(section).getByText(
        /pagamentos digitais, fundos de investimento, gestão de estacionamentos, saúde, previdência e educação/,
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
      sameAs: [site.links.linkedin, site.links.github],
      worksFor: { name: profile.experiences[0].company },
      alumniOf: [{ name: "UNINOVE" }],
    });
  });

  it("aponta o LinkedIn e o GitHub como contato", () => {
    // Act
    render(<SobrePage />);

    // Assert
    expect(screen.getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
      "href",
      site.links.linkedin,
    );
    expect(screen.getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
      "href",
      site.links.github,
    );
  });

  it("conta a trajetória inteira, do cargo atual ao primeiro", () => {
    // Act
    render(<SobrePage />);

    // Assert
    const section = screen.getByRole("region", { name: "Experiência" });
    const roles = within(section).getAllByRole("heading", { level: 3 });
    expect(roles).toHaveLength(profile.experiences.length);
    expect(roles.at(-1)).toHaveTextContent(profile.experiences.at(-1)?.company ?? "");
  });

  it("mostra formação, certificações e idiomas", () => {
    // Act
    render(<SobrePage />);

    // Assert
    const section = screen.getByRole("region", { name: "Formação e certificações" });
    expect(within(section).getByText(profile.education[0].course)).toBeInTheDocument();
    for (const certification of profile.certifications) {
      expect(within(section).getByText(certification)).toBeInTheDocument();
    }
    expect(within(section).getByText("Profissional limitado")).toBeInTheDocument();
  });

  it("não publica telefone, endereço nem e-mail pessoal", () => {
    // Act
    const { container } = render(<SobrePage />);

    // Assert
    expect(container.textContent).not.toMatch(/@gmail|\(?\d{2}\)?\s?9\d{4}-?\d{4}|Rua /);
    expect(container.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
  });

  it("usa /sobre como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });
});
