import type { Company, Course, Experience, Language } from "./profile";

type ExperienceText = Pick<Experience, "role" | "segment" | "summary" | "highlights">;

/**
 * Textos do perfil em inglês, sobre as mesmas datas, empresas e stack de `profile.ts`. Cada cargo
 * e cada curso é indexado pelo nome em português, então o TypeScript recusa um cargo sem tradução.
 * Nomes de empresa, cidade e produto não se traduzem.
 */
export const profileTextEn: {
  location: string;
  bio: readonly string[];
  experiences: Record<Company, ExperienceText>;
  education: Record<Course, string>;
  certifications: readonly string[];
  languages: readonly Language[];
} = {
  location: "São Paulo, Brazil",
  bio: [
    "I'm a senior full-stack software engineer who builds critical, scalable systems across very different industries: digital payments, investment funds, parking management, healthcare, pension plans and education.",
    "On the backend I work with .NET (C#), asynchronous messaging with RabbitMQ/AMQP and Azure Service Bus, and resilience patterns such as idempotency, retry with backoff and state reconciliation. I use relational and NoSQL databases (SQL Server, PostgreSQL, MySQL, MongoDB), always focused on data security and consistency. On the frontend, I build portals, webviews and interfaces with React, Angular and ASP.NET Razor.",
    "In cloud and DevOps, I work with AWS and Azure (APIM, App Services, DevOps, Boards), Docker, Kubernetes, Rancher and CI/CD pipelines with SonarQube. I follow everything in production with Datadog, Instana, OpenTelemetry, Serilog and Microsoft Clarity.",
    "My focus is systems that survive real production: partial failures, out-of-order events and inconsistent third-party providers. I bring AI into the engineering cycle with Claude Code, GitHub Copilot and Deadalus AI, always with human review of what goes to production.",
  ],
  experiences: {
    Exactaworks: {
      role: "Senior Full-Stack .NET Developer",
      segment: "Payments · rewards and benefits",
      summary:
        "On the Familhão payments team, I worked on critical financial flows: Pix (Brazil's instant payments), credit and debit cards, refunds and recurring subscription renewals.",
      highlights: [
        ".NET microservices communicating asynchronously over Service Bus (queues and topics) and RabbitMQ/AMQP on AWS, with several workers publishing payment and messaging events.",
        "Resilience in financial flows: idempotency, duplicate handling, retry and state reconciliation, treating an ambiguous provider response as a potential success instead of cancelling blindly.",
        "Operational MongoDB scripts for staging with safe rollback and paired validation of every write, to guarantee reversibility and auditability.",
        "React frontend (a portal and a webview embedded in apps) and ASP.NET Razor systems.",
        "Claude Code and GitHub Copilot in the development workflow, with versioned engineering context (CLAUDE.md) defining architecture rules, ownership and automation limits.",
        "Hybrid cloud: AWS for messaging and workloads, Azure for APIM, App Services, DevOps and Boards.",
      ],
    },
    "BTG Pactual": {
      role: "Senior Full-Stack .NET Developer",
      segment: "Investment funds",
      summary:
        "Project with the Investment Funds team, on critical solutions for fund share (NAV) calculation, asset pricing and regulatory and accounting processes.",
      highlights: [
        ".NET (C#) backend and Vue.js and React frontend integrated through REST APIs.",
        "Asynchronous messaging with RabbitMQ; Docker and Kubernetes with Rancher in production.",
        "Caching with Redis; unit and integration tests with xUnit.",
        "CI/CD on Azure DevOps with a SonarQube quality gate; observability with Datadog.",
      ],
    },
    Estapar: {
      role: "Senior Full-Stack .NET Developer",
      segment: "Parking management",
      summary:
        "Systems for parking management, parking meters and the purchase of parking cards and tickets, in end-to-end applications.",
      highlights: [
        "Payments with Adyen and 3DS, and cards with Firebase pay card.",
        "Distributed systems with Redis, Blob Storage, Docker and Kubernetes on Azure, monitored with Datadog.",
        ".NET applications across several generations, from .NET Framework 4 to .NET 8, with Angular and React on the frontend.",
      ],
    },
    "D'Or Consultoria": {
      role: "Mid-level Full-Stack .NET Developer",
      segment: "Healthcare",
      summary:
        "Before being hired directly, I had already worked with D'Or's IT team for a year through the consultancy ACT. On the projects team, I brought in new technologies and concepts and helped streamline the development area.",
      highlights: [
        "New projects with quality deliveries and the adoption of modern technologies and practices.",
        "Maintenance and improvement of legacy systems through SLA-based requests.",
        ".NET applications across several generations, from .NET Framework 4 to .NET 8.",
      ],
    },
    Conduent: {
      role: "Mid-level Full-Stack .NET Developer",
      segment: "Pension plans",
      summary:
        "Maintenance of pension, capitalization and fund investment systems in Web Forms and ASP.",
      highlights: [
        "Bradesco's \"MultiBra\" project: a new pension portal for Multipensions plan participants inside the bank's portal, with SMS and JWT validation.",
      ],
    },
    "SOMOS Educação": {
      role: "Junior .NET Developer",
      segment: "Education",
      summary:
        "Scrum team integrated with the company's CRM, with dailies, reviews and retrospectives across a train of teams.",
      highlights: [
        "New interfaces proposed by the PO and automation of team tools and database processes.",
        "CRM in ASP.NET MVC with Angular layouts, on SQL Server and MySQL.",
      ],
    },
    "Maktub Tech": {
      role: "Junior .NET Developer",
      segment: "Technology",
      summary:
        "First role in tech: an entirely new field, working closely with the client in collaborative development.",
      highlights: ["ASP.NET MVC and SQL Server, with Xamarin testing on the company's app."],
    },
  },
  education: {
    "Tecnólogo em Análise e Desenvolvimento de Sistemas":
      "Technologist degree in Systems Analysis and Development",
  },
  certifications: [
    "Agentic AI Fundamentals on GitHub",
    "Scrum Foundation Professional Certificate",
    "Angular 9: from basics to advanced",
    "Angular 9 with RESTful APIs in Java/Spring",
    "C# first steps: programming logic and algorithms",
  ],
  languages: [
    { name: "Portuguese", level: "Native" },
    { name: "English", level: "Limited working proficiency" },
  ],
};
