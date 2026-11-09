import { describe, expect, it } from "vitest";
import { recording, type Span, type Trace } from "@/content/painel";
import { nos } from "./modelo";
import {
  buildReproducoes,
  duracaoAlvoMs,
  eventosDaFase,
  eventosDoTrace,
  instanteMs,
  resumoDaGravacao,
} from "./reproducoes";

function span(partial: Partial<Span> & Pick<Span, "spanId" | "service" | "startedAt">): Span {
  return {
    parentSpanId: null,
    name: "POST",
    kind: "server",
    durationMs: 10,
    status: "unset",
    attributes: {},
    events: [],
    ...partial,
  };
}

const base = "2026-10-16T17:34:41";

/** Trace de 1 s: demo chama a agenda, que grava no banco e publica; notificações consomem. */
const traceDeTeste: Trace = {
  traceId: "t",
  spans: [
    span({
      spanId: "c",
      parentSpanId: "db",
      service: "careflow-notifications",
      startedAt: `${base}.5000000+00:00`,
      name: "process appointment.booked",
      durationMs: 100,
    }),
    span({
      spanId: "a",
      service: "careflow-demo",
      startedAt: `${base}.0000000+00:00`,
      durationMs: 1000,
    }),
    span({
      spanId: "b",
      parentSpanId: "a",
      service: "careflow-scheduling",
      startedAt: `${base}.2500000+00:00`,
      name: "POST /v1/appointments/",
    }),
    span({
      spanId: "db",
      parentSpanId: "b",
      service: "careflow-scheduling",
      startedAt: `${base}.3000000+00:00`,
      attributes: { "db.system.name": "postgresql" },
    }),
    span({
      spanId: "x",
      parentSpanId: "b",
      service: "outro-servico",
      startedAt: `${base}.4000000+00:00`,
    }),
  ],
};

describe("instanteMs", () => {
  // Resolução de microssegundo basta para ordenar spans; o double perde o resto numa data de 2026.
  it("guarda a fração além do milésimo que o Date.parse descarta", () => {
    // Arrange
    const iso = `${base}.0002716+00:00`;

    // Act
    const value = instanteMs(iso);

    // Assert
    expect(value - Date.parse(`${base}+00:00`)).toBeCloseTo(0.2716, 3);
  });

  it("aceita data sem fração", () => {
    expect(instanteMs(`${base}+00:00`)).toBe(Date.parse(`${base}+00:00`));
  });
});

describe("eventosDoTrace", () => {
  // spec 0001 CA-06
  it("mantém a ordem e a proporção de tempo dos spans gravados", () => {
    // Act
    const eventos = eventosDoTrace(traceDeTeste, 10_000);

    // Assert: 0 s, 0,25 s e 0,5 s de um trace de 1 s viram 0, 2,5 e 5 s em 10 s.
    expect(eventos.map((evento) => evento.inicioMs)).toEqual([0, 2500, 5000]);
    expect(eventos.map((evento) => evento.marca)).toEqual(["+0,000 s", "+0,250 s", "+0,500 s"]);
  });

  // spec 0001 CA-06
  it("deixa de fora os spans de banco e de serviço fora do CareFlow", () => {
    const eventos = eventosDoTrace(traceDeTeste);

    expect(eventos.map((evento) => evento.operacao)).not.toContain("db");
    expect(eventos).toHaveLength(3);
  });

  // spec 0001 CA-06
  it("liga cada evento à origem e ao destino, passando pelo RabbitMQ no consumo", () => {
    const [demo, agenda, notificacao] = eventosDoTrace(traceDeTeste);

    expect(demo).toMatchObject({ origem: "demo", destino: "demo", viaBroker: false });
    expect(agenda).toMatchObject({ origem: "demo", destino: "agenda", viaBroker: false });
    // O pai é um span de banco da agenda: a origem sobe até a agenda.
    expect(notificacao).toMatchObject({
      origem: "agenda",
      destino: "notificacoes",
      viaBroker: true,
    });
    expect(notificacao.duracao).toBe("100 ms");
  });

  it("trata pai ausente e ciclo de pais como span sem pai", () => {
    const trace: Trace = {
      traceId: "t",
      spans: [
        span({
          spanId: "a",
          parentSpanId: "sumiu",
          service: "careflow-audit",
          startedAt: `${base}.0000000+00:00`,
        }),
        span({
          spanId: "b",
          parentSpanId: "c",
          service: "careflow-consent",
          startedAt: `${base}.1000000+00:00`,
        }),
        span({
          spanId: "c",
          parentSpanId: "b",
          service: "careflow-consent",
          startedAt: `${base}.2000000+00:00`,
          attributes: { "db.system": "postgresql" },
        }),
      ],
    };

    const eventos = eventosDoTrace(trace);

    expect(eventos.map((evento) => [evento.origem, evento.destino])).toEqual([
      ["auditoria", "auditoria"],
      ["consentimento", "consentimento"],
    ]);
  });

  it("não divide por zero num trace sem duração", () => {
    const trace: Trace = {
      traceId: "t",
      spans: [
        span({ spanId: "a", service: "careflow-demo", startedAt: `${base}+00:00`, durationMs: 0 }),
      ],
    };

    expect(eventosDoTrace(trace)[0].inicioMs).toBe(0);
  });
});

describe("buildReproducoes", () => {
  const reproducoes = buildReproducoes();

  // spec 0001 CA-03
  it("traz a data e o commit da gravação do CI nas reproduções do CareFlow", () => {
    const gravadas = reproducoes.filter((item) => item.regiao === "careflow");

    expect(gravadas).toHaveLength(4);
    for (const item of gravadas) {
      expect(item.fonte.tipo).toBe("gravacao");
      expect(item.fonte.rotulo).toContain("16 de outubro de 2026");
      expect(item.fonte.rotulo).toContain(recording.commit.slice(0, 8));
      expect(item.fonte.href).toBe(
        `https://github.com/cleberSan/careflow/commit/${recording.commit}`,
      );
    }
  });

  // spec 0001 CA-03
  it("marca o fluxo dos agentes como roteiro, com link para o fluxo documentado", () => {
    const fase = reproducoes.find((item) => item.id === "agentes");

    expect(fase?.fonte).toEqual({
      tipo: "roteiro",
      rotulo: "roteiro documentado em agents/fluxo-fase.md",
      href: "https://github.com/cleberSan/claude-works/blob/main/agents/fluxo-fase.md",
    });
  });

  // spec 0001 CA-06
  it("dura de 12 a 20 segundos, com todo evento dentro da reprodução e em ordem", () => {
    for (const item of reproducoes) {
      expect(item.duracaoMs).toBeGreaterThanOrEqual(12_000);
      expect(item.duracaoMs).toBeLessThanOrEqual(20_000);
      expect(item.eventos.length).toBeGreaterThan(0);
      const inicios = item.eventos.map((evento) => evento.inicioMs);
      expect(inicios).toEqual([...inicios].sort((a, b) => a - b));
      expect(Math.max(...inicios)).toBeLessThanOrEqual(item.duracaoMs);
    }
    expect(duracaoAlvoMs).toBe(16_000);
  });

  // spec 0001 CA-06
  it("cabe em 40 KB serializado, sem levar a gravação inteira ao navegador", () => {
    expect(JSON.stringify(reproducoes).length).toBeLessThanOrEqual(40_000);
  });

  it("só usa nós conhecidos", () => {
    for (const evento of reproducoes.flatMap((item) => item.eventos)) {
      expect(nos[evento.origem]).toBeDefined();
      expect(nos[evento.destino]).toBeDefined();
    }
  });

  it("a fase com agentes passa duas vezes pelo portão do Cleber", () => {
    const portoes = eventosDaFase().filter((evento) => evento.portao);

    expect(portoes.map((evento) => evento.destino)).toEqual(["cleber", "cleber"]);
  });
});

describe("resumoDaGravacao", () => {
  // spec 0001 CA-03
  it("dá a data por extenso, o commit curto e o link do commit gravado", () => {
    expect(resumoDaGravacao()).toEqual({
      data: "16 de outubro de 2026",
      commit: recording.commit.slice(0, 8),
      href: `https://github.com/cleberSan/careflow/commit/${recording.commit}`,
    });
  });
});
