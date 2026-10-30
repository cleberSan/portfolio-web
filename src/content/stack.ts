import type { Locale } from "@/i18n/locales";
import { stackTextEn } from "./stack.en";

const careflowTree = "https://github.com/cleberSan/careflow/tree/main";
const careflowBlob = "https://github.com/cleberSan/careflow/blob/main";

export type Evidence = { label: string; href: string };

export type StackItem = {
  name: string;
  /** Onde a tecnologia aparece em código público, quando aparece. */
  evidence?: Evidence;
};

export type StackGroup = {
  id: string;
  title: string;
  summary: string;
  items: readonly StackItem[];
};

const groups = [
  {
    id: "backend",
    title: "Backend e arquitetura",
    summary: "Serviços em .NET com domínio explícito, desenhados para crescer sem reescritas.",
    items: [
      {
        name: ".NET e ASP.NET Core",
        evidence: {
          label: "API de agenda do CareFlow",
          href: `${careflowTree}/src/Services/Scheduling/CareFlow.Scheduling.Api`,
        },
      },
      { name: "C# e APIs REST" },
      { name: "Microsserviços distribuídos" },
      {
        name: "Domain-Driven Design",
        evidence: {
          label: "Domínio da agenda",
          href: `${careflowTree}/src/Services/Scheduling/CareFlow.Scheduling.Domain`,
        },
      },
      {
        name: "TDD",
        evidence: {
          label: "Testes de unidade do domínio",
          href: `${careflowTree}/tests/CareFlow.Scheduling.UnitTests`,
        },
      },
      { name: "Clean Architecture e Arquitetura Hexagonal" },
      { name: "Clean Code, MVC e padrões de design" },
    ],
  },
  {
    id: "mensageria",
    title: "Mensageria e resiliência",
    summary:
      "Comunicação assíncrona que aguenta falha parcial, mensagem duplicada e provedor que responde de forma ambígua.",
    items: [
      {
        name: "RabbitMQ e AMQP",
        evidence: {
          label: "Camada de mensageria do CareFlow",
          href: `${careflowTree}/src/BuildingBlocks/CareFlow.BuildingBlocks.Messaging`,
        },
      },
      { name: "Azure Service Bus (filas e tópicos)" },
      {
        name: "Outbox e Inbox",
        evidence: {
          label: "ADR de mensageria com Outbox/Inbox",
          href: `${careflowBlob}/docs/adr/0006-mensageria-outbox-inbox-rabbitmq.md`,
        },
      },
      {
        name: "Idempotência e tratamento de duplicidade",
        evidence: {
          label: "Idempotency-Key na agenda",
          href: `${careflowBlob}/src/Services/Scheduling/CareFlow.Scheduling.Api/Common/Http/IdempotencyKey.cs`,
        },
      },
      {
        name: "Retry com backoff, circuit breaker e fallback",
        evidence: {
          label: "ADR de notificações com fallback",
          href: `${careflowBlob}/docs/adr/0009-notificacoes-com-fallback-e-falhas-injetaveis.md`,
        },
      },
      { name: "Reconciliação de estados" },
    ],
  },
  {
    id: "dados",
    title: "Dados",
    summary: "Bancos relacionais e NoSQL escolhidos pelo problema, com segurança e consistência.",
    items: [
      { name: "SQL Server" },
      {
        name: "PostgreSQL",
        evidence: {
          label: "Row-Level Security por clínica",
          href: `${careflowBlob}/docs/adr/0003-row-level-security-por-clinica.md`,
        },
      },
      { name: "MySQL" },
      { name: "MongoDB" },
      { name: "Redis" },
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    summary: "Interfaces modernas, acessíveis e rápidas, do SPA ao renderizado no servidor.",
    items: [
      { name: "React" },
      { name: "Angular" },
      { name: "Vue.js" },
      { name: "ASP.NET Razor" },
      {
        name: "Next.js e TypeScript",
        evidence: {
          label: "Código deste site",
          href: "https://github.com/cleberSan/portfolio-web",
        },
      },
    ],
  },
  {
    id: "cloud",
    title: "Cloud e DevOps",
    summary: "Nuvem pública, contêineres e pipelines com portão de qualidade.",
    items: [
      { name: "AWS" },
      { name: "Azure (APIM, App Services, Blob Storage)" },
      {
        name: "Docker e Kubernetes",
        evidence: {
          label: "Docker Compose do CareFlow",
          href: `${careflowBlob}/docker-compose.yml`,
        },
      },
      { name: "Rancher" },
      { name: "Azure DevOps, Boards e SonarQube" },
    ],
  },
  {
    id: "observabilidade",
    title: "Observabilidade",
    summary: "Logs, métricas e traces de ponta a ponta para entender o sistema em produção.",
    items: [
      { name: "Datadog" },
      { name: "Instana" },
      {
        name: "OpenTelemetry",
        evidence: {
          label: "Métricas e traces da agenda",
          href: `${careflowTree}/src/Services/Scheduling/CareFlow.Scheduling.Api/Common/Observability`,
        },
      },
      { name: "Serilog" },
      { name: "Microsoft Clarity" },
    ],
  },
  {
    id: "ia",
    title: "IA no fluxo de desenvolvimento",
    summary: "Ferramentas de IA para acelerar e qualificar entregas, sempre com revisão humana.",
    items: [{ name: "Claude Code" }, { name: "GitHub Copilot" }, { name: "Deadalus AI" }],
  },
] as const satisfies readonly StackGroup[];

export const stackGroups: readonly StackGroup[] = groups;

export type StackGroupId = (typeof groups)[number]["id"];

/**
 * Grupos de competências no idioma da página. Em inglês, as evidências (que apontam para a página
 * Stack, só em português) ficam de fora, e itens sem tradução mantêm o nome original da tecnologia.
 */
export function getStackGroups(locale: Locale): readonly StackGroup[] {
  if (locale === "pt-BR") {
    return stackGroups;
  }

  return stackGroups.map((group) => ({
    id: group.id,
    ...stackTextEn.groups[group.id as StackGroupId],
    items: group.items.map((item) => ({ name: stackTextEn.items[item.name] ?? item.name })),
  }));
}

/** Ferramentas que só aparecem no CareFlow; ficam separadas para não se misturar com a experiência profissional. */
export const careflowTooling: readonly StackItem[] = [
  {
    name: "PostgreSQL com exclusion constraints",
    evidence: {
      label: "ADR da agenda sem dupla reserva",
      href: `${careflowBlob}/docs/adr/0002-agenda-sem-dupla-reserva.md`,
    },
  },
  {
    name: "EF Core",
    evidence: {
      label: "Mapeamento e migrations",
      href: `${careflowTree}/src/Services/Scheduling/CareFlow.Scheduling.Api/Infrastructure/Persistence`,
    },
  },
  {
    name: "xUnit v3 e Testcontainers",
    evidence: {
      label: "Testes de integração com PostgreSQL real",
      href: `${careflowTree}/tests/CareFlow.Scheduling.IntegrationTests`,
    },
  },
  {
    name: "GitHub Actions, CodeQL e Dependabot",
    evidence: { label: "Workflows de CI", href: `${careflowTree}/.github/workflows` },
  },
];
