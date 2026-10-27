import { buildWaterfall, formatMs, serviceName, type Trace } from "@/content/painel";

type TraceWaterfallProps = {
  trace: Trace;
  /** Nome curto da região rolável, para leitores de tela. */
  label: string;
};

/**
 * Trace gravado como tabela: cada linha é um span, com serviço, operação, início e duração.
 * A barra é só visual (`aria-hidden`); os números ficam nas colunas para quem não vê a barra.
 */
export function TraceWaterfall({ trace, label }: TraceWaterfallProps) {
  const waterfall = buildWaterfall(trace);
  const total = Math.max(waterfall.totalMs, 1);

  return (
    <figure className="space-y-3">
      <figcaption className="text-muted text-sm leading-relaxed">
        Trace <code className="font-mono text-xs break-all">{trace.traceId}</code>:{" "}
        {waterfall.rows.length} spans em {waterfall.services.length} serviços, {formatMs(total)} do
        primeiro ao último. {waterfall.hiddenDatabaseSpans} spans de banco ficaram de fora da
        tabela.
      </figcaption>
      <div
        role="region"
        aria-label={label}
        tabIndex={0}
        className="border-border relative overflow-x-auto rounded-lg border"
      >
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead className="bg-surface">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">
                Serviço
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Operação
              </th>
              <th scope="col" className="w-1/3 px-3 py-2 font-medium">
                <span className="sr-only">Linha do tempo</span>
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Início
              </th>
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Duração
              </th>
            </tr>
          </thead>
          <tbody>
            {waterfall.rows.map((row) => (
              <tr key={row.spanId} className="border-border border-t align-top">
                <td className="px-3 py-2 whitespace-nowrap">{serviceName(row.service)}</td>
                <td className="px-3 py-2">
                  <span className="block" style={{ paddingLeft: `${Math.min(row.depth, 8)}rem` }}>
                    <span className="font-mono text-xs">{row.name}</span>
                    {row.status === "error" ? (
                      <span className="text-muted ml-2 text-xs">(erro)</span>
                    ) : null}
                    {row.events.map((event, index) => (
                      <span key={index} className="text-accent block text-xs font-medium">
                        {describeEvent(event.name, event.attributes)}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div aria-hidden="true" className="bg-surface relative h-2 rounded">
                    <div
                      className="bg-accent absolute h-2 rounded"
                      style={{
                        left: `${(row.offsetMs / total) * 100}%`,
                        width: `${Math.max((row.durationMs / total) * 100, 0.5)}%`,
                      }}
                    />
                  </div>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap">
                  {formatMs(row.offsetMs)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs whitespace-nowrap">
                  {formatMs(row.durationMs)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

export function describeEvent(name: string, attributes: Readonly<Record<string, string>>): string {
  if (name === "fallback" && attributes.from && attributes.to) {
    return `fallback: ${attributes.from} → ${attributes.to}`;
  }
  if (name.startsWith("circuit ")) {
    return `circuit breaker${attributes.channel ? ` do ${attributes.channel}` : ""}: ${name.slice(8)}`;
  }
  return name;
}
