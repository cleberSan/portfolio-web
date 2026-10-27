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
import { getSiteText, site, whatsappUrl } from "@/config/site";
import { careflowPhases } from "@/content/careflow";
import { getCases } from "@/content/cases";
import { getEngineering } from "@/content/engineering";
import { getLatestPosts } from "@/content/posts";
import { careerYears, formatCareerPeriod, getProfile } from "@/content/profile";
import { getStackGroups } from "@/content/stack";
import type { Locale } from "@/i18n/locales";
import { formatList } from "@/lib/format-list";
import { homeText } from "./home-text";

const eyebrow = "text-accent font-mono text-xs font-medium tracking-[0.16em] uppercase";
const sectionLink = "text-muted hover:text-foreground underline underline-offset-4";
const primaryButton =
  "bg-accent text-background rounded-full px-6 py-3 font-medium hover:opacity-90";
const secondaryButton =
  "border-border bg-background hover:bg-surface rounded-full border px-6 py-3 font-medium";

function twoDigits(value: number): string {
  return String(value).padStart(2, "0");
}

/** Id do título de uma seção, para a seção apontar para ele com `aria-labelledby`. */
function headingId(sectionId: string): string {
  return `${sectionId}-titulo`;
}

/**
 * Home de página única, a mesma nos dois idiomas: só os textos mudam. As rotas `app/(pt)/page.tsx`
 * e `app/en/page.tsx` escolhem o idioma.
 */
export function HomePage({ locale }: { locale: Locale }) {
  const text = homeText[locale];
  const siteText = getSiteText(locale);
  const profile = getProfile(locale);
  const { aiPractice, principles, services } = getEngineering(locale);
  const stackGroups = getStackGroups(locale);
  const latestPosts = getLatestPosts(2);
  const phasesDone = careflowPhases.filter((phase) => phase.status === "concluida").length;
  const years = careerYears();
  const totalSkills = stackGroups.reduce((total, group) => total + group.items.length, 0);

  // O último grupo de competências ocupa a linha inteira quando sobraria sozinho nela.
  const lastGroupSpan = [
    stackGroups.length % 2 === 1 ? "sm:col-span-2" : "",
    stackGroups.length % 3 === 1 ? "lg:col-span-3" : "lg:col-span-1",
  ].join(" ");

  const indicators = [
    { value: text.indicators.years(years), label: text.indicators.yearsLabel },
    { value: String(siteText.sectors.length), label: text.indicators.sectorsLabel },
    { value: String(profile.experiences.length), label: text.indicators.companiesLabel },
    {
      value: String(phasesDone),
      label: text.indicators.phasesLabel,
      href: text.indicators.phasesHref,
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
              {text.eyebrow(profile.location)}
            </p>
            <h1 className="text-accent text-3xl font-semibold tracking-tight sm:text-4xl">
              {site.name}
            </h1>
            <p className="text-5xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {text.statement}
            </p>
          </div>
          <figure className="border-border bg-surface/80 rounded-xl border p-3 sm:p-5">
            <Topology id="topologia-home" className="h-auto w-full" locale={locale} />
            <figcaption className="text-muted border-border mt-3 border-t pt-3 font-mono text-xs">
              {text.topologyCaption}
            </figcaption>
          </figure>
        </div>

        <div className="mt-12 space-y-8">
          <p className="text-muted max-w-4xl text-lg leading-relaxed">
            <strong className="text-foreground font-semibold">{siteText.role}.</strong>{" "}
            {text.intro(years, formatList(siteText.sectors, locale))}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`#${text.cases.id}`} className={primaryButton}>
              {text.cta.cases} <span aria-hidden="true">↓</span>
            </Link>
            <Link href={`#${text.about.id}`} className={secondaryButton}>
              {text.cta.how}
            </Link>
            <ExternalLink href={whatsappUrl(locale)} locale={locale} className={secondaryButton}>
              {text.cta.whatsapp}
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
            {text.employers}
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

      <section id={text.cases.id} aria-labelledby={headingId(text.cases.id)} className="space-y-10">
        <SectionHeading
          id={headingId(text.cases.id)}
          index="01"
          eyebrow={text.cases.eyebrow}
          title={text.cases.title}
        >
          {text.cases.lead}
        </SectionHeading>
        <ol className="grid gap-6 lg:grid-cols-2">
          {getCases(locale).map((item, index) => (
            <li key={item.id}>
              <CaseCard item={item} position={index + 1} locale={locale} />
            </li>
          ))}
        </ol>
      </section>

      <section
        id={text.expertise.id}
        aria-labelledby={headingId(text.expertise.id)}
        className="space-y-10"
      >
        <SectionHeading
          id={headingId(text.expertise.id)}
          index="02"
          eyebrow={text.expertise.eyebrow}
          title={text.expertise.title}
        >
          {text.expertise.lead}
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

      <section id={text.about.id} aria-labelledby={headingId(text.about.id)} className="space-y-10">
        <SectionHeading
          id={headingId(text.about.id)}
          index="03"
          eyebrow={text.about.eyebrow}
          title={text.about.title}
          action={
            <Link href={text.about.more.href} className={sectionLink}>
              {text.about.more.label}
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
                <dt className="text-muted font-mono text-xs uppercase">{text.about.base}</dt>
                <dd>
                  {profile.location} · {site.contact.timezone}
                </dd>
              </div>
              <div className="bg-surface space-y-1 p-4">
                <dt className="text-muted font-mono text-xs uppercase">{text.about.languages}</dt>
                <dd>
                  {profile.languages
                    .map((language) => text.about.languageLine(language.name, language.level))
                    .join(" · ")}
                </dd>
              </div>
            </dl>
          </div>
          <div className="space-y-5">
            <h3 className="text-lg font-semibold">{text.about.ai}</h3>
            <p className="text-muted leading-relaxed">{aiPractice.lead}</p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {aiPractice.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <QualityPipeline locale={locale} />
            <p className="text-muted text-sm">{aiPractice.close}</p>
          </div>
        </div>
        <ol aria-label={text.about.principles} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <li key={principle.title} className="border-border space-y-2 rounded-lg border p-5">
              <span className="text-accent block font-mono text-xs">{twoDigits(index + 1)}</span>
              <h3 className="font-semibold">{principle.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{principle.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        id={text.skills.id}
        aria-labelledby={headingId(text.skills.id)}
        className="space-y-10"
      >
        <SectionHeading
          id={headingId(text.skills.id)}
          index="04"
          eyebrow={text.skills.eyebrow}
          title={text.skills.title}
          action={
            <Link
              href={text.skills.more.href}
              hrefLang={text.skills.more.hrefLang}
              className={sectionLink}
            >
              {text.skills.more.label}
            </Link>
          }
        >
          {text.skills.lead(totalSkills, stackGroups.length)}
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
                  <span className="sr-only">{text.skills.items(group.items.length)}</span>
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

      <section
        id={text.experience.id}
        aria-labelledby={headingId(text.experience.id)}
        className="space-y-10"
      >
        <SectionHeading
          id={headingId(text.experience.id)}
          index="05"
          eyebrow={text.experience.eyebrow}
          title={text.experience.title}
        >
          {text.experience.lead(formatCareerPeriod(locale), profile.experiences.length)}
        </SectionHeading>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <ExperienceTimeline
            experiences={profile.experiences}
            locale={locale}
            variant="expandable"
          />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <EducationSummary locale={locale} />
          </div>
        </div>
      </section>

      <section
        id={text.buildLog.id}
        aria-labelledby={headingId(text.buildLog.id)}
        className="space-y-8"
      >
        <SectionHeading
          id={headingId(text.buildLog.id)}
          index="06"
          eyebrow={text.buildLog.eyebrow}
          title={text.buildLog.title}
          action={
            <Link
              href={text.buildLog.more.href}
              hrefLang={text.buildLog.more.hrefLang}
              className={sectionLink}
            >
              {text.buildLog.more.label}
            </Link>
          }
        >
          {text.buildLog.lead}
        </SectionHeading>
        {/* Os posts existem só em português: o `lang` avisa leitores de tela e tradutores. */}
        <div
          lang="pt-BR"
          className="[&>ul]:grid [&>ul]:gap-4 [&>ul]:space-y-0 md:[&>ul]:grid-cols-2"
        >
          <PostList posts={latestPosts} headingLevel={3} />
        </div>
      </section>

      <section
        id={text.contact.id}
        aria-labelledby={headingId(text.contact.id)}
        className="border-border bg-surface grid gap-10 rounded-2xl border p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      >
        <div className="space-y-4">
          <p className={eyebrow}>
            <span className="text-muted">07 · </span>
            {text.contact.eyebrow}
          </p>
          <h2 id={headingId(text.contact.id)} className="text-3xl font-semibold tracking-tight">
            {text.contact.title}
          </h2>
          <p className="text-muted leading-relaxed">{text.contact.lead}</p>
          <p className="text-muted font-mono text-sm">
            {profile.location} · {site.contact.timezone}
          </p>
        </div>
        <ContactLinks locale={locale} />
      </section>
    </div>
  );
}
