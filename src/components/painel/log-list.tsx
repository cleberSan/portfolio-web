import { serviceName, type LogLine } from "@/content/painel";

/** Linhas de log exportadas no mesmo trace, como o Loki devolveria. */
export function LogList({ logs, label }: { logs: readonly LogLine[]; label: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="bg-surface border-border max-h-80 overflow-auto rounded-lg border p-4"
    >
      <ol className="space-y-2 font-mono text-xs leading-relaxed">
        {logs.map((log, index) => (
          <li key={index}>
            <span className="text-muted">
              {log.at.slice(11, 23)} · {serviceName(log.service)}
              {log.severity ? ` · ${log.severity}` : ""}
            </span>
            <span className="block break-words">{log.message}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
