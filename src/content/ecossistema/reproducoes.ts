import {
  commitUrl,
  formatMs,
  formatRecordedAt,
  isDatabaseSpan,
  recording,
  type Span,
  type Trace,
} from "@/content/painel";
import type { EventoReproducao, NoId, Reproducao, ServicoId } from "./modelo";

/**
 * Reproduções da página /ecossistema (spec 0001, CA-03 e CA-06). Este módulo lê a gravação inteira
 * do CI (`gravacao.json`, quase 500 KB) e por isso só roda no servidor: a página passa ao cliente
 * apenas a linha do tempo compacta. Componentes de cliente importam tipos de `./modelo`.
 */

/** Quanto dura uma reprodução de trace na tela: o trace real dura menos de um segundo. */
export const duracaoAlvoMs = 16_000;

const servicoPorNome: Readonly<Record<string, ServicoId>> = {
  "careflow-demo": "demo",
  "careflow-scheduling": "agenda",
  "careflow-patient-vault": "cofre",
  "careflow-consent": "consentimento",
  "careflow-notifications": "notificacoes",
  "careflow-audit": "auditoria",
  "careflow-triage": "triagem",
  "careflow-rights": "titular",
};

/** Instante em milissegundos com a fração além do milésimo, que o `Date.parse` descarta. */
export function instanteMs(iso: string): number {
  const fracao = /\.(\d+)/.exec(iso)?.[1] ?? "";
  const semFracao = iso.replace(/\.\d+/, "");
  return Date.parse(semFracao) + Number(`0.${fracao || "0"}`) * 1000;
}

const segundos = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/**
 * Converte um trace gravado em eventos da reprodução: um por span que não é de banco, na ordem em
 * que começaram, com o instante esticado na mesma proporção para todos. A origem do sinal é o
 * serviço do span pai visível (o pai de banco é pulado, como no Painel); consumo de mensagem de
 * outro serviço passa pelo RabbitMQ.
 */
export function eventosDoTrace(trace: Trace, alvoMs = duracaoAlvoMs): EventoReproducao[] {
  const porId = new Map(trace.spans.map((span) => [span.spanId, span]));
  const inicios = new Map(trace.spans.map((span) => [span.spanId, instanteMs(span.startedAt)]));
  const origem = Math.min(...inicios.values());
  const fim = Math.max(...trace.spans.map((span) => inicios.get(span.spanId)! + span.durationMs));
  const escala = fim > origem ? alvoMs / (fim - origem) : 0;

  const paiVisivel = (span: Span): Span | undefined => {
    const vistos = new Set<string>();
    let id = span.parentSpanId;
    while (id && !vistos.has(id)) {
      vistos.add(id);
      const pai = porId.get(id);
      if (!pai) {
        return undefined;
      }
      if (!isDatabaseSpan(pai)) {
        return pai;
      }
      id = pai.parentSpanId;
    }
    return undefined;
  };

  return trace.spans
    .filter((span) => !isDatabaseSpan(span) && servicoPorNome[span.service])
    .map((span) => ({ span, instante: inicios.get(span.spanId)! - origem }))
    .sort((a, b) => a.instante - b.instante)
    .map(({ span, instante }) => {
      const destino: NoId = servicoPorNome[span.service];
      const pai = paiVisivel(span);
      const origemNo: NoId = (pai && servicoPorNome[pai.service]) ?? destino;
      return {
        inicioMs: Math.round(instante * escala),
        origem: origemNo,
        destino,
        viaBroker: origemNo !== destino && span.name.startsWith("process "),
        marca: `+${segundos.format(instante / 1000)} s`,
        operacao: span.name,
        duracao: formatMs(span.durationMs),
        portao: false,
      };
    });
}

type Passo = [inicioMs: number, origem: NoId, destino: NoId, operacao: string, portao?: true];

/**
 * Uma fase com agentes, como documentada em agents/fluxo-fase.md da claude-works. É roteiro, não
 * gravação: a página diz isso ao lado da reprodução.
 */
const passosDaFase: readonly Passo[] = [
  [0, "base", "orquestrador", "lê o prompt da fase, o CLAUDE.md e a base"],
  [1300, "orquestrador", "pesquisador", "levanta fatos externos com fonte e data"],
  [2700, "pesquisador", "orquestrador", "spec, plano e tarefas em PR rascunho"],
  [3800, "orquestrador", "cleber", "cards e OK do Cleber na spec", true],
  [6600, "cleber", "implementador", "OK recebido: código na ordem das tarefas"],
  [7600, "implementador", "agenda", "domínio, endpoints, eventos e testes no careflow"],
  [9000, "agenda", "qa", "tenta quebrar: concorrência, outra clínica, entrada inválida"],
  [10300, "qa", "seguranca", "OWASP, LGPD, segredos e licenças; pode bloquear"],
  [11500, "seguranca", "revisor", "corretude, arquitetura e aderência à spec"],
  [12700, "revisor", "cleber", "PR com CI verde para revisão e merge do Cleber", true],
  [15200, "cleber", "redator", "post do diário com fatos conferidos"],
  [16300, "redator", "site", "PR do site, depois do careflow"],
  [17500, "orquestrador", "curador", "decisões, lições e prompt da próxima fase"],
  [18500, "curador", "base", "base claude-works atualizada"],
];

export function eventosDaFase(): EventoReproducao[] {
  return passosDaFase.map(([inicioMs, origem, destino, operacao, portao], index) => ({
    inicioMs,
    origem,
    destino,
    viaBroker: false,
    marca: `passo ${index + 1}`,
    operacao,
    duracao: "",
    portao: portao === true,
  }));
}

const fluxoDaFase =
  "https://github.com/cleberSan/claude-works/blob/main/agents/fluxo-fase.md" as const;

export function buildReproducoes(): readonly Reproducao[] {
  const gravacao = {
    tipo: "gravacao" as const,
    rotulo: `gravação do CI de ${formatRecordedAt(recording.recordedAt)}, commit ${recording.commit.slice(0, 8)}`,
    href: commitUrl(recording.commit),
  };
  return [
    {
      id: "reserva",
      nome: "Reserva de consulta",
      descricao:
        "Uma paciente sintética reserva uma consulta: agenda, auditoria, cofre do paciente e a notificação pelo WhatsApp.",
      regiao: "careflow",
      fonte: gravacao,
      duracaoMs: duracaoAlvoMs,
      eventos: eventosDoTrace(recording.booking.trace),
    },
    {
      id: "revogacao",
      nome: "Revogação do consentimento",
      descricao:
        "A paciente revoga o consentimento da agenda: o evento cancela as consultas, avisa por notificação e fica auditado.",
      regiao: "careflow",
      fonte: gravacao,
      duracaoMs: duracaoAlvoMs,
      eventos: eventosDoTrace(recording.revocation.trace),
    },
    {
      id: "fallback",
      nome: "WhatsApp cai, SMS assume",
      descricao:
        "O WhatsApp falha de propósito no teste e a notificação segue por SMS, sem perder o aviso.",
      regiao: "careflow",
      fonte: gravacao,
      duracaoMs: duracaoAlvoMs,
      eventos: eventosDoTrace(recording.resilience.fallbackTrace),
    },
    {
      id: "triagem",
      nome: "Triagem com IA",
      descricao:
        "A triagem confere o consentimento de IA, busca o perfil pseudonimizado e chama o modelo, aqui com a resposta gravada do CI, auditando o que saiu.",
      regiao: "careflow",
      fonte: gravacao,
      duracaoMs: duracaoAlvoMs,
      eventos: eventosDoTrace(recording.triage.trace),
    },
    {
      id: "agentes",
      nome: "Uma fase com agentes",
      descricao:
        "Como uma fase do CareFlow anda: agentes com um papel só cada, e o Cleber aprovando a spec e o merge.",
      regiao: "agentes",
      fonte: {
        tipo: "roteiro",
        rotulo: "roteiro documentado em agents/fluxo-fase.md",
        href: fluxoDaFase,
      },
      duracaoMs: 20_000,
      eventos: eventosDaFase(),
    },
  ];
}
