import { describe, expect, it } from "vitest";
import { careflow, careflowPhases } from "./careflow";
import { cases, getCases } from "./cases";
import { lojinha } from "./lojinha";
import { portugueseLeftovers } from "@/test-utils/portuguese";

describe("cases", () => {
  it("não repete ids, usados como âncoras dos títulos", () => {
    // Arrange
    const ids = cases.map((item) => item.id);

    // Assert
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cases)("$id preenche problema, abordagem, resultado e stack", (item) => {
    // Assert
    expect(item.problem.length).toBeGreaterThan(40);
    expect(item.approach.length).toBeGreaterThan(40);
    expect(item.result.length).toBeGreaterThan(20);
    expect(item.stack.length).toBeGreaterThan(0);
  });

  it.each(cases.flatMap((item) => item.links ?? []))(
    "o link '$label' é interno ou https",
    ({ href }) => {
      // Assert
      expect(href).toMatch(/^(\/[a-z0-9-/]*|https:\/\/[^/]+.*)$/);
    },
  );

  it("conta as fases do CareFlow e a avaliação da triagem a partir dos dados do projeto", () => {
    // Arrange
    const done = careflowPhases.filter((phase) => phase.status === "concluida").length;

    // Act
    const careflowCase = cases.find((item) => item.id === "careflow");

    // Assert
    expect(careflowCase?.result).toContain(`${done} fases`);
    expect(careflowCase?.result).toContain(careflow.triageEval.withinOneLevel);
    expect(careflowCase?.approach).toContain(`${careflow.services.length} serviços`);
  });

  it("usa os mesmos números do estudo de caso da Lojinha", () => {
    // Act
    const lojinhaCase = cases.find((item) => item.id === "lojinha-da-lua");
    const adrs = lojinha.indicators.find((indicator) => indicator.label.includes("ADR"));

    // Assert
    expect(lojinhaCase?.problem).toBe(lojinha.problem);
    expect(lojinhaCase?.result).toContain("R$ 0");
    expect(lojinhaCase?.result).toContain("0 KB");
    expect(lojinhaCase?.result).toContain(`${adrs?.value} decisões`);
  });
});

describe("getCases", () => {
  it("devolve os próprios cases em português", () => {
    // Assert
    expect(getCases("pt-BR")).toBe(cases);
  });

  it("em inglês, traduz os textos e mantém id, contexto e destinos dos links", () => {
    // Act
    const english = getCases("en");

    // Assert
    expect(english.map((item) => item.id)).toEqual(cases.map((item) => item.id));
    english.forEach((item, index) => {
      const original = cases[index];
      expect(item.context).toBe(original.context);
      expect(item.title).not.toBe(original.title);
      expect(item.links?.map((link) => link.href)).toEqual(
        original.links?.map((link) => link.href),
      );
    });
  });

  it("não deixa português esquecido nos cases em inglês", () => {
    // Arrange
    const texts = getCases("en").flatMap((item) => [
      item.tag,
      item.title,
      item.problem,
      item.approach,
      item.result,
      ...item.stack,
      ...(item.links ?? []).map((link) => link.label),
    ]);

    // Act
    const leftovers = texts.flatMap(portugueseLeftovers);

    // Assert
    expect(leftovers).toEqual([]);
  });

  it("avisa que os destinos dos links estão em português", () => {
    // Arrange
    const links = getCases("en").flatMap((item) => item.links ?? []);

    // Assert
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.hrefLang).toBe("pt-BR");
      expect(link.label).toMatch(/\(in Portuguese\)$/);
    }
  });

  it("usa os números do projeto, com ponto decimal em inglês", () => {
    // Arrange
    const done = careflowPhases.filter((phase) => phase.status === "concluida").length;
    const adrs = lojinha.indicators.find((indicator) => indicator.label.includes("ADR"));

    // Act
    const english = getCases("en");
    const careflowCase = english.find((item) => item.id === "careflow");
    const lojinhaCase = english.find((item) => item.id === "lojinha-da-lua");

    // Assert
    expect(careflowCase?.result).toContain(`${done} phases`);
    expect(careflowCase?.result).toContain(careflow.triageEval.withinOneLevel.replace(",", "."));
    expect(careflowCase?.approach).toContain(`${careflow.services.length} .NET services`);
    expect(lojinhaCase?.result).toContain(`${adrs?.value} decisions`);
  });
});
