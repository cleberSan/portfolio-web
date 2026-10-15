import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { careflow, careflowPhases } from "@/content/careflow";
import CareFlowPage, { metadata as careflowMetadata } from "./careflow/page";
import ProjetosPage, { metadata } from "./page";

describe("ProjetosPage", () => {
  it("lista o CareFlow com o progresso do roadmap", () => {
    // Arrange
    const done = careflowPhases.filter((phase) => phase.status === "concluida").length;

    // Act
    render(<ProjetosPage />);

    // Assert
    expect(screen.getByRole("link", { name: careflow.name })).toHaveAttribute(
      "href",
      "/projetos/careflow",
    );
    expect(
      screen.getByText(`${done} de ${careflowPhases.length} fases concluídas`),
    ).toBeInTheDocument();
  });

  it("usa /projetos como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/projetos");
  });
});

describe("CareFlowPage", () => {
  it("avisa que é uma demonstração com dados sintéticos", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    expect(screen.getByRole("note")).toHaveTextContent(/dados sintéticos/);
  });

  it("mostra todas as fases do roadmap em ordem com o status", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    const roadmap = screen.getByRole("region", { name: "Roadmap" });
    const items = within(roadmap).getAllByRole("listitem");
    expect(items).toHaveLength(careflowPhases.length);
    expect(items[0]).toHaveTextContent("Fase 0");
    expect(items[0]).toHaveTextContent("Concluída");
    expect(items.at(-1)).toHaveTextContent("Planejada");
  });

  it("liga as fases com post ao diário", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    expect(screen.getByRole("link", { name: "Ler o post da fase 2" })).toHaveAttribute(
      "href",
      "/diario/fase-2-agenda-sem-dupla-reserva",
    );
    expect(screen.getByRole("link", { name: "Ler o post da fase 3" })).toHaveAttribute(
      "href",
      "/diario/fase-3-cofre-do-paciente",
    );
    expect(screen.getByRole("link", { name: "Ler o post da fase 4" })).toHaveAttribute(
      "href",
      "/diario/fase-4-consentimento-e-auditoria",
    );
  });

  it("descreve cada serviço da arquitetura", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    for (const service of careflow.services) {
      expect(screen.getByText(service.name)).toBeInTheDocument();
    }
  });

  it("aponta para o repositório e para os ADRs", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    expect(screen.getByRole("link", { name: /^Repositório no GitHub/ })).toHaveAttribute(
      "href",
      careflow.repository,
    );
    expect(screen.getByRole("link", { name: /^Decisões de arquitetura/ })).toHaveAttribute(
      "href",
      careflow.adrs,
    );
  });

  it("usa /projetos/careflow como URL canônica", () => {
    // Assert
    expect(careflowMetadata.alternates?.canonical).toBe("/projetos/careflow");
  });
});
