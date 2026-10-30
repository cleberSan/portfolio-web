import type { StackGroupId } from "./stack";

/**
 * Grupos e itens de competência em inglês. Os grupos são indexados pelo id, então o TypeScript
 * recusa um grupo sem tradução. Nos itens, só entram os nomes com palavras em português; um teste
 * recusa item em português sem tradução e tradução de item que não existe mais.
 */
export const stackTextEn: {
  groups: Record<StackGroupId, { title: string; summary: string }>;
  items: Readonly<Record<string, string>>;
} = {
  groups: {
    backend: {
      title: "Backend and architecture",
      summary: ".NET services with an explicit domain, designed to grow without rewrites.",
    },
    mensageria: {
      title: "Messaging and resilience",
      summary:
        "Asynchronous communication that survives partial failures, duplicate messages and providers that respond ambiguously.",
    },
    dados: {
      title: "Data",
      summary:
        "Relational and NoSQL databases chosen by the problem, with security and consistency.",
    },
    frontend: {
      title: "Frontend",
      summary: "Modern, accessible and fast interfaces, from SPAs to server rendering.",
    },
    cloud: {
      title: "Cloud and DevOps",
      summary: "Public cloud, containers and pipelines with a quality gate.",
    },
    observabilidade: {
      title: "Observability",
      summary: "End-to-end logs, metrics and traces to understand the system in production.",
    },
    ia: {
      title: "AI in the development workflow",
      summary: "AI tools to speed up and improve deliveries, always with human review.",
    },
  },
  items: {
    ".NET e ASP.NET Core": ".NET and ASP.NET Core",
    "C# e APIs REST": "C# and REST APIs",
    "Microsserviços distribuídos": "Distributed microservices",
    "Clean Architecture e Arquitetura Hexagonal": "Clean Architecture and Hexagonal Architecture",
    "Clean Code, MVC e padrões de design": "Clean Code, MVC and design patterns",
    "RabbitMQ e AMQP": "RabbitMQ and AMQP",
    "Azure Service Bus (filas e tópicos)": "Azure Service Bus (queues and topics)",
    "Outbox e Inbox": "Outbox and Inbox",
    "Idempotência e tratamento de duplicidade": "Idempotency and duplicate handling",
    "Retry com backoff, circuit breaker e fallback":
      "Retry with backoff, circuit breaker and fallback",
    "Reconciliação de estados": "State reconciliation",
    "Next.js e TypeScript": "Next.js and TypeScript",
    "Docker e Kubernetes": "Docker and Kubernetes",
    "Azure DevOps, Boards e SonarQube": "Azure DevOps, Boards and SonarQube",
  },
};
