import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type Case, getCases } from "@/content/cases";
import { CaseCard } from "./case-card";

const item: Case = {
  id: "exemplo",
  tag: "Pagamentos",
  context: "Empresa X",
  title: "Um problema difícil",
  problem: "O problema.",
  approach: "A abordagem.",
  result: "O resultado.",
  stack: [".NET", "RabbitMQ"],
  links: [
    { href: "/projetos/exemplo", label: "Ver o projeto" },
    { href: "https://example.com", label: "Abrir o site" },
  ],
};

describe("CaseCard", () => {
  it("nomeia o artigo pelo título e numera com dois dígitos", () => {
    // Act
    render(<CaseCard item={item} position={3} locale="pt-BR" />);

    // Assert
    expect(screen.getByRole("article", { name: item.title })).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("mostra problema, abordagem e resultado como termos e definições", () => {
    // Act
    render(<CaseCard item={item} position={1} locale="pt-BR" />);

    // Assert
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Problema",
      "Abordagem",
      "Resultado",
    ]);
    expect(screen.getAllByRole("definition").map((definition) => definition.textContent)).toEqual([
      item.problem,
      item.approach,
      item.result,
    ]);
  });

  it("lista a stack e escolhe o link certo para cada destino", () => {
    // Act
    render(<CaseCard item={item} position={1} locale="pt-BR" />);

    // Assert
    expect(screen.getByRole("list", { name: `Stack: ${item.title}` }).children).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Ver o projeto" })).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: /^Abrir o site/ })).toHaveAttribute("target", "_blank");
  });

  it("não mostra área de links quando o case não tem nenhum", () => {
    // Act
    render(<CaseCard item={{ ...item, links: undefined }} position={1} locale="pt-BR" />);

    // Assert
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

describe("CaseCard em inglês", () => {
  it("usa rótulos em inglês e avisa o idioma do destino dos links", () => {
    // Arrange
    const careflowCase = getCases("en").find((entry) => entry.id === "careflow");
    if (!careflowCase) throw new Error("case do CareFlow ausente");

    // Act
    render(<CaseCard item={careflowCase} position={1} locale="en" />);

    // Assert
    expect(screen.getByText("Problem")).toBeInTheDocument();
    expect(screen.getByText("Approach")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Architecture and roadmap (in Portuguese)" });
    expect(link).toHaveAttribute("href", "/projetos/careflow");
    expect(link).toHaveAttribute("hreflang", "pt-BR");
  });
});
