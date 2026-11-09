import { nos, type EventoReproducao } from "@/content/ecossistema/modelo";

/**
 * Linha do tempo das reproduções de /ecossistema (spec 0001, CA-06): quantos passos já aconteceram
 * num instante e como cada passo se escreve no registro. Puro, para o servidor e o cliente.
 */

/** Tempo depois do último passo para o sinal chegar ao destino antes de a reprodução acabar. */
export const caudaMs = 1500;

export function fimDaReproducao(duracaoMs: number): number {
  return duracaoMs + caudaMs;
}

/** Quantos passos começaram até `tempoMs`. Os eventos chegam em ordem de início. */
export function passosAte(eventos: readonly EventoReproducao[], tempoMs: number): number {
  let passos = 0;
  while (passos < eventos.length && eventos[passos].inicioMs <= tempoMs) {
    passos += 1;
  }
  return passos;
}

/** Caminho do sinal em texto: "Agenda → RabbitMQ → Notificações", ou só o nó quando não sai dele. */
export function caminhoDoEvento(evento: EventoReproducao): string {
  if (evento.origem === evento.destino) {
    return nos[evento.origem].nome;
  }
  const meio = evento.viaBroker ? ` → ${nos.rabbitmq.nome}` : "";
  return `${nos[evento.origem].nome}${meio} → ${nos[evento.destino].nome}`;
}

/** O que o passo fez, com a duração gravada e o portão do Cleber quando houver. */
export function detalheDoEvento(evento: EventoReproducao): string {
  const duracao = evento.duracao ? ` (${evento.duracao})` : "";
  const portao = evento.portao ? " · espera o OK do Cleber" : "";
  return `${evento.operacao}${duracao}${portao}`;
}
