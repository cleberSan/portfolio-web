import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { careflow, careflowPhases } from "@/content/careflow";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Projetos construídos em público, com código aberto, decisões registradas e testes automatizados.";

export const metadata: Metadata = pageMetadata({
  title: "Projetos",
  description,
  path: "/projetos",
});

export default function ProjetosPage() {
  const done = careflowPhases.filter((phase) => phase.status === "concluida").length;

  return (
    <div className="max-w-3xl space-y-12">
      <PageHeader title="Projetos" eyebrow="Trabalho à vista">
        <p>{description}</p>
      </PageHeader>

      <ul className="space-y-6">
        <li>
          <article className="border-border bg-surface space-y-4 rounded-xl border p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              <Link href="/projetos/careflow" className="hover:underline">
                {careflow.name}
              </Link>
            </h2>
            <p className="text-muted leading-relaxed">{careflow.tagline}</p>
            <div className="space-y-2">
              <p className="font-mono text-sm">
                {done} de {careflowPhases.length} fases concluídas
              </p>
              <ol aria-hidden="true" className="flex gap-1">
                {careflowPhases.map((phase) => (
                  <li
                    key={phase.number}
                    className={`h-2 flex-1 rounded-sm ${phase.status === "concluida" ? "bg-accent" : "bg-border"}`}
                  />
                ))}
              </ol>
            </div>
          </article>
        </li>
      </ul>
    </div>
  );
}
