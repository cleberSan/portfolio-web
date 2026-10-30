import type { AiPractice, CiName, Principle, Service } from "./engineering";

/**
 * Princípios, IA, pipeline e atuação em inglês. Os rótulos dos portões são indexados pelo nome do
 * passo no CI, então o TypeScript recusa um portão sem tradução.
 */
export const engineeringEn: {
  principles: readonly Principle[];
  aiPractice: AiPractice;
  qualityPipeline: { stages: readonly string[]; gateLabels: Record<CiName, string> };
  services: readonly Service[];
} = {
  principles: [
    {
      title: "Domain-driven architecture",
      text: "DDD, Clean Architecture and Hexagonal Architecture to keep business rules explicit, testable and independent of infrastructure.",
    },
    {
      title: "Tests before confidence",
      text: "TDD and automated tests at every level, with quality gates in CI instead of review by eye alone.",
    },
    {
      title: "End-to-end observability",
      text: "Structured logs, metrics and traces with Datadog, Instana, OpenTelemetry and Serilog, to understand the system in production.",
    },
    {
      title: "AI as a tool, not a shortcut",
      text: "Claude Code, GitHub Copilot and Deadalus AI to speed up and improve deliveries, always with human review of what goes to production.",
    },
  ],
  aiPractice: {
    lead: "I use AI every day in engineering. It speeds things up, but I'm the one accountable for the code that goes to production.",
    items: [
      "Claude Code with versioned context in the repository (CLAUDE.md), which sets architecture rules, ownership and automation limits.",
      "GitHub Copilot to speed up coding with the project's context.",
      "Deadalus AI in pull request reviews.",
      "This site, CareFlow and Lojinha Da Lua were written with Claude Code and reviewed by me, one pull request at a time.",
    ],
    close: "Code written with AI goes through the same gates as any other code.",
  },
  qualityPipeline: {
    stages: ["Claude Code writes", "I review the PR", "CI checks", "Vercel deploys"],
    gateLabels: {
      Formatação: "formatting",
      Lint: "lint",
      Tipos: "types",
      "Testes com cobertura (mínimo 80%)": "tests ≥ 80%",
      Build: "build",
      "Testes E2E, acessibilidade (axe) e cabeçalhos HTTP": "E2E and accessibility",
      "Revisão de dependências": "dependencies",
      CodeQL: "CodeQL",
    },
  },
  services: [
    {
      title: ".NET backend and microservices",
      description:
        ".NET APIs and services with an explicit domain, asynchronous messaging and tests that make change safe.",
    },
    {
      title: "Payments and financial flows",
      description:
        "Pix, cards, refunds and subscriptions with idempotency, duplicate handling and reconciliation with the provider.",
    },
    {
      title: "React and Angular frontend",
      description:
        "Portals, webviews embedded in apps and admin screens integrated with the backend through REST APIs.",
    },
    {
      title: "Cloud and DevOps",
      description:
        "AWS and Azure, Docker and Kubernetes, and CI/CD pipelines with a quality gate before every deploy.",
    },
    {
      title: "Observability",
      description:
        "Structured logs, metrics and traces with Datadog, Instana, OpenTelemetry and Serilog to understand the system in production.",
    },
    {
      title: "AI-assisted engineering, with rules",
      description:
        "Claude Code and GitHub Copilot guided by architecture rules versioned in the repository, with human review of everything.",
    },
  ],
};
