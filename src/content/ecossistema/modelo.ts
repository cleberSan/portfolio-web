/**
 * Modelo da página /ecossistema (spec 0001): ids, tipos e nomes dos nós. Este arquivo não importa
 * dados, então os componentes de cliente podem usá-lo sem levar a gravação do CI para o navegador.
 */

export const regiaoIds = ["careflow", "agentes", "portfolio", "lojinha", "claude-works"] as const;
export type RegiaoId = (typeof regiaoIds)[number];

export const servicoIds = [
  "demo",
  "agenda",
  "cofre",
  "consentimento",
  "notificacoes",
  "auditoria",
  "triagem",
  "titular",
] as const;
export type ServicoId = (typeof servicoIds)[number];

export const agenteIds = [
  "orquestrador",
  "pesquisador",
  "implementador",
  "qa",
  "seguranca",
  "revisor",
  "redator",
  "curador",
] as const;
export type AgenteId = (typeof agenteIds)[number];

export type NoId = ServicoId | AgenteId | "rabbitmq" | "cleber" | "site" | "loja" | "base";

/** O portão humano fica fora das regiões: é o Cleber aprovando spec e merge. */
export type GrupoDoNo = RegiaoId | "portao";

export type No = { nome: string; grupo: GrupoDoNo };

export const nos: Readonly<Record<NoId, No>> = {
  demo: { nome: "Demo (BFF do Painel)", grupo: "careflow" },
  agenda: { nome: "Agenda", grupo: "careflow" },
  cofre: { nome: "Cofre do paciente", grupo: "careflow" },
  consentimento: { nome: "Consentimento", grupo: "careflow" },
  notificacoes: { nome: "Notificações", grupo: "careflow" },
  auditoria: { nome: "Auditoria", grupo: "careflow" },
  triagem: { nome: "Triagem", grupo: "careflow" },
  titular: { nome: "Pedidos do titular", grupo: "careflow" },
  rabbitmq: { nome: "RabbitMQ", grupo: "careflow" },
  orquestrador: { nome: "orquestrador", grupo: "agentes" },
  pesquisador: { nome: "pesquisador-fatos", grupo: "agentes" },
  implementador: { nome: "implementador", grupo: "agentes" },
  qa: { nome: "qa-destrutivo", grupo: "agentes" },
  seguranca: { nome: "guardiao-seguranca", grupo: "agentes" },
  revisor: { nome: "revisor-staff", grupo: "agentes" },
  redator: { nome: "redator-tecnico", grupo: "agentes" },
  curador: { nome: "curador-kb", grupo: "agentes" },
  cleber: { nome: "Cleber (portão)", grupo: "portao" },
  site: { nome: "portfolio-web", grupo: "portfolio" },
  loja: { nome: "Lojinha Da Lua", grupo: "lojinha" },
  base: { nome: "claude-works", grupo: "claude-works" },
};

export type RegiaoLink = { rotulo: string; href: string };

export type Regiao = {
  id: RegiaoId;
  nome: string;
  /** O que a região é no ecossistema, em duas ou três palavras. */
  papel: string;
  resumo: string;
  estado: string;
  stack: readonly string[];
  links: readonly RegiaoLink[];
};

export type EventoReproducao = {
  /** Instante do evento na reprodução, já esticada para ser vista. */
  inicioMs: number;
  origem: NoId;
  destino: NoId;
  /** Mensagem consumida de outro serviço: o sinal passa pelo RabbitMQ. */
  viaBroker: boolean;
  /** Rótulo do instante no registro: "+0,234 s" na gravação, "passo 3" no roteiro. */
  marca: string;
  operacao: string;
  /** Duração gravada do span ("233,2 ms"); vazia no roteiro. */
  duracao: string;
  /** Passo em que o fluxo espera o Cleber. */
  portao: boolean;
};

export type ReproducaoId = "reserva" | "revogacao" | "fallback" | "triagem" | "agentes";

export type FonteReproducao =
  | { tipo: "gravacao"; rotulo: string; href?: string }
  | { tipo: "roteiro"; rotulo: string; href: string };

export type Reproducao = {
  id: ReproducaoId;
  nome: string;
  descricao: string;
  regiao: RegiaoId;
  fonte: FonteReproducao;
  duracaoMs: number;
  eventos: readonly EventoReproducao[];
};

export type Fonte = { rotulo: string; href: string };

/** Resposta do Sinapse, escrita antes e revisada no PR (ADR-0009). */
export type RespostaGravada = {
  id: string;
  /** Pergunta que aparece como sugestão e como título na lista sem JavaScript. */
  pergunta: string;
  /** Palavras-chave da busca local, com peso de 1 a 3. */
  chaves: Readonly<Record<string, number>>;
  texto: string;
  /** Região que a cena destaca quando a resposta aparece. */
  regiao: RegiaoId | null;
  /** Reprodução que a cena toca junto com a resposta. */
  reproducao: ReproducaoId | null;
  fontes: readonly Fonte[];
};
