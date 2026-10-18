import { type Experience, formatPeriod } from "@/content/profile";

type ExperienceTimelineProps = {
  experiences: readonly Experience[];
  /** Nível do título de cada cargo, para manter a hierarquia da página. */
  headingLevel?: 2 | 3;
  /** Na versão compacta (home), só o resumo; na completa (Sobre), destaques e stack. */
  variant?: "compact" | "full";
};

export function ExperienceTimeline({
  experiences,
  headingLevel = 3,
  variant = "full",
}: ExperienceTimelineProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ol className="border-border relative space-y-8 border-l pl-6">
      {experiences.map((experience) => {
        const current = !experience.end;
        return (
          <li key={`${experience.company}-${experience.start}`} className="relative">
            <span
              aria-hidden="true"
              className={`status-dot absolute top-1.5 -left-[1.8rem] size-2.5 rounded-full bg-current ${current ? "text-ok" : "text-muted"}`}
            />
            <article className="space-y-2">
              <p className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
                <span>{formatPeriod(experience)}</span>
                {current ? (
                  <span className="text-ok border-border rounded-md border px-1.5 py-0.5">
                    agora
                  </span>
                ) : null}
                <span>{experience.segment}</span>
              </p>
              <Heading className="text-lg font-semibold tracking-tight">
                {experience.role} <span className="text-accent">· {experience.company}</span>
              </Heading>
              <p className="text-muted max-w-3xl leading-relaxed">{experience.summary}</p>
              {variant === "full" ? (
                <>
                  <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
                    {experience.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  <ul
                    aria-label={`Stack na ${experience.company}`}
                    className="flex flex-wrap gap-2"
                  >
                    {experience.stack.map((item) => (
                      <li
                        key={item}
                        className="border-border text-muted rounded-md border px-2 py-0.5 font-mono text-xs"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
