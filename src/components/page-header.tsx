import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  /** Texto curto acima do título, como a seção ou a fase. */
  eyebrow?: string;
  children?: ReactNode;
};

export function PageHeader({ title, eyebrow, children }: PageHeaderProps) {
  return (
    <header className="space-y-4">
      {eyebrow ? (
        <p className="text-accent font-mono text-xs font-medium tracking-[0.16em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
      {children ? <div className="text-muted text-lg leading-relaxed">{children}</div> : null}
    </header>
  );
}
