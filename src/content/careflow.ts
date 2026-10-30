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
    {
      name: "Agenda",
      signal: "sem dupla reserva",
      description: "Horários por profissional e clínica, sem dupla reserva.",
    },
    {
      name: "Cofre do paciente",
      signal: "cifra por campo",
      description: "Dados pessoais cifrados por campo, com chave por paciente.",
    },
    {
      name: "Consentimento",
      signal: "revogação por evento",
      description: "Base legal, finalidade e revogação propagada por eventos.",
    },
    {
      name: "Triagem",
      signal: "IA pseudonimizada",
      description: "Sugestão de prioridade com IA sobre dados pseudonimizados.",
    },
    {
      name: "Notificações",
      signal: "fallback de canal",
      description: "WhatsApp, SMS e e-mail com fallback entre canais.",
    },
    {
      name: "Auditoria",
      signal: "cadeia HMAC",
      description: "Trilha imutável de quem acessou qual dado e quando.",
    },
    {
      name: "Pedidos do titular",
      signal: "FHIR R4",
      description: "Acesso, portabilidade com Bundle HL7 FHIR e eliminação por crypto-shredding.",
    },
  ],
  /** Avaliação da triagem com IA no CI, contada no post da fase 7. */
  triageEval: {
    withinOneLevel: "93,6%",
    postSlug: "fase-7-triagem-com-ia",
  },
} as const;

/**
 * Vídeo de um minuto com o caminho de uma paciente: a tela dela à esquerda e os serviços à direita.
 * Não tem áudio; a lista de cenas é a alternativa em texto. Os valores técnicos vêm da gravação do
 * CI que o Painel reproduz, e a tela do celular é ilustrativa (o CareFlow não tem app de paciente).
 */
export const careflowVideo = {
  /** VP9 primeiro (menor, toca em navegadores sem H.264, como o Chromium dos testes); MP4 H.264 para o resto. */
  sources: [
    { src: "/videos/careflow-fluxo.webm", type: "video/webm" },
    { src: "/videos/careflow-fluxo.mp4", type: "video/mp4" },
  ],
  download: "/videos/careflow-fluxo.mp4",
  poster: "/videos/careflow-fluxo-capa.webp",
  width: 1080,
  height: 1350,
  sizeLabel: "MP4, 3,4 MB",
  scenes: [
    {
      title: "Cadastro e consentimento",
      description:
        "A paciente escolhe para que autoriza o uso dos dados. O cofre cifra o cadastro por campo e os outros serviços recebem só um pseudônimo.",
    },
    {
      title: "Triagem com IA",
      description:
        "Ela conta o que sente. O texto é mascarado antes de ir ao modelo, passa pelos guardrails e um profissional confirma a prioridade.",
    },
    {
      title: "Agenda sem dupla reserva",
      description:
        "Dois pedidos para o mesmo horário: o banco garante que só um vence, e o trace mostra a reserva passando pelos serviços.",
    },
    {
      title: "Notificação com fallback",
      description: "O WhatsApp cai, o circuito abre e o SMS entrega a confirmação.",
    },
    {
      title: "Revogação do consentimento",
      description:
        "As consultas futuras são canceladas por evento, sem intervenção, e a cadeia da auditoria continua íntegra.",
    },
    {
      title: "Direitos do titular",
      description:
        "Ela pede a eliminação dos dados, seis serviços confirmam e o cofre passa a responder que o cadastro não existe mais.",
    },
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
    title: "Direitos do titular e Bundle HL7 FHIR",
    demonstrates: "Interoperabilidade e LGPD",
    status: "concluida",
    postSlug: "fase-8-direitos-do-titular",
  },
  {
    number: 9,
    title: "CareFlow no ar: hospedagem gratuita, deploy e backup",
    demonstrates: "DevOps e segurança em produção",
    status: "concluida",
    postSlug: "fase-9-careflow-no-ar",
  },
  {
    number: 10,
    title: "Testes de carga e deploy gradual",
    demonstrates: "Performance",
    status: "planejada",
  },
];
