import { describe, expect, it } from "vitest";
import { careflow, careflowPhases } from "./careflow";
import { cases } from "./cases";
import { lojinha } from "./lojinha";

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
