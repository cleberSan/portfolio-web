import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { EducationSummary } from "@/components/education-summary";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { getSiteText, site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import { getEngineering } from "@/content/engineering";
import { getProfile } from "@/content/profile";
import { getStackGroups } from "@/content/stack";
import type { Locale } from "@/i18n/locales";
import { aboutText } from "./about-text";

const sectionTitle = "text-2xl font-semibold tracking-tight";

/** Página Sobre, a mesma nos dois idiomas: só os textos mudam. */
export function AboutPage({ locale }: { locale: Locale }) {
  const text = aboutText[locale];
  const { role } = getSiteText(locale);
  const profile = getProfile(locale);
  const { principles } = getEngineering(locale);
  const currentExperience = profile.experiences.find((experience) => !experience.end);
  const { inTheOpen } = text;

  return (
    <div className="max-w-3xl space-y-16">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          jobTitle: role,
          url: new URL(text.path, siteUrl.url).href,
          sameAs: [site.links.linkedin, site.links.github],
          homeLocation: { "@type": "Place", name: profile.location },
          ...(currentExperience
            ? { worksFor: { "@type": "Organization", name: currentExperience.company } }
            : {}),
          alumniOf: profile.education.map((education) => ({
            "@type": "CollegeOrUniversity",
            name: education.institution,
          })),
          knowsAbout: getStackGroups(locale).flatMap((group) =>
            group.items.map((item) => item.name),
          ),
        }}
      />

      <PageHeader title={text.title} eyebrow={role}>
        <p>{profile.bio[0]}</p>
      </PageHeader>

      <section aria-labelledby={text.whoAmI.id} className="space-y-6">
        <h2 id={text.whoAmI.id} className={sectionTitle}>
          {text.whoAmI.title}
        </h2>
        <div className="text-muted space-y-4 leading-relaxed">
          {profile.bio.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="border-border bg-border grid gap-px overflow-hidden rounded-lg border sm:grid-cols-3">
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">{text.whoAmI.base}</dt>
            <dd>{profile.location}</dd>
          </div>
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">{text.whoAmI.education}</dt>
            <dd>{text.whoAmI.educationValue}</dd>
          </div>
          <div className="bg-surface space-y-1 p-4">
            <dt className="text-muted font-mono text-xs uppercase">{text.whoAmI.languages}</dt>
            <dd>
              {profile.languages.map((language) => language.name).join(` ${text.whoAmI.and} `)}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby={text.experience.id} className="space-y-8">
        <h2 id={text.experience.id} className={sectionTitle}>
          {text.experience.title}
        </h2>
        <ExperienceTimeline experiences={profile.experiences} locale={locale} />
      </section>

      <section aria-labelledby={text.howIWork.id} className="space-y-6">
        <h2 id={text.howIWork.id} className={sectionTitle}>
          {text.howIWork.title}
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

      <section aria-labelledby={text.educationAndCertifications.id} className="space-y-6">
        <h2 id={text.educationAndCertifications.id} className={sectionTitle}>
          {text.educationAndCertifications.title}
        </h2>
        <EducationSummary locale={locale} />
      </section>

      <section aria-labelledby={inTheOpen.id} className="space-y-4">
        <h2 id={inTheOpen.id} className={sectionTitle}>
          {inTheOpen.title}
        </h2>
        <p className="text-muted leading-relaxed">
          {inTheOpen.before}
          <Link
            href={inTheOpen.careflow.href}
            hrefLang={inTheOpen.careflow.hrefLang}
            className="text-foreground underline"
          >
            {inTheOpen.careflow.label}
          </Link>
          {inTheOpen.middle}
          <Link
            href={inTheOpen.buildLog.href}
            hrefLang={inTheOpen.buildLog.hrefLang}
            className="text-foreground underline"
          >
            {inTheOpen.buildLog.label}
          </Link>
          {inTheOpen.after}
        </p>
      </section>

      <section aria-labelledby={text.contact.id} className="space-y-4">
        <h2 id={text.contact.id} className={sectionTitle}>
          {text.contact.title}
        </h2>
        <p className="text-muted leading-relaxed">{text.contact.lead}</p>
        <ContactLinks locale={locale} />
      </section>
    </div>
  );
}
