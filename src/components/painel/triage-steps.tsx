import {
  guardrailLabel,
  modelStatusLabel,
  priorityLabel,
  reviewLabel,
  sourceLabel,
  triageScenarioLabel,
  type AuditEntry,
  type TriageStep,
} from "@/content/painel";

type TriageStepsProps = {
  steps: readonly TriageStep[];
  audit: readonly AuditEntry[];
};

function Field({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-muted text-sm">{term}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * Cada triagem gravada: o que o paciente escreveu, o que saiu para o modelo (ou por que nada
 * saiu), a sugestão, as proteções acionadas e a decisão do profissional. O resumo SHA-256 é o
 * mesmo que está na trilha de auditoria.
 */
export function TriageSteps({ steps, audit }: TriageStepsProps) {
  const digests = new Set(
    audit.flatMap((entry) => (entry.contentDigest ? [entry.contentDigest] : [])),
  );

  return (
    <ol className="list-none space-y-6">
      {steps.map((step, index) => {
        const { submitted, reviewed } = step;
        const inTrail = submitted.promptDigest !== null && digests.has(submitted.promptDigest);
        return (
          <li key={submitted.id}>
            <article
              aria-labelledby={`triagem-${index}`}
              className="border-border space-y-4 rounded-lg border p-4"
            >
              <h3 id={`triagem-${index}`} className="text-lg font-semibold">
                {String.fromCharCode(97 + index)}) {triageScenarioLabel(step.scenario)}
              </h3>
              <dl className="grid gap-4 md:grid-cols-2">
                <Field term="O que o paciente escreveu">
                  <blockquote className="border-border border-l-2 pl-3 italic">
                    {step.complaint}
                  </blockquote>
                </Field>
                <Field term="O que saiu para o modelo">
                  {submitted.sentToModel === null ? (
                    <p>Nada saiu da clínica.</p>
                  ) : (
                    <code
                      data-testid="enviado-ao-modelo"
                      className="bg-surface block rounded px-2 py-1 font-mono text-xs break-words"
                    >
                      {submitted.sentToModel}
                    </code>
                  )}
                  <p className="text-muted mt-1 text-sm">
                    Faixa etária {submitted.ageBand}, sem nome, pseudônimo ou clínica.
                    {inTrail
                      ? ` Resumo na auditoria: ${submitted.promptDigest!.slice(0, 12)}…`
                      : null}
                  </p>
                </Field>
                <Field term="Modelo">
                  <p>{modelStatusLabel(submitted.modelStatus)}</p>
                </Field>
                <Field term="Sugestão">
                  <p>
                    <strong>{priorityLabel(submitted.suggestedPriority)}</strong>, origem{" "}
                    {sourceLabel(submitted.source)}
                  </p>
                  {submitted.rationale ? (
                    <p className="text-muted mt-1 text-sm">{submitted.rationale}</p>
                  ) : null}
                </Field>
                <Field term="Proteções acionadas">
                  {submitted.guardrails.length === 0 ? (
                    <p>Nenhuma.</p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-5 text-sm">
                      {submitted.guardrails.map((guardrail) => (
                        <li key={guardrail}>{guardrailLabel(guardrail)}</li>
                      ))}
                    </ul>
                  )}
                </Field>
                <Field term="Profissional de saúde">
                  <p data-testid="decisao">
                    <strong>{reviewLabel(reviewed)}</strong>
                  </p>
                </Field>
              </dl>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
