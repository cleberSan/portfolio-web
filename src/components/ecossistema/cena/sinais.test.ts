import { describe, expect, it } from "vitest";
import type { EventoReproducao, NoId } from "@/content/ecossistema/modelo";
import { ancoras, type Vetor } from "./cerebro";
import {
  duracaoDoPulsoMs,
  ligacoesDaReproducao,
  maximoDePulsos,
  nosAcesos,
  pontoNoArco,
  posicaoDoPulso,
  pulsosAtivos,
} from "./sinais";

function evento(
  inicioMs: number,
  origem: NoId,
  destino: NoId,
  viaBroker = false,
): EventoReproducao {
  return {
    inicioMs,
    origem,
    destino,
    viaBroker,
    marca: "",
    operacao: "",
    duracao: "",
    portao: false,
  };
}

const todas = ancoras();

describe("pulsosAtivos", () => {
  const eventos = [
    evento(0, "demo", "agenda"),
    evento(500, "agenda", "auditoria"),
    evento(5000, "demo", "cofre"),
  ];

  // spec 0001 CA-06
  it("acende cada passo no instante gravado e apaga quando o pulso chega", () => {
    expect(pulsosAtivos(eventos, -1)).toEqual([]);
    expect(pulsosAtivos(eventos, 0)).toEqual([{ indice: 0, progresso: 0 }]);
    expect(pulsosAtivos(eventos, 600)).toEqual([
      { indice: 0, progresso: 600 / duracaoDoPulsoMs },
      { indice: 1, progresso: 100 / duracaoDoPulsoMs },
    ]);
    expect(pulsosAtivos(eventos, 1000)).toEqual([{ indice: 1, progresso: 500 / duracaoDoPulsoMs }]);
    expect(pulsosAtivos(eventos, 3000)).toEqual([]);
  });

  it("guarda só os pulsos mais novos quando muitos passos caem juntos", () => {
    const rajada = Array.from({ length: 40 }, (_, i) => evento(i, "demo", "agenda"));

    const ativos = pulsosAtivos(rajada, 50);

    expect(ativos).toHaveLength(maximoDePulsos);
    expect(ativos.at(-1)?.indice).toBe(39);
  });
});

describe("pontoNoArco", () => {
  it("sai da origem, chega ao destino e sobe no meio", () => {
    const a: Vetor = [0, 0, 0];
    const b: Vetor = [1, 0, 0];

    expect(pontoNoArco(a, b, 0)).toEqual(a);
    expect(pontoNoArco(a, b, 1)).toEqual(b);
    expect(pontoNoArco(a, b, 0.5)[1]).toBeGreaterThan(0.1);
  });
});

describe("posicaoDoPulso", () => {
  // spec 0001 CA-06
  it("passa pelo RabbitMQ na metade quando a mensagem é consumida de outro serviço", () => {
    const passo = evento(0, "agenda", "notificacoes", true);

    expect(posicaoDoPulso(passo, 0, todas)).toEqual(todas.agenda);
    expect(posicaoDoPulso(passo, 0.5, todas)).toEqual(todas.rabbitmq);
    expect(posicaoDoPulso(passo, 1, todas)).toEqual(todas.notificacoes);
  });

  it("vai direto sem broker e fica no nó quando o passo não sai dele", () => {
    expect(posicaoDoPulso(evento(0, "demo", "agenda"), 1, todas)).toEqual(todas.agenda);
    expect(posicaoDoPulso(evento(0, "cofre", "cofre"), 0.7, todas)).toEqual(todas.cofre);
  });

  it("limita o progresso entre 0 e 1", () => {
    const passo = evento(0, "demo", "agenda");

    expect(posicaoDoPulso(passo, -1, todas)).toEqual(todas.demo);
    expect(posicaoDoPulso(passo, 2, todas)).toEqual(todas.agenda);
  });
});

describe("nosAcesos", () => {
  it("acende origem, destino e o broker dos pulsos em voo", () => {
    const eventos = [evento(0, "agenda", "notificacoes", true), evento(0, "base", "orquestrador")];

    const acesos = nosAcesos(eventos, [
      { indice: 0, progresso: 0.2 },
      { indice: 1, progresso: 0.2 },
    ]);

    expect([...acesos].sort()).toEqual(
      ["agenda", "base", "notificacoes", "orquestrador", "rabbitmq"].sort(),
    );
  });
});

describe("ligacoesDaReproducao", () => {
  it("liga cada par uma vez, passando pelo RabbitMQ quando a mensagem é consumida", () => {
    // Arrange
    const eventos = [
      evento(0, "demo", "agenda"),
      evento(10, "demo", "agenda"),
      evento(20, "agenda", "notificacoes", true),
      evento(30, "agenda", "agenda"),
    ];

    // Act
    const ligacoes = ligacoesDaReproducao(eventos);

    // Assert
    expect(ligacoes).toEqual([
      ["demo", "agenda"],
      ["agenda", "rabbitmq"],
      ["rabbitmq", "notificacoes"],
    ]);
  });

  it("para no teto de ligações", () => {
    const eventos = [
      evento(0, "demo", "agenda"),
      evento(1, "agenda", "auditoria"),
      evento(2, "auditoria", "cofre"),
    ];

    expect(ligacoesDaReproducao(eventos, 2)).toHaveLength(2);
    expect(ligacoesDaReproducao([])).toEqual([]);
  });
});
