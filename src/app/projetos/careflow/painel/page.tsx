import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { LivePanel } from "@/components/painel/live-panel";
import { LogList } from "@/components/painel/log-list";
import { ResilienceReplay } from "@/components/painel/resilience-replay";
import { RightsRequests } from "@/components/painel/rights-requests";
import { TraceWaterfall } from "@/components/painel/trace-waterfall";
import { TriageSteps } from "@/components/painel/triage-steps";
import {
  buildWaterfall,
  commitUrl,
  countResources,
  formatBytes,
  formatMs,
  formatRecordedAt,
  formatRetainedUntil,
  groupAudit,
  propagationMs,
  recording,
  retentionActionLabel,
  rightsServiceName,
  serviceName,
} from "@/content/painel";
import { demoBackend } from "@/config/demo-backend";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Uma execução real do CareFlow com um paciente sintético: o trace de uma reserva, o mesmo paciente visto por cada serviço, a revogação do consentimento propagando, o WhatsApp caindo com fallback para SMS, a triagem com IA sobre dados pseudonimizados e os direitos do titular, do pacote com os dados à eliminação com a auditoria íntegra.";

export const metadata: Metadata = pageMetadata({
  title: "Painel de Privacidade e Resiliência",
  description,
  path: "/projetos/careflow/painel",
  ownImage: true,
});

const adrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0010-observabilidade-e-painel-de-privacidade.md";

const triageAdrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0011-triagem-com-ia-pseudonimizada.md";

const hostingAdrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0013-demonstracao-hospedada-na-oracle.md";

const rightsAdrUrl =
  "https://github.com/cleberSan/careflow/blob/main/docs/adr/0012-direitos-do-titular-e-fhir.md";

/** Ações da trilha que contam a história dos pedidos do titular. */
const rightsActions =
  /^(subject-request\.|identity-verification\.|patient\.erased|triage\.text-erased|audit\.retained-after-erasure|.+\.exported$)/;

const scenarios = [
  { id: "reserva", title: "1. Uma reserva, um trace" },
  { id: "visoes", title: "2. O mesmo paciente em cada serviço" },
  { id: "revogacao", title: "3. Revogação do consentimento" },
  { id: "whatsapp", title: "4. WhatsApp fora do ar" },
  { id: "triagem", title: "5. Triagem com IA e o profissional no circuito" },
  { id: "direitos", title: "6. Direitos do titular: os dados de volta e a eliminação" },
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
  const { patient, booking, views, resilience, triage, revocation, rights } = recording;
  const receipt = rights.erasure.completed.receipt;
  const rightsAudit = groupAudit(
    rights.evidence.audit.filter((entry) => rightsActions.test(entry.action)),
  );
  const triageAudit = groupAudit(triage.audit);
  const commit = commitUrl(recording.commit);
  const bookingTrace = buildWaterfall(booking.trace);
  const propagation = propagationMs(revocation.after);
  const cancellations = revocation.after.notifications.filter(
    (notice) => notice.kind === "Cancellation" && notice.status === "Sent",
  );
  const pseudonym = patient.pseudonym;

  return (
    <div className="max-w-5xl space-y-16 [&_section>p]:max-w-3xl">
      <PageHeader title="Painel de Privacidade e Resiliência" eyebrow="CareFlow · Fases 6 a 9">
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
          paciente é sintético, e os seis cenários reproduzem a gravação sem chamar nenhum servidor.
          Só a seção Ao vivo fala com o backend, quando ele está no ar.
        </p>
      </div>

      <LivePanel backendUrl={demoBackend?.origin} />

      <nav aria-labelledby="cenarios" className="space-y-3">
        <h2 id="cenarios" className="text-2xl font-semibold tracking-tight">
          Cenários
        </h2>
        <ol className="grid list-none gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <li key={scenario.id}>
              <a
                href={`#${scenario.id}`}
                className="border-border bg-surface hover:border-accent/60 block h-full rounded-md border px-3 py-2 text-sm"
              >
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
            <dd className="font-mono text-2xl font-medium tabular-nums">
              {revocation.after.appointments.filter((a) => a.status === "Cancelled").length} de{" "}
              {revocation.before.appointments.length}
            </dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted text-sm">Avisos de cancelamento enviados</dt>
            <dd className="font-mono text-2xl font-medium tabular-nums">{cancellations.length}</dd>
          </div>
          <div className="border-border rounded-lg border p-4">
            <dt className="text-muted text-sm">Da revogação ao último cancelamento</dt>
            <dd className="font-mono text-2xl font-medium tabular-nums">
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

      <section aria-labelledby="direitos" className="space-y-4">
        <h2 id="direitos" className="text-2xl font-semibold tracking-tight">
          {scenarios[5].title}
        </h2>
        <p className="text-muted leading-relaxed">
          O mesmo paciente pede os próprios dados e, depois, a eliminação. Antes de qualquer coisa
          sair, ele prova que é o dono do contato cadastrado com um código de uso único. O pedido
          vai pelos eventos para os seis serviços que guardam algo dele e só termina quando todos
          respondem. Na eliminação, o cofre destrói a chave do paciente e a trilha de auditoria
          fica, com a cadeia verificável.
        </p>
        <RightsRequests flows={[rights.portability, rights.erasure]} />

        <h3 className="text-lg font-semibold">O pacote que o paciente baixou</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="border-border space-y-1 rounded-lg border p-4">
            <dt className="text-muted text-sm">Arquivos</dt>
            <dd>
              <ul className="space-y-1 text-sm">
                {rights.package.files.map((file) => (
                  <li key={file.name}>
                    <code className="font-mono text-xs">{file.name}</code>,{" "}
                    {formatBytes(file.bytes)}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="border-border space-y-1 rounded-lg border p-4">
            <dt className="text-muted text-sm">Bundle HL7 FHIR R4</dt>
            <dd className="text-sm" data-testid="recursos-fhir">
              {countResources(rights.package.fhirResources)}
            </dd>
          </div>
          <div className="border-border space-y-1 rounded-lg border p-4">
            <dt className="text-muted text-sm">Seções no arquivo estruturado</dt>
            <dd className="text-sm">{rights.package.sections.map(rightsServiceName).join(", ")}</dd>
          </div>
          <div className="border-border space-y-1 rounded-lg border p-4">
            <dt className="text-muted text-sm">Link</dt>
            <dd className="text-sm" data-testid="link-do-pacote">
              15 minutos e uso único:{" "}
              {rights.package.reuseRefused
                ? "o mesmo link foi recusado na segunda vez."
                : "a segunda tentativa não foi gravada."}{" "}
              O nome no pacote{" "}
              {rights.package.patientName === patient.vault.fullName
                ? "confere com o do cofre"
                : "não confere com o do cofre"}
              .
            </dd>
          </div>
        </dl>

        <h3 className="text-lg font-semibold">Depois da eliminação</h3>
        <p>
          Leitura do paciente no cofre:{" "}
          <strong data-testid="leitura-no-cofre">
            {rights.evidence.vaultReadable
              ? "ainda legível"
              : `${rights.evidence.vaultStatus}, o cofre não lê mais o paciente`}
          </strong>
          . Cadeia de auditoria:{" "}
          <strong>
            {rights.evidence.chain.intact ? "íntegra" : "quebrada"},{" "}
            {rights.evidence.chain.entriesVerified} entradas verificadas
          </strong>
          .
        </p>
        {receipt ? (
          <div
            role="region"
            aria-label="Comprovante de eliminação"
            tabIndex={0}
            className="border-border overflow-x-auto rounded-lg border"
          >
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <caption className="text-muted px-3 py-2 text-left">
                Comprovante de eliminação, política de retenção versão{" "}
                <code className="font-mono text-xs">{receipt.policyVersion}</code>. Só contagens:
                nenhum dado do paciente.
              </caption>
              <thead className="bg-surface">
                <tr>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Serviço
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Item
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    O que aconteceu
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Registros
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Fica até
                  </th>
                </tr>
              </thead>
              <tbody>
                {receipt.lines.map((line) => (
                  <tr key={line.item} className="border-border border-t align-top">
                    <td className="px-3 py-2">{rightsServiceName(line.service)}</td>
                    <td className="px-3 py-2">{line.description}</td>
                    <td className="px-3 py-2">{retentionActionLabel(line.action)}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{line.records}</td>
                    <td className="px-3 py-2">
                      {formatRetainedUntil(line.retainedUntil, line.action)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        <div
          role="region"
          aria-label="Pedidos do titular na trilha de auditoria"
          tabIndex={0}
          className="border-border overflow-x-auto rounded-lg border"
        >
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <caption className="text-muted px-3 py-2 text-left">
              O que os dois pedidos deixaram na trilha do paciente, agrupado por ação.
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
              {rightsAudit.map((group) => (
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
          <summary className="cursor-pointer font-medium">Ver o trace da eliminação</summary>
          <TraceWaterfall trace={rights.trace} label="Trace da eliminação" />
          <LogList logs={rights.logs} label="Logs do trace da eliminação" />
        </details>
      </section>

      <section aria-labelledby="em-breve" className="space-y-4">
        <h2 id="em-breve" className="text-2xl font-semibold tracking-tight">
          Em breve
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          <li className="border-border rounded-lg border p-4">
            <p className="font-semibold">Carga e deploy gradual</p>
            <p className="text-muted mt-1 text-sm leading-relaxed">
              Testes de carga contra a demonstração hospedada e deploy gradual, quando houver mais
              de uma instância para dividir o tráfego.
            </p>
          </li>
        </ul>
        <p className="text-muted text-sm">
          Isso ainda não existe; o Painel vai mostrar quando for gravado.
        </p>
      </section>

      <section aria-labelledby="como" className="space-y-4">
        <h2 id="como" className="text-2xl font-semibold tracking-tight">
          Como foi gravado
        </h2>
        <p className="text-muted leading-relaxed">
          Um teste de ponta a ponta do CareFlow sobe os sete serviços e o Demo com PostgreSQL e
          RabbitMQ reais e percorre os seis cenários com um paciente sintético. A triagem não chama
          o modelo no CI: ela reproduz respostas gravadas, e sem gravação o modelo aparece como
          indisponível. O código de confirmação dos pedidos vai para um provedor simulado, e o
          Painel lê a mensagem numa caixa de entrada que só existe fora de produção. O CI publica o
          resultado como artefato, e o site reproduz esse arquivo. Desde a fase 9, o mesmo backend
          roda numa VM gratuita da Oracle para a seção Ao vivo (
          <ExternalLink href={hostingAdrUrl} className="text-accent underline underline-offset-4">
            ADR-0013
          </ExternalLink>
          ). As decisões dos cenários estão no{" "}
          <ExternalLink href={adrUrl} className="text-accent underline underline-offset-4">
            ADR-0010
          </ExternalLink>
          , no{" "}
          <ExternalLink href={triageAdrUrl} className="text-accent underline underline-offset-4">
            ADR-0011
          </ExternalLink>{" "}
          e no{" "}
          <ExternalLink href={rightsAdrUrl} className="text-accent underline underline-offset-4">
            ADR-0012
          </ExternalLink>
          , e o processo está nos posts das{" "}
          <Link
            href="/diario/fase-6-observabilidade-e-painel"
            className="text-accent underline underline-offset-4"
          >
            fase 6
          </Link>
          ,{" "}
          <Link
            href="/diario/fase-7-triagem-com-ia"
            className="text-accent underline underline-offset-4"
          >
            fase 7
          </Link>
          ,{" "}
          <Link
            href="/diario/fase-8-direitos-do-titular"
            className="text-accent underline underline-offset-4"
          >
            fase 8
          </Link>{" "}
          e{" "}
          <Link
            href="/diario/fase-9-careflow-no-ar"
            className="text-accent underline underline-offset-4"
          >
            fase 9
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
