import { describe, expect, it } from "vitest";
import { nos, regiaoIds, type NoId } from "@/content/ecossistema/modelo";
import { posicoes } from "../layout";
import {
  aleatorio,
  alturaDaSuperficie,
  ancoras,
  gerarCerebro,
  paraCena,
  paraExibicao,
  paraMapa,
  pontosNoCelular,
  pontosNoComputador,
  regiaoEmbaixo,
  semRegiao,
} from "./cerebro";

describe("gerarCerebro", () => {
  const cerebro = gerarCerebro({ pontos: pontosNoComputador });

  it("respeita o teto de pontos do computador e do celular", () => {
    expect(pontosNoComputador).toBeLessThanOrEqual(6000);
    expect(pontosNoCelular).toBeLessThanOrEqual(2500);
    expect(cerebro.total).toBe(pontosNoComputador);
    expect(cerebro.posicoes).toHaveLength(pontosNoComputador * 3);
    expect(cerebro.regioes).toHaveLength(pontosNoComputador);
    expect(cerebro.brilho).toHaveLength(pontosNoComputador);
  });

  it("dá a mesma forma em toda visita", () => {
    const outra = gerarCerebro({ pontos: pontosNoComputador });

    expect(outra.posicoes).toEqual(cerebro.posicoes);
    expect(gerarCerebro({ pontos: 100, semente: 1 }).posicoes).not.toEqual(
      gerarCerebro({ pontos: 100, semente: 2 }).posicoes,
    );
  });

  it("forma dois hemisférios achatados embaixo, dentro de uma caixa pequena", () => {
    let esquerda = 0;
    for (let i = 0; i < cerebro.total; i += 1) {
      const [x, y, z] = cerebro.posicoes.slice(i * 3, i * 3 + 3);
      expect(Math.abs(x)).toBeLessThan(2);
      expect(y).toBeGreaterThanOrEqual(-0.45 * 0.8 * 1.04);
      expect(y).toBeLessThan(0.9);
      expect(Math.abs(z)).toBeLessThan(1.35);
      if (x < 0) {
        esquerda += 1;
      }
    }
    expect(esquerda).toBe(cerebro.total / 2);
  });

  it("acende cada uma das cinco regiões e deixa parte do cérebro neutra", () => {
    const contagem = new Map<number, number>();
    for (const regiao of cerebro.regioes) {
      contagem.set(regiao, (contagem.get(regiao) ?? 0) + 1);
    }

    for (const [indice] of regiaoIds.entries()) {
      expect(contagem.get(indice) ?? 0, regiaoIds[indice]).toBeGreaterThan(cerebro.total * 0.02);
    }
    expect(contagem.get(semRegiao) ?? 0).toBeGreaterThan(0);
  });

  it("mantém o brilho dos giros entre 0,15 e 1", () => {
    expect(Math.min(...cerebro.brilho)).toBeGreaterThanOrEqual(0.15);
    expect(Math.max(...cerebro.brilho)).toBeLessThanOrEqual(1);
  });

  it("não quebra com zero pontos ou número quebrado", () => {
    expect(gerarCerebro({ pontos: 0 }).total).toBe(0);
    expect(gerarCerebro({ pontos: 10.7 }).total).toBe(10);
    expect(gerarCerebro({ pontos: -3 }).total).toBe(0);
  });
});

describe("conversão entre mapa e cena", () => {
  it("vai e volta sem perder posição", () => {
    const { x, z } = paraCena({ x: 295, y: 96 });

    expect(paraMapa(x, z)).toEqual({ x: 295, y: 96 });
  });

  it("acha a região do mapa 2D embaixo de um ponto da cena", () => {
    const agenda = paraCena(posicoes.agenda);
    const orquestrador = paraCena(posicoes.orquestrador);

    expect(regiaoEmbaixo(agenda.x, agenda.z)).toBe("careflow");
    expect(regiaoEmbaixo(orquestrador.x, orquestrador.z)).toBe("agentes");
    expect(regiaoEmbaixo(0, -1.4)).toBeNull();
  });

  it("estreita os hemisférios na cena e os encosta na fissura", () => {
    // Bordas dos hemisférios no mapa: 13 a 197 e 203 a 387 (cx ± rx × 0,95).
    const internaEsquerda = paraExibicao(-0.95 + 0.874);
    const externaEsquerda = paraExibicao(-0.95 - 0.874);

    expect(paraExibicao(0)).toBe(0);
    expect(internaEsquerda).toBeCloseTo(-0.04);
    expect(paraExibicao(0.95 - 0.874)).toBeCloseTo(0.04);
    expect(internaEsquerda - externaEsquerda).toBeCloseTo(0.874 * 2 * 0.7);
    expect(paraExibicao(-0.5)).toBeLessThan(0);
    expect(paraExibicao(0.5)).toBeGreaterThan(0);
  });

  it("dá altura só dentro dos hemisférios", () => {
    expect(alturaDaSuperficie(-0.95, 0)).toBeCloseTo(0.8);
    expect(alturaDaSuperficie(0, -1.2)).toBeNull();
  });
});

describe("ancoras", () => {
  it("põe cada nó sobre o cérebro e o portão do Cleber acima da fissura", () => {
    const todas = ancoras();

    for (const id of Object.keys(nos) as NoId[]) {
      const [x, y, z] = todas[id];
      expect(Number.isFinite(x + y + z), id).toBe(true);
      expect(y, id).toBeGreaterThan(0);
    }
    expect(todas.cleber[0]).toBe(0);
    expect(todas.cleber[1]).toBeGreaterThan(todas.orquestrador[1]);
  });
});

describe("aleatorio", () => {
  it("gera números entre 0 e 1, repetíveis pela semente", () => {
    const a = aleatorio(42);
    const b = aleatorio(42);
    const valores = Array.from({ length: 50 }, () => a());

    expect(valores).toEqual(Array.from({ length: 50 }, () => b()));
    expect(Math.min(...valores)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...valores)).toBeLessThan(1);
  });
});
