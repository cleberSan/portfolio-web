import type { Metadata } from "next";
import Link from "next/link";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { PostList } from "@/components/post-list";
import { Topology } from "@/components/topology";
import { site } from "@/config/site";
import { careflow, careflowPhases } from "@/content/careflow";
import { getLatestPosts } from "@/content/posts";
import { careerYears, currentExperience, profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import { formatList } from "@/lib/format-list";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${site.role}`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

const sectionTitle = "text-2xl font-semibold tracking-tight";
const eyebrow = "text-accent font-mono text-xs font-medium tracking-[0.16em] uppercase";

/** O último grupo de competências ocupa a linha inteira quando sobraria sozinho nela. */
const lastGroupSpan = [
  stackGroups.length % 2 === 1 ? "sm:col-span-2" : "",
  stackGroups.length % 3 === 1 ? "lg:col-span-3" : "lg:col-span-1",
].join(" ");

/** Quantos cargos a home mostra; a trajetória inteira fica no Sobre. */
const recentExperiences = 4;

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
    <div className="space-y-24">
      <header className="relative">
        <div
          aria-hidden="true"
          className="control-grid absolute -inset-x-6 -top-14 bottom-0 -z-10"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
          <div className="space-y-6">
            <p className={eyebrow}>{site.role}</p>
            <h1 className="text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
              {site.name}
            </h1>
            <p className="text-3xl leading-tight font-medium tracking-tight text-balance sm:text-4xl">
              Sistemas críticos que você consegue ver funcionando.
            </p>
            <p className="text-muted max-w-xl text-lg leading-relaxed">
              Há {years} anos construo sistemas críticos e escaláveis em {formatList(site.sectors)}:
              backend resiliente em .NET, mensageria, frontends modernos e observabilidade de ponta
              a ponta.
            </p>
            {currentExperience ? (
              <p className="text-muted flex items-start gap-2.5 font-mono text-sm">
                <span
                  aria-hidden="true"
                  className="text-ok status-dot mt-1.5 size-2 shrink-0 rounded-full bg-current"
                />
                <span>
                  Agora: {currentExperience.role} na {currentExperience.company} ·{" "}
                  {currentExperience.segment}
                </span>
              </p>
            ) : null}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/sobre"
                className="bg-accent text-background rounded-md px-5 py-2.5 font-medium hover:opacity-90"
              >
                Conhecer minha trajetória
              </Link>
              <Link
                href="/projetos/careflow/painel"
                className="border-border bg-background hover:bg-surface rounded-md border px-5 py-2.5 font-medium"
              >
                Abrir o Painel do CareFlow
              </Link>
            </div>
          </div>
          <figure className="border-border bg-surface/80 rounded-xl border p-3 sm:p-5">
            <Topology id="topologia-home" className="h-auto w-full" />
            <figcaption className="text-muted border-border mt-3 border-t pt-3 font-mono text-xs">
              CareFlow, meu projeto vitrine · cada serviço com o próprio banco, eventos com Outbox e
              Inbox
            </figcaption>
          </figure>
        </div>

        {/* gap-px sobre o fundo da borda desenha as divisórias entre os indicadores. */}
        <dl className="border-border bg-border mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border lg:grid-cols-4">
          {indicators.map((indicator) => (
            <div
              key={indicator.label}
              className="bg-surface flex flex-col-reverse justify-end gap-1 p-5"
            >
              <dt className="text-muted text-sm leading-snug">
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
              <dd className="font-mono text-3xl font-medium tabular-nums">{indicator.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby="trajetoria" className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-2">
            <p className={eyebrow}>Experiência</p>
            <h2 id="trajetoria" className={sectionTitle}>
              Trajetória
            </h2>
          </div>
          <Link href="/sobre#experiencia" className="text-muted hover:text-foreground underline">
            Ver a trajetória completa
          </Link>
        </div>
        <ExperienceTimeline
          experiences={profile.experiences.slice(0, recentExperiences)}
          variant="compact"
        />
      </section>

      <section aria-labelledby="competencias" className="space-y-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div className="space-y-2">
            <p className={eyebrow}>Skills</p>
            <h2 id="competencias" className={sectionTitle}>
              Competências
            </h2>
          </div>
          <Link href="/stack" className="text-muted hover:text-foreground underline">
            Ver a stack com evidências no código
          </Link>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stackGroups.map((group, index) => (
            <li
              key={group.id}
              className={`border-border space-y-3 rounded-lg border p-5 ${index === stackGroups.length - 1 ? lastGroupSpan : ""}`}
            >
              <h3 className="font-semibold">{group.title}</h3>
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

      <section
        aria-labelledby="careflow"
        className="border-border bg-surface grid gap-8 rounded-xl border p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <div className="space-y-4">
          <p className={eyebrow}>Projeto em destaque</p>
          <h2 id="careflow" className="text-3xl font-semibold tracking-tight">
            {careflow.name}
          </h2>
          <p className="text-muted leading-relaxed">
            {careflow.tagline} Construído em fases públicas com .NET e microsserviços, cada etapa
            vira código revisado, decisões registradas e um post neste diário.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
            <Link
              href="/projetos/careflow"
              className="text-accent font-medium underline underline-offset-4"
            >
              Ver arquitetura e roadmap
            </Link>
            <Link href="/diario" className="text-accent font-medium underline underline-offset-4">
              Ler o diário de bordo
            </Link>
          </div>
        </div>
        <ul aria-label="Serviços do CareFlow" className="grid gap-2 sm:grid-cols-2">
          {careflow.services.map((service) => (
            <li
              key={service.name}
              className="border-border bg-background rounded-md border px-3 py-2.5"
            >
              <span className="block text-sm font-semibold">{service.name}</span>
              <span className="text-muted block font-mono text-xs">{service.signal}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="diario" className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="diario" className={sectionTitle}>
            Diário de bordo
          </h2>
          <Link href="/diario" className="text-muted hover:text-foreground underline">
            Todos os posts
          </Link>
        </div>
        <div className="[&>ul]:grid [&>ul]:gap-4 [&>ul]:space-y-0 md:[&>ul]:grid-cols-2">
          <PostList posts={latestPosts} headingLevel={3} />
        </div>
      </section>

      <section aria-labelledby="setores" className="space-y-4">
        <h2 id="setores" className={sectionTitle}>
          Para quem eu trabalho
        </h2>
        <p className="text-muted max-w-2xl leading-relaxed">
          Empresas que precisam de soluções críticas nestes setores, e startups e scale-ups que
          buscam arquiteturas modernas, escaláveis e seguras.
        </p>
        <ul className="flex flex-wrap gap-2">
          {site.sectors.map((sector) => (
            <li
              key={sector}
              className="border-border bg-surface rounded-md border px-3 py-1.5 font-mono text-sm"
            >
              {sector}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
