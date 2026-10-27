import type { Case } from "@/content/cases";
import { SmartLink } from "./smart-link";

const fields = [
  ["Problema", "problem"],
  ["Abordagem", "approach"],
  ["Resultado", "result"],
] as const;

type CaseCardProps = {
  item: Case;
  /** Posição na lista, a partir de 1. */
  position: number;
};

/** Um case no formato problema, abordagem e resultado, com a stack e os links do projeto. */
export function CaseCard({ item, position }: CaseCardProps) {
  const titleId = `case-${item.id}`;

  return (
    <article
      aria-labelledby={titleId}
      className="border-border bg-surface/60 flex h-full flex-col gap-5 rounded-xl border p-6"
    >
      <header className="space-y-2">
        <p className="text-muted flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs">
          <span className="text-accent">{String(position).padStart(2, "0")}</span>
          <span className="border-border rounded-md border px-1.5 py-0.5">{item.tag}</span>
          <span>{item.context}</span>
        </p>
        <h3 id={titleId} className="text-xl font-semibold tracking-tight text-balance">
          {item.title}
        </h3>
      </header>
      <dl className="space-y-4 text-sm leading-relaxed">
        {fields.map(([label, key]) => (
          <div
            key={key}
            className={key === "result" ? "border-accent space-y-1 border-l-2 pl-3" : "space-y-1"}
          >
            <dt className="text-muted font-mono text-xs tracking-[0.12em] uppercase">{label}</dt>
            <dd className={key === "result" ? "font-medium" : undefined}>{item[key]}</dd>
          </div>
        ))}
      </dl>
      <ul aria-label={`Stack: ${item.title}`} className="mt-auto flex flex-wrap gap-1.5">
        {item.stack.map((name) => (
          <li
            key={name}
            className="bg-background text-muted rounded-md px-2 py-0.5 font-mono text-xs"
          >
            {name}
          </li>
        ))}
      </ul>
      {item.links ? (
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {item.links.map((link) => (
            <SmartLink
              key={link.href}
              href={link.href}
              className="text-accent font-medium underline underline-offset-4"
            >
              {link.label}
            </SmartLink>
          ))}
        </p>
      ) : null}
    </article>
  );
}
