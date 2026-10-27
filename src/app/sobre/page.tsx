import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { EducationSummary } from "@/components/education-summary";
import { JsonLd } from "@/components/json-ld";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { PageHeader } from "@/components/page-header";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import { principles } from "@/content/engineering";
import { currentExperience, profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import { formatList } from "@/lib/format-list";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Trajetória, formação, competências e contato de Cleber Costa Santos, engenheiro de software full-stack sênior em sistemas críticos de pagamentos, fundos de investimento, saúde, previdência e educação.";

export const metadata: Metadata = pageMetadata({ title: "Sobre", description, path: "/sobre" });

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
          sameAs: [site.links.linkedin, site.links.github],
          homeLocation: { "@type": "Place", name: profile.location },
          ...(currentExperience
            ? { worksFor: { "@type": "Organization", name: currentExperience.company } }
            : {}),
          alumniOf: profile.education.map((education) => ({
            "@type": "CollegeOrUniversity",
            name: education.institution,
          })),
          knowsAbout: stackGroups.flatMap((group) => group.items.map((item) => item.name)),
        }}
      />

      <PageHeader title="Sobre" eyebrow={site.role}>
        <p>{profile.bio[0]}</p>
      </PageHeader>

      <section aria-labelledby="quem-sou" className="space-y-6">
        <h2 id="quem-sou" className="text-2xl font-semibold tracking-tight">
          Quem sou
        </h2>
        <div className="text-muted space-y-4 leading-relaxed">
          {profile.bio.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="border-border bg-border grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3">
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">Formação</dt>
            <dd>Análise e Desenvolvimento de Sistemas</dd>
          </div>
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">Idiomas</dt>
            <dd>{profile.languages.map((language) => language.name).join(" e ")}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="experiencia" className="space-y-8">
        <h2 id="experiencia" className="text-2xl font-semibold tracking-tight">
          Experiência
        </h2>
        <ExperienceTimeline experiences={profile.experiences} />
      </section>

      <section aria-labelledby="como-trabalho" className="space-y-6">
        <h2 id="como-trabalho" className="text-2xl font-semibold tracking-tight">
          Como eu trabalho
        </h2>
        <dl className="space-y-6">
          {principles.map((principle) => (
            <div key={principle.title} className="space-y-1">
              <dt className="font-semibold">{principle.title}</dt>
              <dd className="text-muted leading-relaxed">{principle.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="formacao" className="space-y-6">
        <h2 id="formacao" className="text-2xl font-semibold tracking-tight">
          Formação e certificações
        </h2>
        <EducationSummary />
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
          {profile.availability.label}: {profile.availability.seeking}, em formato{" "}
          {profile.availability.workModes}. O caminho mais rápido é o WhatsApp, e o código de tudo o
          que aparece aqui está no GitHub.
        </p>
        <ContactLinks />
      </section>
    </div>
  );
}
