import { formatYearMonth, getProfile } from "@/content/profile";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";

type EducationSummaryProps = {
  locale: Locale;
  /** Nível dos títulos (Formação, Certificações, Idiomas), para manter a hierarquia da página. */
  headingLevel?: 3 | 4;
};

/**
 * Formação, certificações e idiomas. O layout se ajusta à largura do próprio bloco (container
 * query), então serve tanto na coluna estreita da home quanto na coluna larga do Sobre.
 */
export function EducationSummary({ locale, headingLevel = 3 }: EducationSummaryProps) {
  const Heading = headingLevel === 3 ? "h3" : "h4";
  const profile = getProfile(locale);
  const text = dictionaries[locale].education;

  return (
    <div className="@container space-y-8">
      <div className="space-y-3">
        <Heading className="font-semibold">{text.education}</Heading>
        <ul className="space-y-3">
          {profile.education.map((education) => (
            <li key={education.course} className="border-border rounded-lg border p-4">
              <p className="font-semibold">{education.course}</p>
              <p className="text-muted font-mono text-sm">
                {education.institution} · {formatYearMonth(education.start, locale)} –{" "}
                {formatYearMonth(education.end, locale)}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-8 @lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <Heading className="font-semibold">{text.certifications}</Heading>
          <ul className="text-muted list-disc space-y-1.5 pl-5">
            {profile.certifications.map((certification) => (
              <li key={certification}>{certification}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <Heading className="font-semibold">{text.languages}</Heading>
          <dl className="space-y-1.5">
            {profile.languages.map((language) => (
              <div key={language.name} className="flex flex-wrap justify-between gap-x-3">
                <dt>{language.name}</dt>
                <dd className="text-muted">{language.level}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
