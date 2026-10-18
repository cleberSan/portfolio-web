import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { Topology } from "@/components/topology";
import { careflow, careflowPhases, phaseStatusLabel } from "@/content/careflow";
import { getPostBySlug } from "@/content/posts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: careflow.name,
  description: careflow.tagline,
  path: "/projetos/careflow",
  ownImage: true,
});

export default function CareFlowPage() {
  return (
    <div className="max-w-5xl space-y-16 [&_section>p]:max-w-3xl">
      <PageHeader title={careflow.name} eyebrow="Projeto vitrine">
        <p>{careflow.tagline}</p>
      </PageHeader>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/projetos/careflow/painel"
            className="bg-accent text-background rounded-md px-5 py-2.5 font-medium hover:opacity-90"
          >
            Ver demonstração
          </Link>
          <ExternalLink
            href={careflow.repository}
            className="border-border hover:bg-surface rounded-md border px-5 py-2.5 font-medium"
          >
            Ver código
          </ExternalLink>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          A demonstração fala com o backend hospedado quando ele está no ar e, fora disso, reproduz
          execuções reais gravadas pelo CI. O código roda inteiro na sua máquina com Docker Compose.
        </p>
      </div>

      <p
        role="note"
        className="border-accent bg-surface rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed"
      >
        Projeto de demonstração. Usa apenas dados sintéticos e não faz diagnóstico nem promessa
        clínica.
      </p>

      <section aria-labelledby="painel" className="space-y-4">
        <h2 id="painel" className="text-2xl font-semibold tracking-tight">
          Veja funcionando
        </h2>
        <p className="text-muted leading-relaxed">
          O Painel de Privacidade e Resiliência reproduz uma execução real do sistema com um
          paciente sintético: o trace de uma reserva, o mesmo paciente em cada serviço, a revogação
          do consentimento propagando, o WhatsApp caindo com fallback para SMS, a triagem com IA
          sobre dados pseudonimizados e os direitos do titular, do pacote com os dados à eliminação.
        </p>
        <p>
          <Link
            href="/projetos/careflow/painel"
            className="text-accent font-medium underline underline-offset-4"
          >
            Abrir o Painel
          </Link>
        </p>
      </section>

      <section aria-labelledby="por-que" className="space-y-4">
        <h2 id="por-que" className="text-2xl font-semibold tracking-tight">
          Por que saúde
        </h2>
        <p className="text-muted leading-relaxed">
          Saúde junta os problemas que sistemas críticos enfrentam: concorrência real na agenda,
          dados sensíveis protegidos pela LGPD, consentimento que precisa propagar entre serviços e
          integrações externas que falham. É um domínio em que consistência e privacidade são
          requisitos, não detalhes.
        </p>
      </section>

      <section aria-labelledby="principios" className="space-y-4">
        <h2 id="principios" className="text-2xl font-semibold tracking-tight">
          Princípios
        </h2>
        <ul className="text-muted list-disc space-y-2 pl-5 leading-relaxed">
          {careflow.principles.map((principle) => (
            <li key={principle}>{principle}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="arquitetura" className="space-y-4">
        <h2 id="arquitetura" className="text-2xl font-semibold tracking-tight">
          Arquitetura
        </h2>
        <p className="text-muted leading-relaxed">
          A arquitetura alvo usa microsserviços em .NET 10, um banco PostgreSQL por serviço e
          comunicação por eventos com Outbox/Inbox. Agenda, cofre, consentimento, notificações,
          auditoria, triagem com IA e pedidos do titular já estão implementados.
        </p>
        <figure className="border-border bg-surface rounded-xl border p-3 sm:p-6">
          <Topology id="topologia-careflow" className="mx-auto h-auto w-full max-w-2xl" />
        </figure>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {careflow.services.map((service) => (
            <div key={service.name} className="border-border rounded-lg border p-4">
              <dt className="flex flex-wrap items-baseline justify-between gap-x-3 font-semibold">
                {service.name}
                <span className="text-accent font-mono text-xs font-normal">{service.signal}</span>
              </dt>
              <dd className="text-muted mt-1 text-sm leading-relaxed">{service.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="roadmap" className="space-y-4">
        <h2 id="roadmap" className="text-2xl font-semibold tracking-tight">
          Roadmap
        </h2>
        <ol className="space-y-3">
          {careflowPhases.map((phase) => {
            const post = phase.postSlug ? getPostBySlug(phase.postSlug) : undefined;
            return (
              <li
                key={phase.number}
                className="border-border flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b pb-3"
              >
                <span className="text-muted w-16 shrink-0 font-mono text-sm">
                  Fase {phase.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{phase.title}</span>
                  <span className="text-muted block text-sm">{phase.demonstrates}</span>
                  {post ? (
                    <Link
                      href={`/diario/${post.slug}`}
                      className="text-accent text-sm underline underline-offset-4"
                    >
                      Ler o post da fase {phase.number}
                    </Link>
                  ) : null}
                </span>
                <span
                  className={
                    phase.status === "concluida"
                      ? "text-ok border-border inline-flex items-center gap-2 rounded-md border px-2 py-0.5 font-mono text-xs"
                      : "text-muted border-border inline-flex items-center gap-2 rounded-md border border-dashed px-2 py-0.5 font-mono text-xs"
                  }
                >
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                  {phaseStatusLabel[phase.status]}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section aria-labelledby="codigo" className="space-y-4">
        <h2 id="codigo" className="text-2xl font-semibold tracking-tight">
          Código e decisões
        </h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <ExternalLink href={careflow.repository} className="underline underline-offset-4">
              Repositório no GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={careflow.adrs} className="underline underline-offset-4">
              Decisões de arquitetura (ADRs)
            </ExternalLink>
          </li>
        </ul>
      </section>
    </div>
  );
}
