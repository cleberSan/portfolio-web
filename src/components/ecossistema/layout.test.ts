import { describe, expect, it } from "vitest";
import { nos, regiaoIds, type NoId } from "@/content/ecossistema/modelo";
import { caixa, posicoes, regiaoDoNo, zonas, type Elipse, type Ponto } from "./layout";

function dentro(ponto: Ponto, elipse: Elipse): boolean {
  const dx = (ponto.x - elipse.cx) / elipse.rx;
  const dy = (ponto.y - elipse.cy) / elipse.ry;
  return dx * dx + dy * dy <= 1;
}

const ids = Object.keys(nos) as NoId[];

describe("layout do mapa", () => {
  it("dá posição dentro da caixa a todo nó", () => {
    for (const id of ids) {
      const ponto = posicoes[id];
      expect(ponto, id).toBeDefined();
      expect(ponto.x).toBeGreaterThanOrEqual(0);
      expect(ponto.x).toBeLessThanOrEqual(caixa.largura);
      expect(ponto.y).toBeGreaterThanOrEqual(0);
      expect(ponto.y).toBeLessThanOrEqual(caixa.altura);
    }
  });

  it("põe cada nó dentro da zona da própria região", () => {
    for (const id of ids) {
      const regiao = regiaoDoNo(id);
      if (regiao) {
        expect(dentro(posicoes[id], zonas[regiao]), id).toBe(true);
      }
    }
  });

  it("não sobrepõe dois nós", () => {
    for (const [i, a] of ids.entries()) {
      for (const b of ids.slice(i + 1)) {
        const distancia = Math.hypot(posicoes[a].x - posicoes[b].x, posicoes[a].y - posicoes[b].y);
        expect(distancia, `${a} e ${b}`).toBeGreaterThanOrEqual(14);
      }
    }
  });

  it("tem zona para cada região e deixa o portão do Cleber fora delas", () => {
    expect(Object.keys(zonas).sort()).toEqual([...regiaoIds].sort());
    expect(regiaoDoNo("cleber")).toBeNull();
    for (const zona of Object.values(zonas)) {
      expect(dentro(posicoes.cleber, zona)).toBe(false);
    }
  });
});
