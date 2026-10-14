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

export const stackGroups: readonly StackGroup[] = [
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
    ],
  },
  {
    id: "frontend",
    title: "Frontend",
    summary: "Interfaces modernas, acessíveis e rápidas, do SPA ao renderizado no servidor.",
    items: [
      { name: "React" },
      { name: "Angular" },
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
    title: "Cloud",
    summary: "Soluções em nuvem pública com foco em alta disponibilidade.",
    items: [{ name: "AWS" }, { name: "Azure" }],
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
    ],
  },
  {
    id: "ia",
    title: "IA no fluxo de desenvolvimento",
    summary: "Ferramentas de IA para acelerar e qualificar entregas, sempre com revisão humana.",
    items: [{ name: "Claude Code" }, { name: "GitHub Copilot" }, { name: "Deadalus AI" }],
  },
];

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
