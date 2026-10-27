import type { Metadata } from "next";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { lojinha, lojinhaAdrUrl } from "@/content/lojinha";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: lojinha.name,
  description: lojinha.tagline,
  path: "/projetos/lojinha-da-lua",
  ownImage: true,
});

export default function LojinhaPage() {
  return (
    <div className="max-w-5xl space-y-16 [&_section>p]:max-w-3xl">
      <PageHeader title={lojinha.name} eyebrow="Projeto para uma loja real">
        <p>{lojinha.tagline}</p>
      </PageHeader>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-4">
          <ExternalLink
            href={lojinha.site}
            className="bg-accent text-background rounded-md px-5 py-2.5 font-medium hover:opacity-90"
          >
            Ver o site
          </ExternalLink>
          <ExternalLink
            href={lojinha.repository}
            className="border-border hover:bg-surface rounded-md border px-5 py-2.5 font-medium"
          >
            Ver código
          </ExternalLink>
        </div>
        <p className="text-muted text-sm leading-relaxed">
          Feito com {lojinha.stack}, com código aberto sob a licença MIT.
        </p>
      </div>

      <p
        role="note"
        className="border-accent bg-surface rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed"
      >
        A Lojinha Da Lua é uma loja de verdade. Nome, marca, fotos, preços e textos pertencem a ela;
        esta página conta a engenharia do site.
      </p>

      <section aria-labelledby="problema" className="space-y-4">
        <h2 id="problema" className="text-2xl font-semibold tracking-tight">
          O problema
        </h2>
        <p className="text-muted leading-relaxed">{lojinha.problem}</p>
      </section>

      <section aria-labelledby="o-que-faz" className="space-y-4">
        <h2 id="o-que-faz" className="text-2xl font-semibold tracking-tight">
          O que o site faz
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {lojinha.features.map((feature) => (
            <div key={feature.title} className="border-border rounded-lg border p-4">
              <dt className="font-semibold">{feature.title}</dt>
              <dd className="text-muted mt-1 text-sm leading-relaxed">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="indicadores" className="space-y-4">
        <h2 id="indicadores" className="text-2xl font-semibold tracking-tight">
          Em números
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {lojinha.indicators.map((indicator) => (
            <div
              key={indicator.label}
              className="border-border bg-surface flex flex-col-reverse justify-end gap-1 rounded-lg border p-4"
            >
              <dt className="text-muted text-sm leading-relaxed">{indicator.label}</dt>
              <dd className="text-accent font-mono text-2xl font-semibold">{indicator.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="decisoes" className="space-y-4">
        <h2 id="decisoes" className="text-2xl font-semibold tracking-tight">
          Decisões
        </h2>
        <p className="text-muted leading-relaxed">
          Cada escolha está registrada num ADR, com o contexto, as alternativas e as consequências.
        </p>
        <ul className="space-y-4">
          {lojinha.decisions.map((decision) => (
            <li key={decision.adr} className="border-border space-y-1 border-b pb-4">
              <h3 className="font-semibold">{decision.title}</h3>
              <p className="text-muted leading-relaxed">{decision.description}</p>
              <ExternalLink
                href={lojinhaAdrUrl(decision.adr)}
                className="text-accent text-sm underline underline-offset-4"
              >
                ADR-{decision.adr.slice(0, 4)}
              </ExternalLink>
            </li>
          ))}
        </ul>
        <p>
          <ExternalLink
            href={lojinha.adrs}
            className="text-accent font-medium underline underline-offset-4"
          >
            Todas as decisões de arquitetura
          </ExternalLink>
        </p>
      </section>
    </div>
  );
}
