import type { Metadata } from "next";
import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { EducationSummary } from "@/components/education-summary";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { PrintButton } from "@/components/print-button";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import { profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Currículo de Cleber Costa Santos, engenheiro de software full-stack sênior: resumo, experiência, competências, formação e contato, pronto para imprimir ou salvar em PDF.";

export const metadata: Metadata = pageMetadata({
  title: "Currículo",
  description,
  path: "/curriculo",
});

const sectionTitle =
  "border-border border-b pb-2 text-xl font-semibold tracking-tight print:text-base";

/**
 * Currículo numa página só, com os mesmos dados da home e do Sobre. A impressão do navegador gera
 * o PDF: cabeçalho, rodapé e o botão somem, e as cores viram preto no branco (`globals.css`).
 */
export default function CurriculoPage() {
  const { availability } = profile;

  return (
    <article className="mx-auto max-w-3xl space-y-10 print:max-w-none print:space-y-6 print:text-sm">
      <header className="border-border space-y-4 border-b pb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-semibold tracking-tight print:text-3xl">{site.name}</h1>
            <p className="text-accent font-mono text-sm">{site.role}</p>
          </div>
          <PrintButton />
        </div>
        <p className="text-muted">
          {profile.location} · {availability.label}: {availability.seeking}, em formato{" "}
          {availability.workModes}.
        </p>
        <ContactLinks layout="inline" />
        <p className="text-muted text-sm">
          Portfólio:{" "}
          <Link href="/" className="text-foreground underline underline-offset-4">
            {siteUrl.url.host}
          </Link>
        </p>
      </header>

      <section aria-labelledby="cv-resumo" className="space-y-3">
        <h2 id="cv-resumo" className={sectionTitle}>
          Resumo
        </h2>
        <div className="space-y-3 leading-relaxed">
          {profile.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="cv-experiencia" className="space-y-6">
        <h2 id="cv-experiencia" className={sectionTitle}>
          Experiência
        </h2>
        <ExperienceTimeline experiences={profile.experiences} />
      </section>

      <section aria-labelledby="cv-competencias" className="space-y-3">
        <h2 id="cv-competencias" className={sectionTitle}>
          Competências
        </h2>
        <dl className="space-y-2">
          {stackGroups.map((group) => (
            <div key={group.id} className="leading-relaxed">
              <dt className="inline font-semibold">{group.title}: </dt>
              <dd className="text-muted inline">
                {group.items.map((item) => item.name).join(" · ")}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="cv-formacao" className="space-y-4">
        <h2 id="cv-formacao" className={sectionTitle}>
          Formação, certificações e idiomas
        </h2>
        <EducationSummary />
      </section>
    </article>
  );
}
