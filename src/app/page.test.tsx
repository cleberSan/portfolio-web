import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { careflow, careflowPhases } from "@/content/careflow";
import { careerYears, currentExperience, profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
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

  it("mostra os cargos mais recentes, com o atual primeiro", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Trajetória" });
    const roles = within(section).getAllByRole("heading", { level: 3 });
    expect(roles).toHaveLength(4);
    expect(roles[0]).toHaveTextContent(profile.experiences[0].company);
    expect(
      within(section).getByRole("link", { name: "Ver a trajetória completa" }),
    ).toHaveAttribute("href", "/sobre#experiencia");
  });

  it("resume as competências por grupo da stack", () => {
    // Act
    render(<Home />);

    // Assert
    const section = screen.getByRole("region", { name: "Competências" });
    for (const group of stackGroups) {
      const list = within(section).getByRole("list", { name: group.title });
      expect(within(list).getAllByRole("listitem")).toHaveLength(group.items.length);
    }
  });

  it("leva à trajetória, ao Painel, ao projeto CareFlow e ao diário", () => {
    // Act
    render(<Home />);

    // Assert
    expect(screen.getByRole("link", { name: "Conhecer minha trajetória" })).toHaveAttribute(
      "href",
      "/sobre",
    );
    expect(screen.getByRole("link", { name: "Abrir o Painel do CareFlow" })).toHaveAttribute(
      "href",
      "/projetos/careflow/painel",
    );
    expect(screen.getByRole("link", { name: "Ver arquitetura e roadmap" })).toHaveAttribute(
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

  it("mostra o cargo atual", () => {
    // Act
    render(<Home />);

    // Assert
    expect(
      screen.getByText(new RegExp(`^Agora: .* na ${currentExperience?.company}`)),
    ).toBeInTheDocument();
  });

  it("usa a home como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/");
  });
});
