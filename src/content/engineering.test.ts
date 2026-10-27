import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { principles, qualityPipeline, services } from "./engineering";

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
