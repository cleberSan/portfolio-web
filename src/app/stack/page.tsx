import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { StackItemList } from "@/components/stack-item-list";
import { careflowTooling, stackGroups } from "@/content/stack";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Tecnologias e práticas com que trabalho em backend, frontend, cloud, observabilidade e IA, com links para onde aparecem em código público.";

export const metadata: Metadata = pageMetadata({ title: "Stack", description, path: "/stack" });

export default function StackPage() {
  return (
    <div className="max-w-3xl space-y-16">
      <PageHeader title="Stack" eyebrow="Ferramentas e práticas">
        <p>
          O que uso no dia a dia. Quando uma tecnologia aparece em código aberto, o link leva direto
          para ela.
        </p>
      </PageHeader>

      {stackGroups.map((group) => (
        <section key={group.id} aria-labelledby={group.id} className="space-y-4">
          <div className="space-y-1">
            <h2 id={group.id} className="text-2xl font-semibold tracking-tight">
              {group.title}
            </h2>
            <p className="text-muted">{group.summary}</p>
          </div>
          <StackItemList items={group.items} />
        </section>
      ))}

      <section aria-labelledby="no-careflow" className="space-y-4">
        <div className="space-y-1">
          <h2 id="no-careflow" className="text-2xl font-semibold tracking-tight">
            Também no CareFlow
          </h2>
          <p className="text-muted">
            Ferramentas usadas no projeto vitrine, todas em código aberto.
          </p>
        </div>
        <StackItemList items={careflowTooling} />
      </section>
    </div>
  );
}
