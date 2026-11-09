import { describe, expect, it } from "vitest";
import type { EventoReproducao } from "@/content/ecossistema/modelo";
import {
  caminhoDoEvento,
  caudaMs,
  detalheDoEvento,
  fimDaReproducao,
  passosAte,
} from "./linha-do-tempo";

function evento(parcial: Partial<EventoReproducao>): EventoReproducao {
  return {
    inicioMs: 0,
    origem: "demo",
    destino: "demo",
    viaBroker: false,
    marca: "+0,000 s",
    operacao: "POST",
    duracao: "",
    portao: false,
    ...parcial,
  };
}

const eventos = [evento({ inicioMs: 0 }), evento({ inicioMs: 500 }), evento({ inicioMs: 500 })];

describe("passosAte", () => {
  // spec 0001 CA-06
  it.each([
    [-1, 0],
    [0, 1],
    [499, 1],
    [500, 3],
    [10_000, 3],
  ])("em %i ms já aconteceram %i passos", (tempoMs, passos) => {
    expect(passosAte(eventos, tempoMs)).toBe(passos);
  });

  it("não quebra sem eventos", () => {
    expect(passosAte([], 1000)).toBe(0);
  });
});

describe("fimDaReproducao", () => {
  it("deixa a cauda para o último sinal chegar", () => {
    expect(fimDaReproducao(16_000)).toBe(16_000 + caudaMs);
  });
});

describe("caminhoDoEvento e detalheDoEvento", () => {
  // spec 0001 CA-06
  it("escreve serviço, operação e duração", () => {
    const passo = evento({ origem: "demo", destino: "agenda", duracao: "12,5 ms" });

    expect(caminhoDoEvento(passo)).toBe("Demo (BFF do Painel) → Agenda");
    expect(detalheDoEvento(passo)).toBe("POST (12,5 ms)");
  });

  it("mostra o RabbitMQ no meio quando a mensagem é consumida de outro serviço", () => {
    const passo = evento({ origem: "agenda", destino: "notificacoes", viaBroker: true });

    expect(caminhoDoEvento(passo)).toBe("Agenda → RabbitMQ → Notificações");
  });

  it("mostra só o nó quando o passo não sai dele", () => {
    expect(caminhoDoEvento(evento({ origem: "cofre", destino: "cofre" }))).toBe(
      "Cofre do paciente",
    );
  });

  it("marca o portão do Cleber e omite duração vazia", () => {
    const passo = evento({
      origem: "orquestrador",
      destino: "cleber",
      portao: true,
      operacao: "OK",
    });

    expect(detalheDoEvento(passo)).toBe("OK · espera o OK do Cleber");
  });
});
