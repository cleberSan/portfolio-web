import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { LogList } from "@/components/painel/log-list";
import { ResilienceReplay } from "@/components/painel/resilience-replay";
import { TraceWaterfall } from "@/components/painel/trace-waterfall";
import { TriageSteps } from "@/components/painel/triage-steps";
import {
  buildWaterfall,
  commitUrl,
  formatMs,
  formatRecordedAt,
  groupAudit,
  propagationMs,
  recording,
  serviceName,
} from "@/content/painel";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Uma execução real do CareFlow com um paciente sintético: o trace de uma reserva, o mesmo paciente visto por cada serviço, a revogação do consentimento propagando, o WhatsApp caindo com fallback para SMS e a triagem com IA sobre dados pseudonimizados, sempre confirmada por um profissional.";

export const metadata: Metadata = pageMetadata({
  title: "Painel de Privacidade e Resiliência",
  description,
  path: "/projetos/careflow/painel",
});

const adrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0010-observabilidade-e-painel-de-privacidade.md";

const triageAdrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0011-triagem-com-ia-pseudonimizada.md";

const scenarios = [
  { id: "reserva", title: "1. Uma reserva, um trace" },
  { id: "visoes", title: "2. O mesmo paciente em cada serviço" },
  { id: "revogacao", title: "3. Revogação do consentimento" },
  { id: "whatsapp", title: "4. WhatsApp fora do ar" },
  { id: "triagem", title: "5. Triagem com IA e o profissional no circuito" },
] as const;

const statusNames: Readonly<Record<string, string>> = {
  Booked: "Marcada",
  Cancelled: "Cancelada",
  Sent: "Enviado",
  Pending: "Pendente",
  Superseded: "Descartado",
  granted: "Concedido",
  revoked: "Revogado",
  unknown: "Desconhecido",
};

const kindNames: Readonly<Record<string, string>> = {
  Confirmation: "Confirmação",
  Reminder: "Lembrete",
  Cancellation: "Cancelamento",
};

function label(names: Readonly<Record<string, string>>, value: string): string {
  return names[value] ?? value;
}

export default function PainelPage() {
  const { patient, booking, views, resilience, triage, revocation } = recording;
  const triageAudit = groupAudit(triage.audit);
  const commit = commitUrl(recording.commit);
  const bookingTrace = buildWaterfall(booking.trace);
  const propagation = propagationMs(revocation.after);
  const cancellations = revocation.after.notifications.filter(
    (notice) => notice.kind === "Cancellation" && notice.status === "Sent",
  );
  const pseudonym = patient.pseudonym;

  return (
    <div className="space-y-16">
      <PageHeader title="Painel de Privacidade e Resiliência" eyebrow="CareFlow · Fases 6 e 7">
        <p>{description}</p>
      </PageHeader>

      <div
        role="note"
        className="border-accent bg-surface space-y-2 rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed"
      >
        <p>
          Gravado em {formatRecordedAt(recording.recordedAt)}, no commit{" "}
          {commit ? (
            <ExternalLink href={commit} className="font-mono underline underline-offset-4">
              {recording.commit.slice(0, 7)}
            </ExternalLink>
          ) : (
            <span className="font-mono">{recording.commit}</span>
          )}
          . {recording.source}.
        </p>
        <p>
          Nada nesta página é simulado: cada número, span e linha de log veio dessa execução. O
          paciente é sintético, e o site só reproduz a gravação, sem chamar nenhum servidor.
        </p>
      </div>

      <nav aria-labelledby="cenarios" className="space-y-3">
        <h2 id="cenarios" className="text-2xl font-semibold tracking-tight">
          Cenários
        </h2>
        <ol className="list-none space-y-1">
          {scenarios.map((scenario) => (
            <li key={scenario.id}>
              <a href={`#${scenario.id}`} className="text-accent underline underline-offset-4">
                {scenario.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <section aria-labelledby="reserva" className="space-y-4">
        <h2 id="reserva" className="text-2xl font-semibold tracking-tight">
          {scenarios[0].title}
        </h2>
        <p className="text-muted leading-relaxed">
          O visitante marca uma consulta. A requisição entra pelo Demo, passa pela Agenda, vira
          evento no Outbox, atravessa o RabbitMQ e chega às Notificações, que leem o contato no
          cofre e enviam a confirmação. O contexto do trace viaja no envelope da mensagem, então
          tudo isso é um trace só: {bookingTrace.services.map(serviceName).join(", ")}.
        </p>
        <TraceWaterfall trace={booking.trace} label="Trace da reserva" />
        <details className="space-y-3">
          <summary className="cursor-pointer font-medium">
            Logs do mesmo trace ({booking.logs.length} linhas)
          </summary>
          <LogList logs={booking.logs} label="Logs do trace da reserva" />
        </details>
      </section>

      <section aria-labelledby="visoes" className="space-y-4">
        <h2 id="visoes" className="text-2xl font-semibold tracking-tight">
          {scenarios[1].title}
        </h2>
        <p className="text-muted leading-relaxed">
          Só o cofre sabe quem é o paciente. Os outros serviços guardam um pseudônimo, e os logs
          levam esse pseudônimo mascarado. Na gravação publicada, CPF e telefone sintéticos aparecem
          só com os dois últimos dígitos: o CPF gerado passa na validação e poderia coincidir com o
          de uma pessoa real.
        </p>
        <div
          role="region"
          aria-label="O paciente em cada serviço"
          tabIndex={0}
          className="border-border overflow-x-auto rounded-lg border"
        >
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Onde
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  O que aparece do paciente
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-border border-t align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  Cofre do paciente
                </th>
                <td className="px-3 py-2">
                  {patient.vault ? (
                    <ul className="space-y-1">
                      <li>{patient.vault.fullName}</li>
                      <li>CPF {patient.vault.cpf}</li>
                      <li>Nascimento {patient.vault.birthDate}</li>
                      {patient.vault.email ? <li>{patient.vault.email}</li> : null}
                      {patient.vault.phone ? <li>{patient.vault.phone}</li> : null}
                    </ul>
                  ) : null}
                </td>
              </tr>
              <tr className="border-border border-t align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  Agenda
                </th>
                <td className="px-3 py-2">
                  <code className="font-mono text-xs break-all">{pseudonym}</code> e{" "}
                  {views.scheduling.length} consulta,{" "}
                  {label(statusNames, views.scheduling[0]?.status ?? "")}
                </td>
              </tr>
              <tr className="border-border border-t align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  Consentimento
                </th>
                <td className="px-3 py-2">
                  <code className="font-mono text-xs break-all">{views.consentPatientRef}</code> e
                  as finalidades{" "}
                  {views.consent
                    .map((consent) => `${consent.purpose} (${label(statusNames, consent.status)})`)
                    .join(", ")}
                </td>
              </tr>
              <tr className="border-border border-t align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  Notificações
                </th>
                <td className="px-3 py-2">
                  Só a consulta e os avisos:{" "}
                  {views.notifications
                    .map(
                      (notice) =>
                        `${label(kindNames, notice.kind)} (${label(statusNames, notice.status).toLowerCase()})`,
                    )
                    .join(", ")}
                  . O contato é lido no cofre na hora do envio e não fica guardado.
                </td>
              </tr>
              <tr className="border-border border-t align-top">
                <th scope="row" className="px-3 py-2 font-medium">
                  Logs e traces
                </th>
                <td className="px-3 py-2">
                  <code className="font-mono text-xs">{views.logMask}</code>, o pseudônimo mascarado
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="revogacao" className="space-y-4">
        <h2 id="revogacao" className="text-2xl font-semibold tracking-tight">
          {scenarios[2].title}
        </h2>
        <p className="text-muted leading-relaxed">
          O paciente revoga o consentimento para agendamento. O Consentimento publica o evento, a
          Agenda cancela as consultas futuras, as Notificações avisam o cancelamento e a Auditoria
          registra cada passo numa cadeia HMAC.
        </p>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted text-sm">Consultas canceladas</dt>
            <dd className="text-2xl font-semibold">
              {revocation.after.appointments.filter((a) => a.status === "Cancelled").length} de{" "}
              {revocation.before.appointments.length}
            </dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted text-sm">Avisos de cancelamento enviados</dt>
            <dd className="text-2xl font-semibold">{cancellations.length}</dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted text-sm">Da revogação ao último cancelamento</dt>
            <dd className="text-2xl font-semibold">
              {propagation === undefined ? "não medido" : formatMs(propagation)}
            </dd>
          </div>
        </dl>
        <p>
          Cadeia de auditoria:{" "}
          <strong>
            {revocation.after.chain.intact ? "íntegra" : "quebrada"},{" "}
            {revocation.after.chain.entriesVerified} entradas verificadas
          </strong>
          .
        </p>
        <div
          role="region"
          aria-label="Trilha de auditoria do paciente"
          tabIndex={0}
          className="border-border overflow-x-auto rounded-lg border"
        >
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <caption className="text-muted px-3 py-2 text-left">
              Trilha de auditoria do paciente, agrupada por ação. Cada leitura feita pelo Painel
              também foi auditada.
            </caption>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Ação
                </th>
                <th scope="col" className="px-3 py-2 font-medium">
                  Serviço
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Entradas
                </th>
              </tr>
            </thead>
            <tbody>
              {groupAudit(revocation.after.audit).map((group) => (
                <tr key={group.action} className="border-border border-t">
                  <td className="px-3 py-2 font-mono text-xs">{group.action}</td>
                  <td className="px-3 py-2">{group.services.join(", ")}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{group.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="space-y-3">
          <summary className="cursor-pointer font-medium">Ver o trace da revogação</summary>
          <TraceWaterfall trace={revocation.trace} label="Trace da revogação" />
        </details>
      </section>

      <section aria-labelledby="whatsapp" className="space-y-4">
        <h2 id="whatsapp" className="text-2xl font-semibold tracking-tight">
          {scenarios[3].title}
        </h2>
        <p className="text-muted leading-relaxed">
          A falha é injetada só na clínica sintética desta sessão, que tem a própria partição de
          circuit breaker: nenhuma outra clínica é afetada. Com o WhatsApp fora, a confirmação cai
          para o SMS; depois de algumas falhas o circuito abre e o WhatsApp nem é tentado. Quando o
          WhatsApp volta e a pausa do circuito passa, a próxima confirmação sai por ele de novo.
        </p>
        <ResilienceReplay steps={resilience.steps} />
        <details className="space-y-3">
          <summary className="cursor-pointer font-medium">
            Ver o trace da primeira reserva com fallback
          </summary>
          <TraceWaterfall trace={resilience.fallbackTrace} label="Trace da reserva com fallback" />
        </details>
      </section>

      <section aria-labelledby="triagem" className="space-y-4">
        <h2 id="triagem" className="text-2xl font-semibold tracking-tight">
          {scenarios[4].title}
        </h2>
        <p className="text-muted leading-relaxed">
          O paciente descreve o que sente em texto livre e o CareFlow sugere uma prioridade de
          atendimento. Não é diagnóstico, e nenhuma sugestão vale sozinha: em todas as triagens
          abaixo um profissional de saúde confirma ou corrige. Antes de qualquer coisa sair da
          clínica, nome, CPF, contatos, datas e endereço viram marcadores, e regras de alarme rodam
          sobre o texto original para o modelo nunca rebaixar um caso grave.
        </p>
        <p className="text-muted leading-relaxed">{triage.model}.</p>
        <TriageSteps steps={triage.steps} audit={triage.audit} />
        <p>
          Consentimento para triagem com IA:{" "}
          <strong>
            {label(statusNames, triage.consentBefore.state)} antes,{" "}
            {label(statusNames, triage.consentAfter.state).toLowerCase()} depois da revogação
          </strong>
          . Cadeia de auditoria:{" "}
          <strong>
            {triage.chain.intact ? "íntegra" : "quebrada"}, {triage.chain.entriesVerified} entradas
            verificadas
          </strong>
          .
        </p>
        <div
          role="region"
          aria-label="Triagens na trilha de auditoria"
          tabIndex={0}
          className="border-border overflow-x-auto rounded-lg border"
        >
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <caption className="text-muted px-3 py-2 text-left">
              O que a Triagem registrou na trilha do paciente. Quando a queixa saiu para o modelo, a
              entrada leva só o SHA-256 do pedido, nunca o texto.
            </caption>
            <thead className="bg-surface">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">
                  Ação
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  Entradas
                </th>
              </tr>
            </thead>
            <tbody>
              {triageAudit.map((group) => (
                <tr key={group.action} className="border-border border-t">
                  <td className="px-3 py-2 font-mono text-xs">{group.action}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs">{group.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <details className="space-y-3">
          <summary className="cursor-pointer font-medium">Ver o trace da primeira triagem</summary>
          <TraceWaterfall trace={triage.trace} label="Trace da triagem" />
          <LogList logs={triage.logs} label="Logs do trace da triagem" />
        </details>
      </section>

      <section aria-labelledby="em-breve" className="space-y-4">
        <h2 id="em-breve" className="text-2xl font-semibold tracking-tight">
          Em breve
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="border-border rounded-lg border p-4">
            <p className="font-semibold">Fase 8: direitos do titular</p>
            <p className="text-muted mt-1 text-sm leading-relaxed">
              Acesso, portabilidade e eliminação dos dados, seguindo o paciente por todos os
              serviços.
            </p>
          </li>
        </ul>
        <p className="text-muted text-sm">
          Essa fase ainda não existe; o Painel vai mostrá-la quando for gravada.
        </p>
      </section>

      <section aria-labelledby="como" className="space-y-4">
        <h2 id="como" className="text-2xl font-semibold tracking-tight">
          Como foi gravado
        </h2>
        <p className="text-muted leading-relaxed">
          Um teste de ponta a ponta do CareFlow sobe os seis serviços e o Demo com PostgreSQL e
          RabbitMQ reais e percorre os cinco cenários com um paciente sintético. A triagem não chama
          o modelo no CI: ela reproduz respostas gravadas, e sem gravação o modelo aparece como
          indisponível. O CI publica o resultado como artefato, e o site reproduz esse arquivo.
          Hospedar o backend ao vivo fica para a fase 9. As decisões estão no{" "}
          <ExternalLink href={adrUrl} className="text-accent underline underline-offset-4">
            ADR-0010
          </ExternalLink>{" "}
          e no{" "}
          <ExternalLink href={triageAdrUrl} className="text-accent underline underline-offset-4">
            ADR-0011
          </ExternalLink>
          , e o processo está nos posts das{" "}
          <Link
            href="/diario/fase-6-observabilidade-e-painel"
            className="text-accent underline underline-offset-4"
          >
            fase 6
          </Link>{" "}
          e{" "}
          <Link
            href="/diario/fase-7-triagem-com-ia"
            className="text-accent underline underline-offset-4"
          >
            fase 7
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
