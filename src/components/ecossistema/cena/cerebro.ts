import { nos, regiaoIds, type NoId, type RegiaoId } from "@/content/ecossistema/modelo";
import { hemisferios, posicoes, regiaoDoNo, zonas, type Ponto } from "../layout";

/**
 * Geometria do cérebro da cena 3D de /ecossistema (spec 0001, CA-04). Puro e sem WebGL, para ser
 * testado: gera a nuvem de pontos de dois hemisférios a partir de uma semente fixa (a mesma forma
 * em toda visita) e atribui cada ponto à região do mapa 2D que fica embaixo dele.
 */

export type Vetor = readonly [x: number, y: number, z: number];

/** Ponto fora de qualquer região: fica na cor neutra do monitor. */
export const semRegiao = 255;

export const pontosNoComputador = 6000;
export const pontosNoCelular = 2500;

/** Escala do mapa 2D (400 × 300) para a cena: 100 unidades do SVG viram 1 unidade 3D. */
const escala = 100;
const centro: Ponto = { x: 200, y: 150 };

/** Altura dos hemisférios; largura e profundidade vêm das elipses do mapa 2D, um pouco menores. */
const alturaDoHemisferio = 0.8;
const encolhimento = 0.95;
/** Corte da base: o cérebro fica achatado embaixo, como visto de lado. */
const baseMinima = -0.45;

export type Cerebro = {
  /** x, y, z de cada ponto, em sequência. */
  posicoes: Float32Array;
  /** Índice da região em `regiaoIds`, ou `semRegiao`. */
  regioes: Uint8Array;
  /** Brilho de 0 a 1 que desenha os giros na superfície. */
  brilho: Float32Array;
  total: number;
};

/** Gerador pseudoaleatório pequeno e determinístico (mulberry32). */
export function aleatorio(semente: number): () => number {
  let estado = semente >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function paraCena(ponto: Ponto): { x: number; z: number } {
  return { x: (ponto.x - centro.x) / escala, z: (ponto.y - centro.y) / escala };
}

export function paraMapa(x: number, z: number): Ponto {
  return { x: x * escala + centro.x, y: z * escala + centro.y };
}

const hemisferios3d = hemisferios.map((elipse) => ({
  cx: (elipse.cx - centro.x) / escala,
  rx: (elipse.rx / escala) * encolhimento,
  rz: (elipse.ry / escala) * encolhimento,
}));

/**
 * No mapa 2D cada hemisfério é largo, para caberem as regiões; na cena ele é estreitado de lado e
 * os dois se encostam na fissura, com as proporções de um cérebro visto de cima. As regiões são
 * calculadas antes, no espaço do mapa, e só a posição desenhada muda.
 */
const estreitamento = 0.7;
const folgaDaFissura = 0.04;

export function paraExibicao(x: number): number {
  if (x === 0) {
    return 0;
  }
  const h = hemisferios3d[x < 0 ? 0 : 1];
  const centroExibido = Math.sign(h.cx) * (folgaDaFissura + h.rx * estreitamento);
  return centroExibido + (x - h.cx) * estreitamento;
}

/** Volta da posição desenhada para a do mapa: o inverso de `paraExibicao`. */
export function deExibicao(x: number): number {
  if (x === 0) {
    return 0;
  }
  const h = hemisferios3d[x < 0 ? 0 : 1];
  const centroExibido = Math.sign(h.cx) * (folgaDaFissura + h.rx * estreitamento);
  return h.cx + (x - centroExibido) / estreitamento;
}

/** Mais baixo na frente e atrás, como os polos do cérebro. */
function fatorDeAltura(dz: number): number {
  return 1 - 0.22 * dz * dz;
}

/** Ordem de teste: zonas pequenas antes da grande, para o ponto cair na mais específica. */
const ordemDasZonas: readonly RegiaoId[] = [
  "agentes",
  "portfolio",
  "lojinha",
  "claude-works",
  "careflow",
];

export function regiaoEmbaixo(x: number, z: number): RegiaoId | null {
  const { x: px, y: py } = paraMapa(x, z);
  for (const id of ordemDasZonas) {
    const zona = zonas[id];
    const dx = (px - zona.cx) / zona.rx;
    const dy = (py - zona.cy) / zona.ry;
    if (dx * dx + dy * dy <= 1) {
      return id;
    }
  }
  return null;
}

/** Altura da superfície do hemisfério em (x, z), ou nada fora dos dois hemisférios. */
export function alturaDaSuperficie(x: number, z: number): number | null {
  for (const h of hemisferios3d) {
    const dx = (x - h.cx) / h.rx;
    const dz = z / h.rz;
    const resto = 1 - dx * dx - dz * dz;
    if (resto >= 0) {
      return alturaDoHemisferio * fatorDeAltura(dz) * Math.sqrt(resto);
    }
  }
  return null;
}

/**
 * Linhas dos giros: contornos de uma soma de ondas tortas sobre a direção do ponto. Perto de zero,
 * o ponto está numa dobra; as dobras formam as curvas que fazem a nuvem parecer um cérebro.
 */
export function dobra(dx: number, dy: number, dz: number): number {
  return (
    0.6 * Math.sin(dz * 9 + 2.2 * Math.sin(dx * 6 + dy * 4)) +
    0.4 * Math.sin(dy * 8 + dx * 5 + 2 * Math.sin(dz * 7))
  );
}

/** Largura da faixa em torno de cada dobra e chance de um ponto fora dela ficar. */
const larguraDaDobra = 0.16;
const chanceForaDaDobra = 0.08;

export function gerarCerebro({
  pontos,
  semente = 20261109,
}: {
  pontos: number;
  semente?: number;
}): Cerebro {
  const sorteio = aleatorio(semente);
  const total = Math.max(0, Math.floor(pontos));
  const posicoesDosPontos = new Float32Array(total * 3);
  const regioes = new Uint8Array(total);
  const brilho = new Float32Array(total);

  for (let i = 0; i < total; i += 1) {
    const h = hemisferios3d[i % 2];
    // Direção na esfera, mais densa sobre as dobras.
    let dx = 0;
    let dy = 0;
    let dz = 0;
    let naDobra = false;
    do {
      const theta = 2 * Math.PI * sorteio();
      // Mais pontos em cima, a parte que a câmera vê; nenhum abaixo do corte da base.
      dy = baseMinima + (1 - baseMinima) * Math.sqrt(sorteio());
      const raio = Math.sqrt(1 - dy * dy);
      dx = raio * Math.cos(theta);
      dz = raio * Math.sin(theta);
      naDobra = Math.abs(dobra(dx, dy, dz)) < larguraDaDobra;
    } while (!(naDobra || sorteio() < chanceForaDaDobra));

    // Face interna achatada, como a fissura entre os hemisférios.
    const interna = dx * h.cx < 0;
    const lateral = interna ? Math.sign(dx) * Math.abs(dx) ** 0.6 : dx;
    const altura = alturaDoHemisferio * fatorDeAltura(dz);

    // A maioria dos pontos fica na superfície; uns poucos preenchem o volume.
    const profundidade = 1 - 0.08 * sorteio() ** 3;
    const relevo = profundidade * (naDobra ? 1.025 : 1);

    const x = h.cx + h.rx * lateral * relevo;
    const y = altura * dy * relevo;
    const z = h.rz * dz * relevo;
    posicoesDosPontos.set([paraExibicao(x), y, z], i * 3);

    const regiao = regiaoEmbaixo(x, z);
    regioes[i] = regiao === null ? semRegiao : regiaoIds.indexOf(regiao);
    const base = naDobra ? 0.85 : 0.35;
    brilho[i] = Math.min(1, Math.max(0.15, base + 0.2 * (sorteio() - 0.5)));
  }

  return { posicoes: posicoesDosPontos, regioes, brilho, total };
}

/** Altura do portão do Cleber, flutuando sobre a fissura entre os hemisférios. */
const alturaDoPortao = 0.95;
/** Os nós ficam um pouco acima da superfície, para não sumirem entre os pontos. */
const folga = 0.06;

/** Posição 3D de cada nó, sobre a superfície do cérebro acima do ponto do mapa 2D. */
export function ancoras(): Readonly<Record<NoId, Vetor>> {
  const resultado = {} as Record<NoId, Vetor>;
  for (const id of Object.keys(nos) as NoId[]) {
    const { x, z } = paraCena(posicoes[id]);
    const altura = regiaoDoNo(id) === null ? alturaDoPortao : alturaDaSuperficie(x, z);
    resultado[id] = [paraExibicao(x), (altura ?? alturaDoPortao) + folga, z];
  }
  return resultado;
}

/**
 * Região sob um raio (em coordenadas do cérebro, já sem o giro), para o clique e o toque. Acha onde
 * o raio cruza a superfície por aproximações sucessivas da altura e lê a região do mapa 2D embaixo.
 * Não depende de acertar um ponto da nuvem, que tem vãos entre as dobras.
 */
export function regiaoNoRaio(origem: Vetor, direcao: Vetor): RegiaoId | null {
  if (direcao[1] >= 0) {
    return null;
  }
  let altura = alturaDoHemisferio;
  let x = 0;
  let z = 0;
  for (let passo = 0; passo < 6; passo += 1) {
    const t = (altura - origem[1]) / direcao[1];
    x = deExibicao(origem[0] + t * direcao[0]);
    z = origem[2] + t * direcao[2];
    altura = alturaDaSuperficie(x, z) ?? 0;
  }
  return alturaDaSuperficie(x, z) === null ? null : regiaoEmbaixo(x, z);
}
