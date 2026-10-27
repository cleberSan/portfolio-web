import { qualityPipeline } from "@/content/engineering";

/** Painel com o caminho de uma mudança até produção e os portões reais do CI deste site. */
export function QualityPipeline() {
  return (
    <figure className="border-border bg-background overflow-hidden rounded-xl border">
      <figcaption className="border-border flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
        <span className="font-semibold">Pipeline deste site</span>
        <span className="text-muted font-mono text-xs">claude code · pull request · ci</span>
      </figcaption>
      <ol
        aria-label="Etapas até produção"
        className="border-border grid grid-cols-2 gap-px border-b sm:grid-cols-4"
      >
        {qualityPipeline.stages.map((stage, index) => (
          <li key={stage} className="space-y-1 px-4 py-3">
            <span className="text-accent block font-mono text-xs">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="block text-sm leading-snug">{stage}</span>
          </li>
        ))}
      </ol>
      <ul
        aria-label="Portões do CI"
        className="grid grid-cols-1 gap-x-6 gap-y-2 px-4 py-4 font-mono text-sm min-[420px]:grid-cols-2"
      >
        {qualityPipeline.gates.map((gate) => (
          <li key={gate.label} className="flex items-baseline justify-between gap-3">
            <span>
              <span aria-hidden="true" className="text-ok mr-2">
                ✓
              </span>
              {gate.label}
            </span>
            <span className="text-ok text-xs">obrigatório</span>
          </li>
        ))}
      </ul>
      <p className="text-muted border-border border-t px-4 py-3 text-xs leading-relaxed">
        A branch principal é protegida: só entra o que passa em todos os portões.
      </p>
    </figure>
  );
}
