export type Post = {
  /** Também é o nome do arquivo em `src/content/diario/<slug>.mdx`. */
  slug: string;
  title: string;
  description: string;
  /** Data de publicação no formato `AAAA-MM-DD`. */
  publishedAt: string;
  /** Fase do roadmap do CareFlow a que o post se refere. */
  phase: number;
  tags: readonly string[];
};

const posts: readonly Post[] = [
  {
    slug: "fase-0-fundacao",
    title: "Fase 0: a base antes da primeira regra de negócio",
    description:
      "Por que o CareFlow começou por CI, análise estática, cobertura mínima e ADRs, e o que cada portão de qualidade protege.",
    publishedAt: "2026-10-14",
    phase: 0,
    tags: [".NET 10", "CI/CD", "Segurança", "ADR"],
  },
  {
    slug: "fase-2-agenda-sem-dupla-reserva",
    title: "Fase 2: agenda multi-clínica sem dupla reserva",
    description:
      "Como uma exclusion constraint no PostgreSQL e chaves de idempotência impedem duas consultas no mesmo horário, e o bug de corrida que os testes encontraram.",
    publishedAt: "2026-10-14",
    phase: 2,
    tags: ["PostgreSQL", "Concorrência", "Idempotência", "Multi-tenancy"],
  },
];

/** Posts do mais recente para o mais antigo; no mesmo dia, a fase mais avançada vem primeiro. */
export function getAllPosts(): readonly Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.phase - a.phase);
}

/** Busca apenas na lista conhecida: o slug da URL nunca vira caminho de arquivo sem passar por aqui. */
export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}

export function getLatestPosts(count: number): readonly Post[] {
  return getAllPosts().slice(0, Math.max(0, count));
}
