import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { careflow, careflowPhases, phaseStatusLabel } from "@/content/careflow";
import { getPostBySlug } from "@/content/posts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: careflow.name,
  description: careflow.tagline,
  path: "/projetos/careflow",
});

export default function CareFlowPage() {
  return (
    <div className="space-y-16">
      <PageHeader title={careflow.name} eyebrow="Projeto vitrine">
        <p>{careflow.tagline}</p>
      </PageHeader>

      <p
        role="note"
        className="border-accent bg-surface rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed"
      >
        Projeto de demonstração. Usa apenas dados sintéticos e não faz diagnóstico nem promessa
        clínica.
      </p>

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
          comunicação por eventos com Outbox/Inbox. A agenda já está implementada; os demais
          serviços entram nas próximas fases do roadmap.
        </p>
        <dl className="grid gap-4 sm:grid-cols-2">
          {careflow.services.map((service) => (
            <div key={service.name} className="border-border rounded-lg border p-4">
              <dt className="font-semibold">{service.name}</dt>
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
                      ? "text-accent text-sm font-medium"
                      : "text-muted text-sm"
                  }
                >
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
