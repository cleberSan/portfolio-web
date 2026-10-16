export type PhaseStatus = "concluida" | "planejada";

export type Phase = {
  number: number;
  title: string;
  demonstrates: string;
  status: PhaseStatus;
  /** Post do diário que conta a fase, quando existe. */
  postSlug?: string;
};

export const phaseStatusLabel: Record<PhaseStatus, string> = {
  concluida: "Concluída",
  planejada: "Planejada",
};

export const careflow = {
  name: "CareFlow",
  tagline:
    "Plataforma multi-clínica de agendamento e triagem assistida por IA, com privacidade por design (LGPD).",
  repository: "https://github.com/cleberSan/careflow",
  adrs: "https://github.com/cleberSan/careflow/tree/main/docs/adr",
  principles: [
    "Demonstração com dados 100% sintéticos, sem promessa clínica.",
    "Dados pessoais de saúde ficam isolados; os demais serviços recebem só um pseudônimo.",
    "Nenhum dado identificável chega a provedores de IA, e um humano confirma toda sugestão.",
    "Regras críticas garantidas no banco de dados, não só na aplicação.",
  ],
  services: [
    { name: "Agenda", description: "Horários por profissional e clínica, sem dupla reserva." },
    {
      name: "Cofre do paciente",
      description: "Dados pessoais cifrados por campo, com chave por clínica.",
    },
    {
      name: "Consentimento",
      description: "Base legal, finalidade e revogação propagada por eventos.",
    },
    {
      name: "Triagem",
      description: "Sugestão de prioridade com IA sobre dados pseudonimizados.",
    },
    {
      name: "Notificações",
      description: "WhatsApp, SMS e e-mail com fallback entre canais.",
    },
    { name: "Auditoria", description: "Trilha imutável de quem acessou qual dado e quando." },
  ],
} as const;

export const careflowPhases: readonly Phase[] = [
  {
    number: 0,
    title: "Repositórios, padrões e CI com qualidade e segurança",
    demonstrates: "Engenharia de base",
    status: "concluida",
    postSlug: "fase-0-fundacao",
  },
  {
    number: 1,
    title: "Site v1 com diário de bordo",
    demonstrates: "Frontend, SEO e acessibilidade",
    status: "concluida",
  },
  {
    number: 2,
    title: "Agenda multi-clínica sem dupla reserva",
    demonstrates: "DDD, concorrência e testes",
    status: "concluida",
    postSlug: "fase-2-agenda-sem-dupla-reserva",
  },
  {
    number: 3,
    title: "Cofre do paciente com cifragem por campo e RLS",
    demonstrates: "Segurança e LGPD",
    status: "concluida",
    postSlug: "fase-3-cofre-do-paciente",
  },
  {
    number: 4,
    title: "Consentimento e auditoria com Outbox/Inbox",
    demonstrates: "Sistemas distribuídos e compliance",
    status: "concluida",
    postSlug: "fase-4-consentimento-e-auditoria",
  },
  {
    number: 5,
    title: "Notificações com fallback e falhas injetáveis",
    demonstrates: "Resiliência",
    status: "concluida",
    postSlug: "fase-5-notificacoes-com-fallback",
  },
  {
    number: 6,
    title: "OpenTelemetry completo e Painel de Privacidade e Resiliência",
    demonstrates: "Observabilidade",
    status: "concluida",
    postSlug: "fase-6-observabilidade-e-painel",
  },
  {
    number: 7,
    title: "Triagem com IA, pseudonimização e guardrails",
    demonstrates: "IA aplicada com responsabilidade",
    status: "concluida",
    postSlug: "fase-7-triagem-com-ia",
  },
  {
    number: 8,
    title: "Direitos do titular e adaptador FHIR",
    demonstrates: "Interoperabilidade e LGPD",
    status: "planejada",
  },
  {
    number: 9,
    title: "Testes de carga, IaC e deploy canary",
    demonstrates: "Performance e DevOps",
    status: "planejada",
  },
];
