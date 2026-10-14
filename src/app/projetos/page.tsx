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
    <div className="space-y-12">
      <PageHeader title="Projetos" eyebrow="Trabalho à vista">
        <p>{description}</p>
      </PageHeader>

      <ul className="space-y-6">
        <li>
          <article className="border-border space-y-3 rounded-lg border p-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              <Link href="/projetos/careflow" className="hover:underline">
                {careflow.name}
              </Link>
            </h2>
            <p className="text-muted leading-relaxed">{careflow.tagline}</p>
            <p className="text-sm">
              {done} de {careflowPhases.length} fases concluídas
            </p>
          </article>
        </li>
      </ul>
    </div>
  );
}
