import { existsSync } from "node:fs";
import { join } from "node:path";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { careflow, careflowPhases, careflowVideo } from "@/content/careflow";
import { lojinha } from "@/content/lojinha";
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

  it("lista a Lojinha Da Lua como projeto no ar", () => {
    // Act
    render(<ProjetosPage />);

    // Assert
    expect(screen.getByRole("link", { name: lojinha.name })).toHaveAttribute(
      "href",
      "/projetos/lojinha-da-lua",
    );
    expect(screen.getByText(`No ar · ${lojinha.stack}`)).toBeInTheDocument();
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

  it("destaca a demonstração e o código no topo da página", () => {
    // Act
    render(<CareFlowPage />);

    // Assert
    const demo = screen.getByRole("link", { name: "Ver demonstração" });
    const code = screen.getByRole("link", { name: /^Ver código/ });
    expect(demo).toHaveAttribute("href", "/projetos/careflow/painel");
    expect(code).toHaveAttribute("href", careflow.repository);
    expect(code).toHaveAttribute("target", "_blank");
    const roadmap = screen.getByRole("region", { name: "Roadmap" });
    expect(demo.compareDocumentPosition(roadmap) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("mostra o vídeo do fluxo sem tocar sozinho, com capa e as cenas como descrição", () => {
    // Act
    const { container } = render(<CareFlowPage />);

    // Assert
    const section = screen.getByRole("region", { name: "O fluxo em um minuto" });
    const video = container.querySelector("video");
    expect(video).not.toBeNull();
    expect(section).toContainElement(video);
    expect(video).toHaveAttribute("controls");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("poster", careflowVideo.poster);
    const sources = [...(video?.querySelectorAll("source") ?? [])].map((source) => [
      source.getAttribute("src"),
      source.getAttribute("type"),
    ]);
    expect(sources).toEqual(careflowVideo.sources.map((source) => [source.src, source.type]));
    const scenes = within(section).getAllByRole("listitem");
    expect(scenes).toHaveLength(careflowVideo.scenes.length);
    expect(video).toHaveAttribute("aria-describedby", scenes[0].parentElement?.id);
    expect(section).toHaveTextContent(/tela do celular é ilustrativa/);
  });

  it.each([
    ...careflowVideo.sources.map((source) => source.src),
    careflowVideo.download,
    careflowVideo.poster,
  ])("serve %s a partir de public/", (path) => {
    // Assert
    expect(existsSync(join(process.cwd(), "public", path))).toBe(true);
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

    // Assert: o nome também aparece na topologia, então a busca fica na lista de serviços.
    const terms = screen.getAllByRole("term").map((term) => term.textContent ?? "");
    for (const service of careflow.services) {
      expect(terms).toContain(`${service.name}${service.signal}`);
      expect(screen.getByText(service.description)).toBeInTheDocument();
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
