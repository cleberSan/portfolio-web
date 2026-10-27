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

  // O site mostra quem ele é e como trabalha; não é currículo nem anúncio de busca de vaga.
  it("não fala em busca de vaga nem em público-alvo", () => {
    // Act
    const { container } = render(<SobrePage />);

    // Assert
    expect(container.textContent).not.toMatch(/vaga|oportunidade|Busco|Disponível/i);
    expect(screen.queryByRole("region", { name: "Para quem" })).not.toBeInTheDocument();
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
      alumniOf: [{ name: "UNINOVE" }],
    });
  });

  it("não declara empregador atual quando nenhum cargo está em aberto", () => {
    // Act
    const { container } = render(<SobrePage />);

    // Assert
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "{}")).not.toHaveProperty("worksFor");
  });

  it("aponta WhatsApp, telefone, LinkedIn e GitHub como contato", () => {
    // Act
    render(<SobrePage />);

    // Assert
    const section = screen.getByRole("region", { name: "Contato" });
    expect(within(section).getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute(
      "href",
      site.contact.whatsapp,
    );
    expect(within(section).getByRole("link", { name: /^Telefone/ })).toHaveAttribute(
      "href",
      site.contact.phoneHref,
    );
    expect(within(section).getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
      "href",
      site.links.linkedin,
    );
    expect(within(section).getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
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

  // Desde 2026-10-27 o Cleber autoriza publicar o telefone; e-mail e endereço continuam fora.
  it("publica só o telefone autorizado, sem e-mail nem endereço pessoal", () => {
    // Act
    const { container } = render(<SobrePage />);

    // Assert
    expect(container.textContent).not.toMatch(/@gmail|Rua /);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    const phones = [...container.querySelectorAll('a[href^="tel:"]')].map((link) =>
      link.getAttribute("href"),
    );
    expect(new Set(phones)).toEqual(new Set([site.contact.phoneHref]));
  });

  it("usa /sobre como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });
});
