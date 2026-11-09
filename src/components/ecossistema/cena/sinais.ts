import type { EventoReproducao, NoId } from "@/content/ecossistema/modelo";
import type { Vetor } from "./cerebro";

/**
 * Sinais da cena 3D (spec 0001, CA-06): cada passo da reprodução vira um pulso que sai do nó de
 * origem e chega ao de destino num arco sobre o cérebro, passando pelo RabbitMQ quando a mensagem
 * é consumida de outro serviço. Puro: a cena só pergunta onde cada pulso está no instante atual.
 */

/** Quanto um pulso leva da origem ao destino, já no tempo esticado da reprodução. */
export const duracaoDoPulsoMs = 900;
/** Teto de pulsos simultâneos; na revogação, dezenas de passos caem no mesmo segundo. */
export const maximoDePulsos = 24;

export type Pulso = { indice: number; progresso: number };

/** Pulsos em voo em `tempoMs`, do mais antigo ao mais novo, no máximo `maximo`. */
export function pulsosAtivos(
  eventos: readonly EventoReproducao[],
  tempoMs: number,
  maximo = maximoDePulsos,
): Pulso[] {
  const ativos: Pulso[] = [];
  for (const [indice, evento] of eventos.entries()) {
    const decorrido = tempoMs - evento.inicioMs;
    if (decorrido < 0) {
      break;
    }
    if (decorrido < duracaoDoPulsoMs) {
      ativos.push({ indice, progresso: decorrido / duracaoDoPulsoMs });
    }
  }
  return ativos.slice(-maximo);
}

/** Ponto de um arco quadrático de `a` a `b`, mais alto quanto mais longe estão. */
export function pontoNoArco(a: Vetor, b: Vetor, t: number): Vetor {
  const distancia = Math.hypot(b[0] - a[0], b[2] - a[2]);
  const meio: Vetor = [
    (a[0] + b[0]) / 2,
    Math.max(a[1], b[1]) + 0.15 + distancia * 0.35,
    (a[2] + b[2]) / 2,
  ];
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * meio[0] + t * t * b[0],
    u * u * a[1] + 2 * u * t * meio[1] + t * t * b[1],
    u * u * a[2] + 2 * u * t * meio[2] + t * t * b[2],
  ];
}

/** Onde o pulso do evento está com `progresso` de 0 a 1; parado no nó quando não sai dele. */
export function posicaoDoPulso(
  evento: EventoReproducao,
  progresso: number,
  ancoras: Readonly<Record<NoId, Vetor>>,
): Vetor {
  const t = Math.min(1, Math.max(0, progresso));
  const origem = ancoras[evento.origem];
  const destino = ancoras[evento.destino];
  if (evento.origem === evento.destino) {
    return origem;
  }
  if (!evento.viaBroker) {
    return pontoNoArco(origem, destino, t);
  }
  const broker = ancoras.rabbitmq;
  return t < 0.5 ? pontoNoArco(origem, broker, t * 2) : pontoNoArco(broker, destino, t * 2 - 1);
}

/** Nós acesos pelos pulsos em voo: origem, destino e o broker no meio do caminho. */
export function nosAcesos(
  eventos: readonly EventoReproducao[],
  pulsos: readonly Pulso[],
): Set<NoId> {
  const acesos = new Set<NoId>();
  for (const { indice } of pulsos) {
    const evento = eventos[indice];
    acesos.add(evento.origem);
    acesos.add(evento.destino);
    if (evento.viaBroker) {
      acesos.add("rabbitmq");
    }
  }
  return acesos;
}

/** Teto de ligações desenhadas; cada uma vira um arco fino e fixo entre dois nós. */
export const maximoDeLigacoes = 48;

/**
 * Ligações por onde a reprodução passa, sem repetir, na ordem em que aparecem: o caminho que os
 * pulsos percorrem fica desenhado de leve, como as conexões entre neurônios.
 */
export function ligacoesDaReproducao(
  eventos: readonly EventoReproducao[],
  maximo = maximoDeLigacoes,
): [NoId, NoId][] {
  const vistas = new Set<string>();
  const ligacoes: [NoId, NoId][] = [];
  const incluir = (de: NoId, para: NoId) => {
    const chave = `${de}>${para}`;
    if (de !== para && !vistas.has(chave) && ligacoes.length < maximo) {
      vistas.add(chave);
      ligacoes.push([de, para]);
    }
  };
  for (const evento of eventos) {
    if (evento.viaBroker) {
      incluir(evento.origem, "rabbitmq");
      incluir("rabbitmq", evento.destino);
    } else {
      incluir(evento.origem, evento.destino);
    }
  }
  return ligacoes;
}
