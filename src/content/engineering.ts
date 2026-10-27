/** Como o Cleber trabalha: princípios, uso de IA, portões de qualidade e o que ele entrega a um time. */

export type Principle = { title: string; text: string };

export const principles: readonly Principle[] = [
  {
    title: "Arquitetura orientada a domínio",
    text: "DDD, Clean Architecture e Arquitetura Hexagonal para manter regra de negócio explícita, testável e independente de infraestrutura.",
  },
  {
    title: "Testes antes da confiança",
    text: "TDD e testes automatizados em todos os níveis, com portões de qualidade no CI em vez de revisão só no olho.",
  },
  {
    title: "Observabilidade de ponta a ponta",
    text: "Logs estruturados, métricas e traces com Datadog, Instana, OpenTelemetry e Serilog, para entender o sistema em produção.",
  },
  {
    title: "IA como ferramenta, não como atalho",
    text: "Claude Code, GitHub Copilot e Deadalus AI para acelerar e qualificar entregas, sempre com revisão humana do que vai para produção.",
  },
];

export const aiPractice = {
  lead: "Uso IA todos os dias na engenharia. Ela acelera, mas quem responde pelo código que vai para produção sou eu.",
  items: [
    "Claude Code com contexto versionado no repositório (CLAUDE.md), que define regras de arquitetura, ownership e limites de automação.",
    "GitHub Copilot para acelerar código com o contexto do projeto.",
    "Deadalus AI na revisão de pull requests.",
    "Este site, o CareFlow e a Lojinha Da Lua foram escritos com o Claude Code e revisados por mim, um pull request por vez.",
  ],
  close: "Código escrito com IA passa pelos mesmos portões que qualquer outro.",
} as const;

/**
 * Etapas e portões reais do CI deste site (`.github/workflows`). `ciName` é o nome do passo ou do
 * job no workflow, e um teste confere que ele existe, para o painel não prometer o que o CI não roda.
 */
export type QualityGate = { label: string; ciName: string };

export const qualityPipeline = {
  stages: ["Claude Code escreve", "Eu reviso o PR", "O CI confere", "A Vercel publica"],
  gates: [
    { label: "formatação", ciName: "Formatação" },
    { label: "lint", ciName: "Lint" },
    { label: "tipos", ciName: "Tipos" },
    { label: "testes ≥ 80%", ciName: "Testes com cobertura (mínimo 80%)" },
    { label: "build", ciName: "Build" },
    { label: "E2E e acessibilidade", ciName: "Testes E2E, acessibilidade (axe) e cabeçalhos HTTP" },
    { label: "dependências", ciName: "Revisão de dependências" },
    { label: "CodeQL", ciName: "CodeQL" },
  ] satisfies readonly QualityGate[],
} as const;

export type Service = { title: string; description: string };

/** O que ele leva para um time, sempre ancorado no que já fez em produção. */
export const services: readonly Service[] = [
  {
    title: "Backend .NET e microsserviços",
    description:
      "APIs e serviços em .NET com domínio explícito, mensageria assíncrona e testes que sustentam mudanças.",
  },
  {
    title: "Pagamentos e fluxos financeiros",
    description:
      "Pix, cartão, estorno e assinatura com idempotência, tratamento de duplicidade e reconciliação com o provedor.",
  },
  {
    title: "Frontend React e Angular",
    description:
      "Portais, webviews embarcadas em apps e telas administrativas integradas ao backend por APIs REST.",
  },
  {
    title: "Cloud e DevOps",
    description:
      "AWS e Azure, Docker e Kubernetes, e pipelines de CI/CD com quality gate antes de cada deploy.",
  },
  {
    title: "Observabilidade",
    description:
      "Logs estruturados, métricas e traces com Datadog, Instana, OpenTelemetry e Serilog para entender o sistema em produção.",
  },
  {
    title: "Engenharia com IA, com regras",
    description:
      "Claude Code e GitHub Copilot guiados por regras de arquitetura versionadas no repositório, com revisão humana de tudo.",
  },
];
