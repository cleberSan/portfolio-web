import type { Metadata } from "next";
import Link from "next/link";
import { CaseCard } from "@/components/case-card";
import { ContactLinks } from "@/components/contact-links";
import { EducationSummary } from "@/components/education-summary";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { ExternalLink } from "@/components/external-link";
import { PostList } from "@/components/post-list";
import { QualityPipeline } from "@/components/quality-pipeline";
import { SectionHeading } from "@/components/section-heading";
import { Topology } from "@/components/topology";
import { site } from "@/config/site";
import { careflowPhases } from "@/content/careflow";
import { cases } from "@/content/cases";
import { aiPractice, principles, services } from "@/content/engineering";
import { getLatestPosts } from "@/content/posts";
import { careerYears, formatCareerPeriod, profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import { formatList } from "@/lib/format-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${site.role}`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const eyebrow = "text-accent font-mono text-xs font-medium tracking-[0.16em] uppercase";
const sectionLink = "text-muted hover:text-foreground underline underline-offset-4";
const primaryButton =
  "bg-accent text-background rounded-full px-6 py-3 font-medium hover:opacity-90";
const secondaryButton =
  "border-border bg-background hover:bg-surface rounded-full border px-6 py-3 font-medium";

/** O último grupo de competências ocupa a linha inteira quando sobraria sozinho nela. */
const lastGroupSpan = [
  stackGroups.length % 2 === 1 ? "sm:col-span-2" : "",
  stackGroups.length % 3 === 1 ? "lg:col-span-3" : "lg:col-span-1",
].join(" ");

const totalSkills = stackGroups.reduce((total, group) => total + group.items.length, 0);

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

export default function Home() {
  const latestPosts = getLatestPosts(2);
  const phasesDone = careflowPhases.filter((phase) => phase.status === "concluida").length;
  const years = careerYears();

  const indicators = [
    { value: `${years} anos`, label: "construindo software que roda em produção" },
    { value: String(site.sectors.length), label: "setores atendidos, de pagamentos a saúde" },
    { value: String(profile.experiences.length), label: "empresas na trajetória" },
    {
      value: String(phasesDone),
      label: "fases do CareFlow entregues em público",
      href: "/projetos/careflow",
    },
  ];

  return (
    <div className="space-y-28">
      <header className="relative">
        <div
          aria-hidden="true"
          className="control-grid absolute -inset-x-6 -top-14 bottom-0 -z-10"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <p className="text-accent flex items-center gap-2.5 font-mono text-xs">
              <span
                aria-hidden="true"
                className="status-dot size-2 shrink-0 rounded-full bg-current"
              />
              Portfólio · {profile.location}
            </p>
            <h1 className="text-accent text-3xl font-semibold tracking-tight sm:text-4xl">
              {site.name}
            </h1>
            <p className="text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Engenheiro de software sênior, especialista em sistemas críticos.
            </p>
          </div>
          <figure className="border-border bg-surface/80 rounded-xl border p-3 sm:p-5">
            <Topology id="topologia-home" className="h-auto w-full" />
            <figcaption className="text-muted border-border mt-3 border-t pt-3 font-mono text-xs">
              CareFlow, meu projeto vitrine · cada serviço com o próprio banco, eventos com Outbox e
              Inbox
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 space-y-8">
          <p className="text-muted max-w-4xl text-lg leading-relaxed">
            <strong className="text-foreground font-semibold">{site.role}.</strong> Há {years} anos
            construo sistemas críticos e escaláveis em {formatList(site.sectors)}: backend
            resiliente em .NET, mensageria, frontends modernos e observabilidade de ponta a ponta.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="#cases" className={primaryButton}>
              Ver os cases <span aria-hidden="true">↓</span>
            </Link>
            <Link href="#sobre" className={secondaryButton}>
              Como eu trabalho
            </Link>
            <ExternalLink href={site.contact.whatsapp} className={secondaryButton}>
              Falar no WhatsApp
            </ExternalLink>
          </div>
          <dl className="flex flex-wrap gap-x-12 gap-y-6">
            {indicators.map((indicator, index) => (
              <div key={indicator.label} className="flex flex-col-reverse gap-1">
                <dt className="text-muted max-w-[14rem] text-sm leading-snug">
                  {indicator.href ? (
                    <Link
                      href={indicator.href}
                      className="hover:text-foreground underline underline-offset-4"
                    >
                      {indicator.label}
                    </Link>
                  ) : (
                    indicator.label
                  )}
                </dt>
                <dd
                  className={`font-mono text-4xl font-medium tabular-nums ${index === 0 ? "text-accent" : ""}`}
                >
                  {indicator.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-border mt-12 space-y-3 border-t pt-8">
          <p id="empresas" className="text-muted font-mono text-xs tracking-[0.16em] uppercase">
            Onde já construí software
          </p>
          <ul
            aria-labelledby="empresas"
            className="text-muted flex flex-wrap gap-x-8 gap-y-2 text-lg font-semibold tracking-tight"
          >
            {profile.experiences.map((experience) => (
              <li key={experience.company}>{experience.company}</li>
            ))}
          </ul>
        </div>
      </header>

      <section id="cases" aria-labelledby="cases-titulo" className="space-y-10">
        <SectionHeading
          id="cases-titulo"
          index="01"
          eyebrow="Cases"
          title="Problemas reais que resolvi"
        >
          Cada case diz o problema, como eu ataquei e o que ficou de pé. Os de empresa contam só o
          que é público; os autorais têm código, decisões e números abertos.
        </SectionHeading>
        <ol className="grid gap-6 lg:grid-cols-2">
          {cases.map((item, index) => (
            <li key={item.id}>
              <CaseCard item={item} position={index + 1} />
            </li>
          ))}
        </ol>
      </section>

      <section id="atuacao" aria-labelledby="atuacao-titulo" className="space-y-10">
        <SectionHeading
          id="atuacao-titulo"
          index="02"
          eyebrow="Atuação"
          title="Com o que eu trabalho"
        >
          As frentes em que construo software, todas com sistemas que já coloquei em produção.
        </SectionHeading>
        <ol className="border-border bg-border grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <li key={service.title} className="bg-background space-y-2 p-6">
              <span className="text-accent block font-mono text-xs">{twoDigits(index + 1)}</span>
              <h3 className="font-semibold">{service.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{service.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="sobre" aria-labelledby="sobre-titulo" className="space-y-10">
        <SectionHeading
          id="sobre-titulo"
          index="03"
          eyebrow="Sobre"
          title="Quem sou"
          action={
            <Link href="/sobre" className={sectionLink}>
              Ler mais sobre mim
            </Link>
          }
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="text-muted space-y-4 leading-relaxed">
              {profile.bio.slice(0, 2).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <dl className="border-border bg-border grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2">
              <div className="bg-surface space-y-1 p-4">
                <dt className="text-muted font-mono text-xs uppercase">Base</dt>
                <dd>
                  {profile.location} · {site.contact.timezone}
                </dd>
              </div>
              <div className="bg-surface space-y-1 p-4">
                <dt className="text-muted font-mono text-xs uppercase">Idiomas</dt>
                <dd>
                  {profile.languages
                    .map((language) => `${language.name} ${language.level.toLowerCase()}`)
                    .join(" · ")}
                </dd>
              </div>
            </dl>
          </div>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">IA no ciclo de engenharia</h3>
            <p className="text-muted leading-relaxed">{aiPractice.lead}</p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {aiPractice.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <QualityPipeline />
            <p className="text-muted text-sm">{aiPractice.close}</p>
          </div>
        </div>
        <ol aria-label="Princípios" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <li key={principle.title} className="border-border space-y-2 rounded-lg border p-5">
              <span className="text-accent block font-mono text-xs">{twoDigits(index + 1)}</span>
              <h3 className="font-semibold">{principle.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{principle.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="habilidades" aria-labelledby="habilidades-titulo" className="space-y-10">
        <SectionHeading
          id="habilidades-titulo"
          index="04"
          eyebrow="Habilidades"
          title="Stack e competências"
          action={
            <Link href="/stack" className={sectionLink}>
              Ver a stack com evidências no código
            </Link>
          }
        >
          {totalSkills} tecnologias e práticas em {stackGroups.length} grupos.
        </SectionHeading>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stackGroups.map((group, index) => (
            <li
              key={group.id}
              className={`border-border space-y-3 rounded-lg border p-5 ${index === stackGroups.length - 1 ? lastGroupSpan : ""}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{group.title}</h3>
                <span className="text-muted font-mono text-xs">
                  <span aria-hidden="true">{twoDigits(group.items.length)}</span>
                  <span className="sr-only">{group.items.length} itens</span>
                </span>
              </div>
              <ul aria-label={group.title} className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="bg-surface text-muted rounded-md px-2 py-0.5 font-mono text-xs"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section id="trajetoria" aria-labelledby="trajetoria-titulo" className="space-y-10">
        <SectionHeading
          id="trajetoria-titulo"
          index="05"
          eyebrow="Trajetória"
          title="Experiência e formação"
        >
          {formatCareerPeriod()}, em {profile.experiences.length} empresas.
        </SectionHeading>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <ExperienceTimeline experiences={profile.experiences} variant="expandable" />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <EducationSummary />
          </div>
        </div>
      </section>

      <section id="diario" aria-labelledby="diario-titulo" className="space-y-8">
        <SectionHeading
          id="diario-titulo"
          index="06"
          eyebrow="Diário"
          title="Diário de bordo"
          action={
            <Link href="/diario" className={sectionLink}>
              Todos os posts
            </Link>
          }
        >
          Cada fase do CareFlow vira um post com o que foi decidido e por quê.
        </SectionHeading>
        <div className="[&>ul]:grid [&>ul]:gap-4 [&>ul]:space-y-0 md:[&>ul]:grid-cols-2">
          <PostList posts={latestPosts} headingLevel={3} />
        </div>
      </section>

      <section
        id="contato"
        aria-labelledby="contato-titulo"
        className="border-border bg-surface grid gap-10 rounded-2xl border p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      >
        <div className="space-y-4">
          <p className={eyebrow}>
            <span className="text-muted">07 · </span>Contato
          </p>
          <h2 id="contato-titulo" className="text-3xl font-semibold tracking-tight">
            Vamos conversar
          </h2>
          <p className="text-muted leading-relaxed">
            Para conversar sobre engenharia, arquitetura ou algum dos projetos daqui, o caminho mais
            rápido é o WhatsApp. O código de tudo está no GitHub.
          </p>
          <p className="text-muted font-mono text-sm">
            {profile.location} · {site.contact.timezone}
          </p>
        </div>
        <ContactLinks />
      </section>
    </div>
  );
}
