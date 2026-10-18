/**
 * Perfil profissional do Cleber, a partir do perfil do LinkedIn que ele enviou.
 * Contato pessoal (endereço, telefone) fica de fora de propósito: o repositório é público.
 */

/** Mês no formato `AAAA-MM`. */
export type YearMonth = `${number}-${number}`;

export type Experience = {
  company: string;
  role: string;
  start: YearMonth;
  /** Ausente no cargo atual. */
  end?: YearMonth;
  location: string;
  segment: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
};

export type Education = {
  institution: string;
  course: string;
  start: YearMonth;
  end: YearMonth;
};

export const profile = {
  fullName: "Cleber Costa Santos",
  location: "São Paulo, Brasil",
  /** Data em que o perfil foi conferido; base do cálculo de tempo de carreira. */
  asOf: "2026-10" as YearMonth,
  careerStart: "2019-10" as YearMonth,
  bio: [
    "Sou engenheiro de software full-stack sênior e construo sistemas críticos e escaláveis em segmentos bem diferentes: pagamentos digitais, fundos de investimento, gestão de estacionamentos, saúde, previdência e educação.",
    "No backend trabalho com .NET (C#), mensageria assíncrona com RabbitMQ/AMQP e Azure Service Bus e padrões de resiliência como idempotência, retry com backoff e reconciliação de estados. Uso bancos relacionais e NoSQL (SQL Server, PostgreSQL, MySQL, MongoDB) sempre com foco em segurança e consistência dos dados. No frontend, construo portais, webviews e interfaces com React, Angular e ASP.NET Razor.",
    "Em cloud e DevOps, atuo com AWS e Azure (APIM, App Services, DevOps, Boards), Docker, Kubernetes, Rancher e pipelines de CI/CD com SonarQube. Acompanho tudo em produção com Datadog, Instana, OpenTelemetry, Serilog e Microsoft Clarity.",
    "Meu foco são sistemas que sobrevivem ao ambiente real de produção: falhas parciais, eventos fora de ordem e provedores externos inconsistentes. Integro IA ao ciclo de engenharia com Claude Code, GitHub Copilot e Deadalus AI, sempre com revisão humana do que vai para produção.",
  ],
  experiences: [
    {
      company: "Exactaworks",
      role: "Desenvolvedor Sênior Full-Stack .NET",
      start: "2025-10",
      location: "São Paulo",
      segment: "Pagamentos · premiações e benefícios",
      summary:
        "Time de pagamentos do Familhão, responsável por fluxos financeiros críticos: Pix, cartão de crédito e débito, estornos e assinaturas com renovação recorrente.",
      highlights: [
        "Microsserviços .NET com comunicação assíncrona por Service Bus (filas e tópicos) e RabbitMQ/AMQP na AWS, com vários workers publicando eventos de pagamento e comunicação.",
        "Resiliência em fluxos financeiros: idempotência, tratamento de duplicidade, retry e reconciliação de estados, tratando resposta ambígua de provedor como potencial sucesso em vez de cancelar às cegas.",
        "Scripts operacionais em MongoDB para homologação com rollback seguro e validação pareada de cada escrita, para garantir reversibilidade e auditoria.",
        "Frontend em React (portal e webview embarcada em apps) e sistemas em ASP.NET Razor.",
        "Claude Code e GitHub Copilot no fluxo de desenvolvimento, com contexto de engenharia versionado (CLAUDE.md) definindo regras de arquitetura, ownership e limites de automação.",
        "Cloud híbrida: AWS para mensageria e workloads, Azure para APIM, App Services, DevOps e Boards.",
      ],
      stack: [".NET", "Azure Service Bus", "RabbitMQ", "AWS", "Azure", "MongoDB", "React", "Razor"],
    },
    {
      company: "BTG Pactual",
      role: "Desenvolvedor Sênior Full-Stack .NET",
      start: "2025-04",
      end: "2025-09",
      location: "São Paulo",
      segment: "Fundos de investimento",
      summary:
        "Projeto no time de Fundos de Investimento, com soluções críticas de cálculo de cotas (NAV), precificação de ativos e processos regulatórios e contábeis.",
      highlights: [
        "Backend .NET (C#) e frontend Vue.js e React integrados por APIs REST.",
        "Mensageria assíncrona com RabbitMQ; Docker e Kubernetes com Rancher em produção.",
        "Cache com Redis; testes de unidade e de integração com xUnit.",
        "CI/CD no Azure DevOps com quality gate do SonarQube; observabilidade com Datadog.",
      ],
      stack: [".NET", "Vue.js", "React", "RabbitMQ", "Kubernetes", "Rancher", "Redis", "Datadog"],
    },
    {
      company: "Estapar",
      role: "Desenvolvedor Sênior Full-Stack .NET",
      start: "2024-06",
      end: "2025-05",
      location: "São Paulo",
      segment: "Gestão de estacionamentos",
      summary:
        "Sistemas de gestão de estacionamentos, parquímetros e compra de cartões e tickets, em aplicações de ponta a ponta.",
      highlights: [
        "Pagamentos com Adyen e 3DS, e cartões com Firebase pay card.",
        "Sistemas distribuídos com Redis, Blob Storage, Docker e Kubernetes no Azure, monitorados com Datadog.",
        "Aplicações .NET de várias gerações, do Framework 4 ao .NET 8, com Angular e React no frontend.",
      ],
      stack: [".NET 8", "Angular", "React", "SQL Server", "MongoDB", "Azure", "Adyen", "Datadog"],
    },
    {
      company: "D'Or Consultoria",
      role: "Desenvolvedor Full-Stack Pleno .NET",
      start: "2020-11",
      end: "2024-06",
      location: "São Paulo",
      segment: "Saúde",
      summary:
        "Antes da contratação direta, já atuava havia um ano com o time de TI da D'Or pela consultoria ACT. No time de projetos, trouxe novas tecnologias e conceitos e ajudei a otimizar a área de desenvolvimento.",
      highlights: [
        "Projetos novos com entregas de qualidade e adoção de tecnologias e práticas modernas.",
        "Sustentação e melhoria de sistemas legados por solicitações com SLA.",
        "Aplicações .NET de várias gerações, do Framework 4 ao .NET 8.",
      ],
      stack: [".NET", "ASP.NET", "Angular", "React", "SQL Server", "MongoDB", "Azure DevOps"],
    },
    {
      company: "Conduent",
      role: "Desenvolvedor Full-Stack Pleno .NET",
      start: "2020-07",
      end: "2020-10",
      location: "São Paulo",
      segment: "Previdência",
      summary:
        "Sustentação de sistemas de previdência, capitalização e aplicação de fundos em Web Forms e ASP.",
      highlights: [
        'Projeto "MultiBra" do Bradesco: novo portal de previdência para participantes multipensions dentro do portal do banco, com validação por SMS e JWT.',
      ],
      stack: ["ASP.NET Web Forms", "ASP", "JWT"],
    },
    {
      company: "SOMOS Educação",
      role: "Desenvolvedor Júnior .NET",
      start: "2020-03",
      end: "2020-06",
      location: "São Paulo",
      segment: "Educação",
      summary:
        "Time Scrum integrado ao CRM da empresa, com dailies, reviews e retrospectivas em vagões de times.",
      highlights: [
        "Novas interfaces propostas pelo PO e automação das ferramentas do time e de processos no banco de dados.",
        "CRM em ASP.NET MVC com Angular nos layouts, sobre SQL Server e MySQL.",
      ],
      stack: ["ASP.NET MVC", "Angular", "SQL Server", "MySQL", "Scrum"],
    },
    {
      company: "Maktub Tech",
      role: "Desenvolvedor Júnior .NET",
      start: "2019-10",
      end: "2020-02",
      location: "São Caetano do Sul",
      segment: "Tecnologia",
      summary:
        "Primeiro cargo em tecnologia: uma área totalmente nova, integrada ao cliente, em desenvolvimento colaborativo.",
      highlights: ["ASP.NET MVC e SQL Server, com testes em Xamarin no aplicativo da empresa."],
      stack: ["ASP.NET MVC", "SQL Server", "Xamarin"],
    },
  ] satisfies readonly Experience[],
  education: [
    {
      institution: "UNINOVE",
      course: "Tecnólogo em Análise e Desenvolvimento de Sistemas",
      start: "2019-01",
      end: "2021-06",
    },
  ] satisfies readonly Education[],
  certifications: [
    "Fundamentos da IA Agente no GitHub",
    "Scrum Foundation Professional Certificate",
    "Angular 9: do básico ao avançado",
    "Angular 9 com APIs RESTful em Java/Spring",
    "C# primeiros passos: lógica de programação e algoritmos",
  ],
  languages: [
    { name: "Português", level: "Nativo" },
    { name: "Inglês", level: "Profissional limitado" },
  ],
} as const;

const monthNames = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
] as const;

function parseYearMonth(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

/** Meses contados como no LinkedIn: o mês de início e o de fim entram. */
export function monthsBetween(start: YearMonth, end: YearMonth): number {
  const a = parseYearMonth(start);
  const b = parseYearMonth(end);
  return (b.year - a.year) * 12 + (b.month - a.month) + 1;
}

/** "3 anos e 8 meses", "1 ano", "4 meses". */
export function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [
    years > 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : undefined,
    rest > 0 ? `${rest} ${rest === 1 ? "mês" : "meses"}` : undefined,
  ].filter(Boolean);
  return parts.join(" e ");
}

/** "out 2025". */
export function formatYearMonth(value: YearMonth): string {
  const { year, month } = parseYearMonth(value);
  return `${monthNames[month - 1]} ${year}`;
}

/** "abr 2025 – set 2025 · 6 meses" ou "out 2025 – atual" no cargo atual. */
export function formatPeriod(experience: Pick<Experience, "start" | "end">): string {
  if (!experience.end) {
    return `${formatYearMonth(experience.start)} – atual`;
  }
  const months = monthsBetween(experience.start, experience.end);
  return `${formatYearMonth(experience.start)} – ${formatYearMonth(experience.end)} · ${formatDuration(months)}`;
}

/** Anos completos de carreira até a data em que o perfil foi conferido. */
export function careerYears(): number {
  return Math.floor((monthsBetween(profile.careerStart, profile.asOf) - 1) / 12);
}

export const currentExperience = profile.experiences.find((experience) => !experience.end);
