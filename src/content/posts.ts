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
  {
    slug: "fase-3-cofre-do-paciente",
    title: "Fase 3: cofre do paciente com cifragem por campo e RLS",
    description:
      "Envelope encryption com chave por clínica, blind index para buscar CPF sem guardá-lo e Row-Level Security no PostgreSQL, com testes que leem o banco direto.",
    publishedAt: "2026-10-14",
    phase: 3,
    tags: ["Criptografia", "LGPD", "PostgreSQL", "Multi-tenancy"],
  },
  {
    slug: "fase-4-consentimento-e-auditoria",
    title: "Fase 4: consentimento, auditoria e eventos que não se perdem",
    description:
      "Revogação de consentimento propagada por RabbitMQ com Outbox e Inbox, trilha de auditoria com cadeia HMAC e testes que derrubam o broker no meio do fluxo.",
    publishedAt: "2026-10-15",
    phase: 4,
    tags: ["Mensageria", "LGPD", "Resiliência", "Auditoria"],
  },
  {
    slug: "fase-5-notificacoes-com-fallback",
    title: "Fase 5: notificações com fallback e falhas injetáveis",
    description:
      "WhatsApp, SMS e e-mail com circuit breaker por canal, retry sem mensagem duplicada, falhas injetadas de propósito e contato do paciente lido só no cofre.",
    publishedAt: "2026-10-15",
    phase: 5,
    tags: ["Resiliência", "Polly", "LGPD", "Chaos engineering"],
  },
  {
    slug: "fase-6-observabilidade-e-painel",
    title: "Fase 6: um trace por reserva e um painel que não inventa nada",
    description:
      "OpenTelemetry atravessando o RabbitMQ, três barreiras contra dado pessoal na telemetria e um Painel que reproduz uma execução real gravada pelo CI.",
    publishedAt: "2026-10-15",
    phase: 6,
    tags: ["OpenTelemetry", "Observabilidade", "LGPD", "Segurança"],
  },
  {
    slug: "fase-7-triagem-com-ia",
    title: "Fase 7: triagem com IA sem deixar o dado pessoal sair",
    description:
      "Queixa em texto livre mascarada antes do modelo, regras de alarme que a IA não rebaixa, ataques de prompt injection nos testes e um profissional confirmando cada sugestão.",
    publishedAt: "2026-10-15",
    phase: 7,
    tags: ["IA", "LGPD", "Segurança", "Claude"],
  },
  {
    slug: "fase-8-direitos-do-titular",
    title: "Fase 8: os dados de volta, a eliminação e a auditoria intacta",
    description:
      "Pedidos do titular atravessando seis serviços por eventos, um pacote com Bundle HL7 FHIR R4, crypto-shredding com uma chave por paciente e a cadeia de auditoria verificável depois de tudo.",
    publishedAt: "2026-10-16",
    phase: 8,
    tags: ["LGPD", "FHIR", "Criptografia", "Sistemas distribuídos"],
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
