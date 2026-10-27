/** Celular do Cleber, publicado com autorização dele (2026-10-27). E-mail e endereço ficam fora. */
const phoneDigits = "5511970502716";

const whatsappGreeting = "Olá, Cleber! Vi seu portfólio e gostaria de conversar.";

export const site = {
  name: "Cleber Costa Santos",
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
  sectors: [
    "Pagamentos digitais",
    "Fundos de investimento",
    "Gestão de estacionamentos",
    "Saúde",
    "Previdência",
    "Educação",
  ],
  links: {
    github: "https://github.com/cleberSan",
    linkedin: "https://www.linkedin.com/in/cleber-costa-santos/",
    careflow: "https://github.com/cleberSan/careflow",
    source: "https://github.com/cleberSan/portfolio-web",
  },
  contact: {
    phone: "+55 11 97050-2716",
    phoneHref: `tel:+${phoneDigits}`,
    whatsapp: `https://wa.me/${phoneDigits}?text=${encodeURIComponent(whatsappGreeting)}`,
    timezone: "GMT-3",
  },
} as const;

export type NavigationItem = { href: `/${string}`; label: string };

/** Seções da home (âncoras) intercaladas com as páginas que aprofundam cada assunto. */
export const navigation: readonly NavigationItem[] = [
  { href: "/#cases", label: "Cases" },
  { href: "/#servicos", label: "Serviços" },
  { href: "/#trajetoria", label: "Trajetória" },
  { href: "/projetos", label: "Projetos" },
  { href: "/diario", label: "Diário" },
  { href: "/sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

/** Rotas sem parâmetros, usadas pelo sitemap e pelos testes E2E. */
export const staticRoutes = [
  "/",
  "/projetos",
  "/projetos/careflow",
  "/projetos/careflow/painel",
  "/projetos/lojinha-da-lua",
  "/diario",
  "/stack",
  "/sobre",
  "/curriculo",
] as const;
