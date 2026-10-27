import type { ReactNode } from "react";

type SectionHeadingProps = {
  /** Id do h2, para a seção apontar para ele com `aria-labelledby`. */
  id: string;
  /** Número da seção na home, como "01". */
  index?: string;
  eyebrow: string;
  title: string;
  /** Texto curto abaixo do título. */
  children?: ReactNode;
  /** Link à direita do título, como "Ver todos". */
  action?: ReactNode;
};

export function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  children,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="max-w-2xl space-y-2">
        <p className="text-accent font-mono text-xs font-medium tracking-[0.16em] uppercase">
          {index ? <span className="text-muted">{index} · </span> : null}
          {eyebrow}
        </p>
        <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {children ? <p className="text-muted leading-relaxed">{children}</p> : null}
      </div>
      {action}
    </div>
  );
}
