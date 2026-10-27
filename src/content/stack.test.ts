import { describe, expect, it } from "vitest";
import { portugueseLeftovers } from "@/test-utils/portuguese";
import { getStackGroups, stackGroups } from "./stack";
import { stackTextEn } from "./stack.en";

describe("getStackGroups", () => {
  it("devolve os próprios grupos em português", () => {
    // Assert
    expect(getStackGroups("pt-BR")).toBe(stackGroups);
  });

  it("em inglês, mantém grupos e itens na mesma ordem, sem as evidências da página Stack", () => {
    // Act
    const english = getStackGroups("en");

    // Assert
    expect(english.map((group) => group.id)).toEqual(stackGroups.map((group) => group.id));
    english.forEach((group, index) => {
      expect(group.items).toHaveLength(stackGroups[index].items.length);
      for (const item of group.items) {
        expect(item.evidence).toBeUndefined();
      }
    });
  });

  it("não deixa item, título ou resumo em português", () => {
    // Arrange
    const texts = getStackGroups("en").flatMap((group) => [
      group.title,
      group.summary,
      ...group.items.map((item) => item.name),
    ]);

    // Act
    const leftovers = texts.flatMap(portugueseLeftovers);

    // Assert
    expect(leftovers).toEqual([]);
  });

  it("não guarda tradução de item que saiu da stack", () => {
    // Arrange
    const names = new Set(stackGroups.flatMap((group) => group.items.map((item) => item.name)));

    // Assert
    for (const name of Object.keys(stackTextEn.items)) {
      expect(names).toContain(name);
    }
  });
});
