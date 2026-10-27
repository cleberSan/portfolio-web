import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getEngineering, principles, qualityPipeline, services } from "./engineering";
import { portugueseLeftovers } from "@/test-utils/portuguese";

const workflows = ["ci.yml", "codeql.yml"]
  .map((file) => readFileSync(join(process.cwd(), ".github", "workflows", file), "utf8"))
  .join("\n");

describe("qualityPipeline", () => {
  it.each(qualityPipeline.gates)("o portão '$label' existe no CI ($ciName)", ({ ciName }) => {
    // Assert
    expect(workflows).toContain(`name: ${ciName}`);
  });

  it("não repete portões", () => {
    // Arrange
    const labels = qualityPipeline.gates.map((gate) => gate.label);

    // Assert
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("conteúdo de engenharia", () => {
  it("não repete títulos de serviço nem de princípio", () => {
    // Arrange
    const titles = [...services, ...principles].map((item) => item.title);

    // Assert
    expect(new Set(titles).size).toBe(titles.length);
  });
});

describe("getEngineering", () => {
  it("em português, devolve o conteúdo original", () => {
    // Act
    const portuguese = getEngineering("pt-BR");

    // Assert
    expect(portuguese.principles).toBe(principles);
    expect(portuguese.services).toBe(services);
    expect(portuguese.qualityPipeline).toBe(qualityPipeline);
  });

  it("em inglês, mantém a mesma quantidade de itens e os mesmos portões do CI", () => {
    // Act
    const english = getEngineering("en");

    // Assert
    expect(english.principles).toHaveLength(principles.length);
    expect(english.services).toHaveLength(services.length);
    expect(english.aiPractice.items).toHaveLength(getEngineering("pt-BR").aiPractice.items.length);
    expect(english.qualityPipeline.stages).toHaveLength(qualityPipeline.stages.length);
    expect(english.qualityPipeline.gates.map((gate) => gate.ciName)).toEqual(
      qualityPipeline.gates.map((gate) => gate.ciName),
    );
  });

  it("não deixa português esquecido no inglês", () => {
    // Arrange
    const english = getEngineering("en");
    const texts = [
      ...english.principles.flatMap((principle) => [principle.title, principle.text]),
      english.aiPractice.lead,
      ...english.aiPractice.items,
      english.aiPractice.close,
      ...english.qualityPipeline.stages,
      ...english.qualityPipeline.gates.map((gate) => gate.label),
      ...english.services.flatMap((service) => [service.title, service.description]),
    ];

    // Act
    const leftovers = texts.flatMap(portugueseLeftovers);

    // Assert
    expect(leftovers).toEqual([]);
  });
});
