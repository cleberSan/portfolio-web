import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { careflow, careflowPhases } from "@/content/careflow";
import { cases } from "@/content/cases";
import { principles, services } from "@/content/engineering";
import { careerYears, profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import { getLatestPosts } from "@/content/posts";
import Home, { metadata } from "./page";

describe("Home", () => {
  it("apresenta nome, papel e cidade", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: site.name })).toBeInTheDocument();
    expect(screen.getByText(`${site.role}.`)).toBeInTheDocument();
    expect(screen.getByText(`Portfólio · ${profile.location}`)).toBeInTheDocument();
  });

  // Pedido do Cleber (2026-10-27): o site mostra quem ele é e como trabalha, não é currículo.
  it("não fala em busca de vaga, disponibilidade nem currículo", () => {
    // Act
    const { container } = render(<Home />);

    // Assert
    expect(container.textContent).not.toMatch(/vaga|oportunidade|Busco|Disponível|currículo/i);
    expect(container.querySelector('a[href="/curriculo"]')).toBeNull();
    expect(screen.queryByText("agora")).not.toBeInTheDocument();
  });

  it("chama para os cases, o jeito de trabalhar e o WhatsApp", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("link", { name: "Ver os cases" })).toHaveAttribute("href", "#cases");
    expect(screen.getByRole("link", { name: "Como eu trabalho" })).toHaveAttribute(
      "href",
      "#sobre",
    );
    expect(screen.getByRole("link", { name: /^Falar no WhatsApp/ })).toHaveAttribute(
      "href",
      site.contact.whatsapp,
    );
  });

  it("organiza a página nas seções numeradas do menu", () => {
    // Act
    const { container } = render(<Home />);

    // Assert
    const ids = [...container.querySelectorAll("section[id]")].map((section) => section.id);
    expect(ids).toEqual([
      "cases",
      "atuacao",
      "sobre",
      "habilidades",
      "trajetoria",
      "diario",
      "contato",
    ]);
  });

  it("mostra cada case com problema, abordagem e resultado", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Problemas reais que resolvi" });
    const articles = within(section).getAllByRole("article");
    expect(articles).toHaveLength(cases.length);
    for (const article of articles) {
      expect(within(article).getByText("Problema")).toBeInTheDocument();
      expect(within(article).getByText("Abordagem")).toBeInTheDocument();
      expect(within(article).getByText("Resultado")).toBeInTheDocument();
    }
  });

  it("leva dos cases ao CareFlow, ao Painel e à Lojinha", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Problemas reais que resolvi" });
    expect(
      within(section).getByRole("link", { name: "Ver arquitetura e roadmap" }),
    ).toHaveAttribute("href", "/projetos/careflow");
    expect(
      within(section).getByRole("link", { name: "Abrir o Painel do CareFlow" }),
    ).toHaveAttribute("href", "/projetos/careflow/painel");
    expect(
      within(section).getByRole("link", { name: "Ver o estudo de caso da Lojinha" }),
    ).toHaveAttribute("href", "/projetos/lojinha-da-lua");
  });

  it("lista os serviços e os princípios de trabalho", () => {
    // Act
    render(<Home />);

    // Assert
    const atuacao = screen.getByRole("region", { name: "Com o que eu trabalho" });
    expect(within(atuacao).getAllByRole("heading", { level: 3 })).toHaveLength(services.length);
    const sobre = screen.getByRole("region", { name: "Quem sou" });
    const list = within(sobre).getByRole("list", { name: "Princípios" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(principles.length);
  });

  it("mostra a IA no ciclo de engenharia com os portões do CI", () => {
    // Act
    render(<Home />);

    // Assert
    const sobre = screen.getByRole("region", { name: "Quem sou" });
    expect(within(sobre).getByText("Pipeline deste site")).toBeInTheDocument();
    expect(within(sobre).getByRole("list", { name: "Portões do CI" })).toBeInTheDocument();
  });

  it("resume as competências por grupo, com a contagem de cada um", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Stack e competências" });
    for (const group of stackGroups) {
      const list = within(section).getByRole("list", { name: group.title });
      expect(within(list).getAllByRole("listitem")).toHaveLength(group.items.length);
      expect(within(section).getAllByText(`${group.items.length} itens`).length).toBeGreaterThan(0);
    }
  });

  it("conta a trajetória inteira, com destaques que abrem sem JavaScript", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Experiência e formação" });
    const roles = within(section)
      .getAllByRole("heading", { level: 3 })
      .filter((heading) => heading.textContent?.includes("·"));
    expect(roles).toHaveLength(profile.experiences.length);
    expect(section.querySelectorAll("details")).toHaveLength(profile.experiences.length);
    expect(within(section).getByText(profile.education[0].course)).toBeInTheDocument();
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

  it("fecha com o contato: WhatsApp, telefone, LinkedIn e GitHub", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Vamos conversar" });
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
  });

  it("não publica e-mail nem endereço pessoal", () => {
    // Act
    const { container } = render(<Home />);

    // Assert
    expect(container.textContent).not.toMatch(/@gmail|Rua /);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("mostra a topologia do CareFlow com todos os serviços", () => {
    // Act
    render(<Home />);

    // Assert
    const topology = screen.getByRole("img", { name: /Topologia do CareFlow/ });
    for (const service of careflow.services) {
      expect(within(topology).getByText(service.name)).toBeInTheDocument();
    }
  });

  it("deriva os indicadores do perfil e do CareFlow", () => {
    // Arrange
    const done = careflowPhases.filter((phase) => phase.status === "concluida").length;

    // Act
    render(<Home />);

    // Assert
    expect(screen.getByText(`${careerYears()} anos`)).toBeInTheDocument();
    expect(screen.getByText(String(profile.experiences.length))).toBeInTheDocument();
    expect(screen.getByText(String(done))).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "fases do CareFlow entregues em público" }),
    ).toHaveAttribute("href", "/projetos/careflow");
  });

  it("lista as empresas da trajetória", () => {
    // Act
    render(<Home />);

    // Assert
    const list = screen.getByRole("list", { name: "Onde já construí software" });
    expect(
      within(list)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(profile.experiences.map((experience) => experience.company));
  });

  it("usa a home como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/");
  });
});
