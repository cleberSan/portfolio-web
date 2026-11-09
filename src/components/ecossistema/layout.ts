import { agenteIds, nos, servicoIds, type NoId, type RegiaoId } from "@/content/ecossistema/modelo";

/**
 * Onde cada região e cada nó ficam no mapa de /ecossistema, visto de cima: frente do cérebro no
 * alto, CareFlow no hemisfério esquerdo e o resto do ecossistema no direito. Coordenadas na caixa
 * do SVG (400 × 300); a cena 3D parte das mesmas posições.
 */

export const caixa = { largura: 400, altura: 300 } as const;

export type Ponto = { x: number; y: number };
export type Elipse = { cx: number; cy: number; rx: number; ry: number };

export const hemisferios: readonly Elipse[] = [
  { cx: 105, cy: 150, rx: 92, ry: 130 },
  { cx: 295, cy: 150, rx: 92, ry: 130 },
];

export type Zona = Elipse & { rotulo: Ponto; nomeCurto: string };

export const zonas: Readonly<Record<RegiaoId, Zona>> = {
  careflow: { cx: 105, cy: 160, rx: 80, ry: 108, rotulo: { x: 105, y: 64 }, nomeCurto: "CareFlow" },
  agentes: { cx: 295, cy: 92, rx: 62, ry: 58, rotulo: { x: 295, y: 46 }, nomeCurto: "Agentes" },
  portfolio: {
    cx: 250,
    cy: 198,
    rx: 38,
    ry: 28,
    rotulo: { x: 250, y: 216 },
    nomeCurto: "portfolio-web",
  },
  lojinha: { cx: 340, cy: 198, rx: 38, ry: 28, rotulo: { x: 340, y: 216 }, nomeCurto: "Lojinha" },
  "claude-works": {
    cx: 295,
    cy: 250,
    rx: 50,
    ry: 20,
    rotulo: { x: 295, y: 265 },
    nomeCurto: "claude-works",
  },
};

function anel(
  centro: Ponto,
  raio: number,
  ids: readonly NoId[],
): ReadonlyArray<readonly [NoId, Ponto]> {
  return ids.map((id, index) => {
    const angulo = -Math.PI / 2 + (index * 2 * Math.PI) / ids.length;
    const ponto = {
      x: Math.round((centro.x + raio * Math.cos(angulo)) * 10) / 10,
      y: Math.round((centro.y + raio * Math.sin(angulo)) * 10) / 10,
    };
    return [id, ponto] as const;
  });
}

const centroDoCareflow: Ponto = { x: 105, y: 165 };
const centroDosAgentes: Ponto = { x: 295, y: 96 };

export const posicoes: Readonly<Record<NoId, Ponto>> = Object.fromEntries([
  ...anel(centroDoCareflow, 58, servicoIds),
  ["rabbitmq", centroDoCareflow],
  ["orquestrador", centroDosAgentes],
  ...anel(
    centroDosAgentes,
    38,
    agenteIds.filter((id) => id !== "orquestrador"),
  ),
  ["site", { x: 250, y: 192 }],
  ["loja", { x: 340, y: 192 }],
  ["base", { x: 295, y: 244 }],
  ["cleber", { x: 200, y: 34 }],
]) as Record<NoId, Ponto>;

/** Região do nó, ou nada para o portão do Cleber, que fica entre os hemisférios. */
export function regiaoDoNo(id: NoId): RegiaoId | null {
  const grupo = nos[id].grupo;
  return grupo === "portao" ? null : grupo;
}
