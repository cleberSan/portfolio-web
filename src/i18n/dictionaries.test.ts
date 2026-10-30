import { describe, expect, it } from "vitest";
import { aboutText } from "@/components/about/about-text";
import { homeText } from "@/components/home/home-text";
import { portugueseLeftovers } from "@/test-utils/portuguese";
import { dictionaries } from "./dictionaries";

/** Todos os textos de um objeto, chamando as funções com valores de exemplo. */
function strings(value: unknown): string[] {
  if (typeof value === "string") {
    return [value];
  }
  if (typeof value === "function") {
    return [String(value(7, "X"))];
  }
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(strings);
  }
  return [];
}

describe("textos de interface em inglês", () => {
  it.each([
    ["dicionário", dictionaries.en],
    ["home", homeText.en],
    ["Sobre", aboutText.en],
  ])("o texto da %s não tem português esquecido", (_, text) => {
    // Act
    const leftovers = strings(text).flatMap(portugueseLeftovers);

    // Assert
    expect(leftovers).toEqual([]);
  });

  it("só traduz o que é texto: ids de seção e destinos seguem o padrão de cada idioma", () => {
    // Assert
    expect(homeText.en.about.more.href).toBe("/en/about");
    expect(homeText["pt-BR"].about.more.href).toBe("/sobre");
    expect(aboutText.en.path).toBe("/en/about");
    expect(aboutText["pt-BR"].path).toBe("/sobre");
  });

  it("marca como português todo link da versão em inglês que leva a página só em português", () => {
    // Arrange
    const links = [
      homeText.en.skills.more,
      homeText.en.buildLog.more,
      aboutText.en.inTheOpen.careflow,
      aboutText.en.inTheOpen.buildLog,
    ];

    // Assert
    for (const link of links) {
      expect(link.hrefLang).toBe("pt-BR");
    }
  });
});
