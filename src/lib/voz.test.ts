import { afterEach, describe, expect, it, vi } from "vitest";
import {
  simularFala,
  vozInglesa,
  vozPtBrLocal,
  vozPtBrRemota,
  vozPtPtLocal,
} from "@/test-utils/fala";
import { escolherVoz, falar, frases, observarVozes, parar, podeFalar } from "./voz";

const comoVozes = (vozes: Partial<SpeechSynthesisVoice>[]) => vozes as SpeechSynthesisVoice[];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("escolherVoz", () => {
  it("prefere pt-BR local, depois pt-BR remota, depois outro português", () => {
    expect(escolherVoz(comoVozes([vozPtPtLocal, vozPtBrRemota, vozPtBrLocal]))?.name).toBe(
      "Luciana",
    );
    expect(escolherVoz(comoVozes([vozPtPtLocal, vozPtBrRemota]))?.name).toBe(
      "Google português do Brasil",
    );
    expect(escolherVoz(comoVozes([vozInglesa, vozPtPtLocal]))?.name).toBe("Joana");
    expect(escolherVoz(comoVozes([{ name: "pt", lang: "pt", localService: false }]))?.lang).toBe(
      "pt",
    );
  });

  it("não escolhe voz de outro idioma", () => {
    expect(escolherVoz(comoVozes([vozInglesa, { name: "x", lang: "ptx-QQ" }]))).toBeNull();
    expect(escolherVoz([])).toBeNull();
  });
});

describe("frases", () => {
  it("separa o texto em frases e descarta espaços sobrando", () => {
    expect(frases("Primeira frase. Segunda?  Terceira!  ")).toEqual([
      "Primeira frase.",
      "Segunda?",
      "Terceira!",
    ]);
    expect(frases("   ")).toEqual([]);
    expect(frases("Versão 1.0 do site")).toEqual(["Versão 1.0 do site"]);
  });
});

describe("voz do navegador", () => {
  // spec 0001 CA-19
  it("sem síntese de fala, não pode falar e não observa nada", () => {
    // Arrange
    const aoMudar = vi.fn();

    // Act
    const sair = observarVozes(aoMudar);

    // Assert
    expect(podeFalar()).toBe(false);
    expect(() => sair()).not.toThrow();
    expect(() => falar("Oi.")).not.toThrow();
    expect(() => parar()).not.toThrow();
  });

  // spec 0001 CA-19
  it("sem voz em português, não pode falar nem fala", () => {
    // Arrange
    const fala = simularFala([vozInglesa]);

    // Act
    falar("Olá.");

    // Assert
    expect(podeFalar()).toBe(false);
    expect(fala.falas).toEqual([]);
  });

  it("avisa quando as vozes chegam e para de avisar ao sair", () => {
    // Arrange
    const fala = simularFala([]);
    const aoMudar = vi.fn();
    const sair = observarVozes(aoMudar);

    // Act
    fala.trocarVozes([vozPtBrLocal]);

    // Assert
    expect(aoMudar).toHaveBeenCalledTimes(1);
    expect(podeFalar()).toBe(true);

    // Act
    sair();
    fala.trocarVozes([]);

    // Assert
    expect(aoMudar).toHaveBeenCalledTimes(1);
  });

  // spec 0001 CA-18
  it("lê frase por frase com a voz escolhida, interrompendo a leitura anterior", () => {
    // Arrange
    const fala = simularFala([vozPtPtLocal, vozPtBrLocal]);

    // Act
    falar("O CareFlow é o projeto vitrine. Usa dados sintéticos.");

    // Assert
    expect(fala.cancel).toHaveBeenCalledTimes(1);
    expect(fala.falas).toEqual([
      { texto: "O CareFlow é o projeto vitrine.", lang: "pt-BR", voz: "Luciana" },
      { texto: "Usa dados sintéticos.", lang: "pt-BR", voz: "Luciana" },
    ]);
  });

  it("parar cancela a leitura", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);

    // Act
    parar();

    // Assert
    expect(fala.cancel).toHaveBeenCalledTimes(1);
  });
});
