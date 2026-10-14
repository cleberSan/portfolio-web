export const site = {
  name: "Cleber",
  role: "Engenheiro de Software Full-Stack Sênior",
  description:
    "Construo sistemas críticos, microsserviços distribuídos e frontends modernos, com foco em resiliência, segurança e observabilidade de ponta a ponta.",
  focusAreas: [
    "Sistemas críticos e de alta disponibilidade",
    "Microsserviços distribuídos em .NET",
    "Frontends modernos com React, Angular e Next.js",
    "Observabilidade com OpenTelemetry",
    "Segurança e privacidade por design",
  ],
  sectors: ["Pagamentos digitais", "Fundos de investimento", "Saúde", "Previdência", "Educação"],
  links: {
    github: "https://github.com/cleberSan",
    careflow: "https://github.com/cleberSan/careflow",
    source: "https://github.com/cleberSan/portfolio-web",
  },
} as const;

export type NavigationItem = { href: `/${string}`; label: string };

export const navigation: readonly NavigationItem[] = [
  { href: "/projetos", label: "Projetos" },
  { href: "/diario", label: "Diário" },
  { href: "/stack", label: "Stack" },
  { href: "/sobre", label: "Sobre" },
];

/** Rotas sem parâmetros, usadas pelo sitemap e pelos testes E2E. */
export const staticRoutes = [
  "/",
  "/projetos",
  "/projetos/careflow",
  "/diario",
  "/stack",
  "/sobre",
] as const;
