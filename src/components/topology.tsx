import { careflow } from "@/content/careflow";
import { careflowServicesEn } from "@/content/careflow.en";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

const width = 520;
const height = 420;
const center = { x: width / 2, y: height / 2 };
const radius = { x: 180, y: 160 };
const node = { width: 150, height: 44 };
const hub = { width: 150, height: 56 };

/** Arestas que mostram mensagens circulando; o sentido alterna para lembrar publicar e consumir. */
const pulsingEdges = new Set([0, 2, 3, 5]);

type Point = { x: number; y: number };

/** Serviços distribuídos numa elipse em volta do barramento, começando no topo. */
export function layoutNodes(count: number): Point[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return {
      x: Math.round(center.x + radius.x * Math.cos(angle)),
      y: Math.round(center.y + radius.y * Math.sin(angle)),
    };
  });
}

type TopologyProps = {
  /** Identificador único na página, para o título e a descrição do SVG. */
  id: string;
  className?: string;
  locale?: Locale;
};

/** Serviços com nome e sinal no idioma da página. */
export function topologyServices(locale: Locale): readonly { name: string; signal: string }[] {
  return careflow.services.map((service) =>
    locale === "en" ? careflowServicesEn[service.name] : service,
  );
}

/**
 * Topologia do CareFlow: os serviços em volta do RabbitMQ, com mensagens indo e voltando.
 * A animação é só CSS (`.topology-pulse` em `globals.css`) e para com movimento reduzido.
 */
export function Topology({ id, className, locale = "pt-BR" }: TopologyProps) {
  const services = topologyServices(locale);
  const text = dictionaries[locale].topology;
  const points = layoutNodes(services.length);
  const titleId = `${id}-titulo`;
  const descId = `${id}-descricao`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className={className}
    >
      <title id={titleId}>{text.title}</title>
      <desc id={descId}>
        {text.description(services.length, services.map((service) => service.name).join(", "))}
      </desc>

      {points.map((point, index) => (
        <line
          key={`aresta-${services[index].name}`}
          x1={center.x}
          y1={center.y}
          x2={point.x}
          y2={point.y}
          className="stroke-accent/30"
          strokeWidth={1.25}
          strokeDasharray="3 5"
        />
      ))}

      {points.map((point, index) => {
        if (!pulsingEdges.has(index)) {
          return null;
        }
        const outbound = index % 2 === 0;
        const [from, to] = outbound ? [center, point] : [point, center];
        return (
          <circle
            key={`pulso-${services[index].name}`}
            r={4}
            className="topology-pulse fill-accent"
            style={{
              offsetPath: `path("M${from.x} ${from.y} L${to.x} ${to.y}")`,
              animationDelay: `${-index * 0.9}s`,
            }}
          />
        );
      })}

      <g>
        <rect
          x={center.x - hub.width / 2}
          y={center.y - hub.height / 2}
          width={hub.width}
          height={hub.height}
          rx={8}
          className="fill-background stroke-accent"
          strokeWidth={1.5}
        />
        <text
          x={center.x}
          y={center.y - 3}
          textAnchor="middle"
          className="fill-foreground font-sans text-[16px] font-semibold"
        >
          RabbitMQ
        </text>
        <text
          x={center.x}
          y={center.y + 16}
          textAnchor="middle"
          className="fill-muted font-mono text-[12px]"
        >
          Outbox · Inbox
        </text>
      </g>

      {services.map((service, index) => {
        const point = points[index];
        return (
          <g key={service.name}>
            <rect
              x={point.x - node.width / 2}
              y={point.y - node.height / 2}
              width={node.width}
              height={node.height}
              rx={6}
              className="fill-surface stroke-border"
              strokeWidth={1.25}
            />
            <text
              x={point.x}
              y={point.y - 3}
              textAnchor="middle"
              className="fill-foreground font-sans text-[14px] font-semibold"
            >
              {service.name}
            </text>
            <text
              x={point.x}
              y={point.y + 13}
              textAnchor="middle"
              className="fill-muted font-mono text-[11px]"
            >
              {service.signal}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
