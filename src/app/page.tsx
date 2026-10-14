import type { Metadata } from "next";
import Link from "next/link";
import { PostList } from "@/components/post-list";
import { site } from "@/config/site";
import { careflow } from "@/content/careflow";
import { getLatestPosts } from "@/content/posts";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: `${site.name} | ${site.role}`,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default function Home() {
  const latestPosts = getLatestPosts(2);

  return (
    <div className="space-y-20">
      <header className="space-y-6">
        <p className="text-accent text-sm font-medium tracking-widest uppercase">{site.role}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-muted text-xl leading-relaxed">{site.description}</p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            href="/projetos/careflow"
            className="bg-foreground text-background rounded-md px-5 py-2.5 font-medium hover:opacity-90"
          >
            Conhecer o CareFlow
          </Link>
          <Link
            href="/diario"
            className="border-border hover:bg-surface rounded-md border px-5 py-2.5 font-medium"
          >
            Ler o diário de bordo
          </Link>
        </div>
      </header>

      <section aria-labelledby="foco" className="space-y-4">
        <h2 id="foco" className="text-2xl font-semibold tracking-tight">
          Foco
        </h2>
        <ul className="text-muted list-disc space-y-1 pl-5">
          {site.focusAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="careflow" className="border-border space-y-4 rounded-lg border p-6">
        <p className="text-accent text-sm font-medium tracking-widest uppercase">
          Projeto em destaque
        </p>
        <h2 id="careflow" className="text-2xl font-semibold tracking-tight">
          {careflow.name}
        </h2>
        <p className="text-muted leading-relaxed">
          {careflow.tagline} Construído em fases públicas com .NET e microsserviços, cada etapa vira
          código revisado, decisões registradas e um post neste diário.
        </p>
        <Link
          href="/projetos/careflow"
          className="inline-block font-medium underline underline-offset-4"
        >
          Ver arquitetura e roadmap
        </Link>
      </section>

      <section aria-labelledby="diario" className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="diario" className="text-2xl font-semibold tracking-tight">
            Diário de bordo
          </h2>
          <Link href="/diario" className="text-muted hover:text-foreground underline">
            Todos os posts
          </Link>
        </div>
        <PostList posts={latestPosts} headingLevel={3} />
      </section>

      <section aria-labelledby="setores" className="space-y-4">
        <h2 id="setores" className="text-2xl font-semibold tracking-tight">
          Para quem eu trabalho
        </h2>
        <p className="text-muted leading-relaxed">
          Empresas que precisam de soluções críticas nestes setores, e startups e scale-ups que
          buscam arquiteturas modernas, escaláveis e seguras.
        </p>
        <ul className="flex flex-wrap gap-2">
          {site.sectors.map((sector) => (
            <li key={sector} className="bg-surface rounded-md px-3 py-1 text-sm">
              {sector}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
