import type { EventoReproducao, NoId, Regiao, RegiaoId } from "@/content/ecossistema/modelo";
import { hemisferios, posicoes, regiaoDoNo, zonas } from "./layout";

type Mapa2DProps = {
  regioes: readonly Regiao[];
  regiaoAtiva: RegiaoId | null;
  /** Passos mais recentes da reprodução, do mais antigo ao atual. */
  recentes: readonly EventoReproducao[];
  /** Clique ou toque numa região; sem ele o mapa é só ilustração (página sem JavaScript). */
  aoSelecionar?: (regiao: RegiaoId) => void;
};

function cor(id: NoId): string {
  const regiao = regiaoDoNo(id);
  return regiao ? `var(--regiao-${regiao})` : "var(--monitor-fg)";
}

function pontosDoCaminho(evento: EventoReproducao): string {
  const paradas: NoId[] = evento.viaBroker
    ? [evento.origem, "rabbitmq", evento.destino]
    : [evento.origem, evento.destino];
  return paradas.map((id) => `${posicoes[id].x},${posicoes[id].y}`).join(" ");
}

/**
 * Mapa 2D de /ecossistema (spec 0001, CA-09): as mesmas regiões e nós da cena 3D, sem animação
 * própria. É ilustração: o nome de cada região, os cartões e o registro estão em texto ao lado, por
 * isso o desenho fica escondido dos leitores de tela.
 */
export function Mapa2D({ regioes, regiaoAtiva, recentes, aoSelecionar }: Mapa2DProps) {
  const atual = recentes.at(-1);
  const acesos = new Set<NoId>(atual ? [atual.origem, atual.destino] : []);
  if (atual?.viaBroker) {
    acesos.add("rabbitmq");
  }

  return (
    <svg
      viewBox="0 0 400 300"
      aria-hidden="true"
      focusable="false"
      data-testid="mapa-2d"
      className="block h-full w-full"
    >
      {hemisferios.map((hemisferio) => (
        <ellipse
          key={hemisferio.cx}
          {...hemisferio}
          fill="none"
          strokeWidth={1.5}
          style={{ stroke: "var(--monitor-border)" }}
        />
      ))}
      {regioes.map((regiao) => {
        const zona = zonas[regiao.id];
        const ativa = regiao.id === regiaoAtiva;
        return (
          <g
            key={regiao.id}
            data-regiao={regiao.id}
            data-ativa={ativa}
            onClick={aoSelecionar ? () => aoSelecionar(regiao.id) : undefined}
            className={aoSelecionar ? "cursor-pointer" : undefined}
          >
            <ellipse
              cx={zona.cx}
              cy={zona.cy}
              rx={zona.rx}
              ry={zona.ry}
              strokeWidth={ativa ? 2 : 1}
              style={{
                fill: `var(--regiao-${regiao.id})`,
                fillOpacity: ativa ? 0.28 : 0.08,
                stroke: `var(--regiao-${regiao.id})`,
                strokeOpacity: ativa ? 0.95 : 0.35,
              }}
            />
            <text
              x={zona.rotulo.x}
              y={zona.rotulo.y}
              textAnchor="middle"
              fontSize={11}
              className="font-mono"
              style={{ fill: `var(--regiao-${regiao.id})` }}
            >
              {zona.nomeCurto}
            </text>
          </g>
        );
      })}
      <text
        x={posicoes.cleber.x}
        y={posicoes.cleber.y - 12}
        textAnchor="middle"
        fontSize={11}
        className="font-mono"
        style={{ fill: "var(--monitor-fg)" }}
      >
        Cleber
      </text>
      {recentes.map((evento, index) =>
        evento.origem === evento.destino ? null : (
          <polyline
            key={`${index}-${evento.inicioMs}`}
            points={pontosDoCaminho(evento)}
            fill="none"
            strokeWidth={evento === atual ? 2 : 1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            data-caminho={evento === atual ? "atual" : "anterior"}
            style={{
              stroke: cor(evento.destino),
              strokeOpacity: ((index + 1) / recentes.length) * 0.9,
            }}
          />
        ),
      )}
      {(Object.keys(posicoes) as NoId[]).map((id) => {
        const { x, y } = posicoes[id];
        const aceso = acesos.has(id);
        return (
          <g key={id} data-no={id} data-aceso={aceso}>
            {aceso ? (
              <circle cx={x} cy={y} r={10} style={{ fill: cor(id), opacity: 0.25 }} />
            ) : null}
            <circle
              cx={x}
              cy={y}
              r={aceso ? 5 : id === "cleber" ? 4.5 : 3}
              style={{ fill: aceso || id === "cleber" ? cor(id) : "var(--monitor-muted)" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
