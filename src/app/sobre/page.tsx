import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "@/components/external-link";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Engenheiro de Software Full-Stack Sênior com experiência em sistemas financeiros e de alta disponibilidade, arquitetura orientada a domínio e observabilidade de ponta a ponta.";

export const metadata: Metadata = pageMetadata({ title: "Sobre", description, path: "/sobre" });

const practices = [
  {
    title: "Arquitetura orientada a domínio",
    text: "DDD, Clean Architecture e Arquitetura Hexagonal para manter regra de negócio explícita, testável e independente de infraestrutura.",
  },
  {
    title: "Testes antes da confiança",
    text: "TDD e testes automatizados em todos os níveis, com portões de qualidade no CI em vez de revisão só no olho.",
  },
  {
    title: "Observabilidade de ponta a ponta",
    text: "Logs estruturados, métricas e traces com Datadog, Instana, OpenTelemetry e Serilog, para entender o sistema em produção.",
  },
  {
    title: "IA como ferramenta, não como atalho",
    text: "Claude Code, GitHub Copilot e Deadalus AI para acelerar e qualificar entregas, sempre com revisão humana do que vai para produção.",
  },
] as const;

export default function SobrePage() {
  return (
    <div className="max-w-3xl space-y-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: site.role,
          url: new URL("/sobre", siteUrl.url).href,
          sameAs: [site.links.github],
          knowsAbout: [".NET", "Microsserviços", "React", "Angular", "AWS", "Azure"],
        }}
      />

      <PageHeader title="Sobre" eyebrow={site.role}>
        <p>
          Construo sistemas críticos, microsserviços distribuídos e frontends modernos. Tenho
          experiência comprovada em sistemas financeiros e ambientes de alta disponibilidade, onde
          consistência, resiliência e segurança não são opcionais.
        </p>
      </PageHeader>

      <section aria-labelledby="como-trabalho" className="space-y-6">
        <h2 id="como-trabalho" className="text-2xl font-semibold tracking-tight">
          Como eu trabalho
        </h2>
        <dl className="space-y-6">
          {practices.map((practice) => (
            <div key={practice.title} className="space-y-1">
              <dt className="font-semibold">{practice.title}</dt>
              <dd className="text-muted leading-relaxed">{practice.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="para-quem" className="space-y-4">
        <h2 id="para-quem" className="text-2xl font-semibold tracking-tight">
          Para quem
        </h2>
        <p className="text-muted leading-relaxed">
          Empresas que precisam de soluções críticas em {formatList(site.sectors)}, e startups e
          scale-ups que buscam arquiteturas modernas, escaláveis e seguras.
        </p>
      </section>

      <section aria-labelledby="vitrine" className="space-y-4">
        <h2 id="vitrine" className="text-2xl font-semibold tracking-tight">
          Trabalho à vista
        </h2>
        <p className="text-muted leading-relaxed">
          O{" "}
          <Link href="/projetos/careflow" className="text-foreground underline">
            CareFlow
          </Link>{" "}
          é construído em público, fase a fase, para mostrar o processo e não só o resultado. Cada
          decisão fica registrada em ADRs e cada fase vira um post no{" "}
          <Link href="/diario" className="text-foreground underline">
            diário de bordo
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="contato" className="space-y-4">
        <h2 id="contato" className="text-2xl font-semibold tracking-tight">
          Contato
        </h2>
        <p className="text-muted leading-relaxed">
          O caminho mais direto hoje é o{" "}
          <ExternalLink href={site.links.github} className="text-foreground underline">
            GitHub
          </ExternalLink>
          .
        </p>
      </section>
    </div>
  );
}

const listFormat = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

function formatList(items: readonly string[]): string {
  return listFormat.format(items.map((item) => item.toLowerCase()));
}
