import {
  channelLabel,
  deadlineDays,
  elapsedMs,
  formatMs,
  outcomeLabel,
  requestKindLabel,
  requestStatusLabel,
  rightsServiceName,
  type RightsFlow,
} from "@/content/painel";

type RightsRequestsProps = {
  flows: readonly RightsFlow[];
};

/**
 * Cada pedido do titular gravado: recebido com prazo, o código que chegou na caixa de entrada
 * simulada, a identidade confirmada e a resposta de cada serviço, com o tempo desde a
 * confirmação. O código mostrado já foi usado e venceu.
 */
export function RightsRequests({ flows }: RightsRequestsProps) {
  return (
    <ol className="list-none space-y-6">
      {flows.map((flow, index) => {
        const { opened, completed } = flow;
        const message = flow.inbox.at(-1);
        const total = elapsedMs(opened.receivedAt, completed.completedAt);
        return (
          <li key={opened.id}>
            <article
              aria-labelledby={`pedido-${index}`}
              className="border-border space-y-4 rounded-lg border p-4"
            >
              <h3 id={`pedido-${index}`} className="text-lg font-semibold">
                {String.fromCharCode(97 + index)}) Pedido de{" "}
                {requestKindLabel(opened.kind).toLowerCase()}
              </h3>
              <ol className="border-border list-none space-y-3 border-l-2 pl-4 text-sm">
                <li>
                  <strong>{requestStatusLabel(opened.status)}</strong>, com prazo de{" "}
                  {deadlineDays(opened)} dias para responder.
                </li>
                <li className="space-y-2">
                  <p>
                    Código de confirmação enviado por{" "}
                    <strong>{channelLabel(completed.codeChannel)}</strong> ao contato do cadastro.
                    Na caixa de entrada simulada:
                  </p>
                  {message ? (
                    <blockquote
                      data-testid="caixa-de-entrada"
                      className="bg-surface border-border rounded border-l-2 px-3 py-2 italic"
                    >
                      {message.text}
                    </blockquote>
                  ) : null}
                </li>
                <li>
                  Identidade confirmada com o código; o pedido seguiu para os{" "}
                  {completed.services.length} serviços.
                </li>
                <li>
                  <strong data-testid="situacao-do-pedido">
                    {requestStatusLabel(completed.status)}
                  </strong>
                  {total === undefined ? null : ` em ${formatMs(total)} desde o recebimento`}.
                </li>
              </ol>
              <div
                role="region"
                aria-label={`Respostas dos serviços ao pedido de ${requestKindLabel(opened.kind).toLowerCase()}`}
                tabIndex={0}
                className="border-border overflow-x-auto rounded-lg border"
              >
                <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
                  <thead className="bg-surface">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Serviço
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium">
                        Resposta
                      </th>
                      <th scope="col" className="px-3 py-2 text-right font-medium">
                        Depois da confirmação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.services.map((service) => {
                      const after = elapsedMs(completed.identityConfirmedAt, service.answeredAt);
                      return (
                        <tr key={service.service} className="border-border border-t">
                          <td className="px-3 py-2">{rightsServiceName(service.service)}</td>
                          <td className="px-3 py-2">{outcomeLabel(service.outcome)}</td>
                          <td className="px-3 py-2 text-right font-mono text-xs">
                            {after === undefined ? "—" : formatMs(after)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
