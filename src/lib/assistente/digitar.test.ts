import { describe, expect, it } from "vitest";
import { proximoCorte } from "./digitar";

describe("proximoCorte", () => {
  it("avança uma palavra por vez, sem cortar palavra ao meio", () => {
    const texto = "Sou o Sinapse.";

    const cortes = [0];
    while (cortes.at(-1)! < texto.length) {
      cortes.push(proximoCorte(texto, cortes.at(-1)!));
    }

    expect(cortes.map((corte) => texto.slice(0, corte))).toEqual([
      "",
      "Sou",
      "Sou o",
      "Sou o Sinapse.",
    ]);
  });

  it("pula espaços repetidos e para no fim do texto", () => {
    expect(proximoCorte("a   bc", 1)).toBe(6);
    expect(proximoCorte("abc", 3)).toBe(3);
    expect(proximoCorte("abc", 10)).toBe(3);
    expect(proximoCorte("", 0)).toBe(0);
  });

  it("trata posição negativa como o começo", () => {
    expect(proximoCorte("abc def", -5)).toBe(3);
  });
});
