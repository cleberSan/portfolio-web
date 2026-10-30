import type { Locale } from "@/i18n/locales";

/** Celular do Cleber, publicado com autorização dele (2026-10-27). E-mail e endereço ficam fora. */
const phoneDigits = "5511970502716";

const whatsappGreeting: Record<Locale, string> = {
  "pt-BR": "Olá, Cleber! Vi seu portfólio e gostaria de conversar.",
  en: "Hi, Cleber! I saw your portfolio and would like to talk.",
};

/** Conversa no WhatsApp com a saudação no idioma da página. */
export function whatsappUrl(locale: Locale): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(whatsappGreeting[locale])}`;
}

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
    whatsapp: whatsappUrl("pt-BR"),
    timezone: "GMT-3",
  },
} as const;

export type SiteText = {
  role: string;
  description: string;
  focusAreas: readonly string[];
  sectors: readonly string[];
};

const siteTextEn: SiteText = {
  role: "Senior Full-Stack Software Engineer",
  description:
    "I build critical systems, distributed microservices and modern frontends, focused on resilience, security and end-to-end observability.",
  focusAreas: [
    "Critical, high-availability systems",
    "Distributed microservices in .NET",
    "Modern frontends with React, Angular and Next.js",
    "Observability with OpenTelemetry",
    "Security and privacy by design",
  ],
  sectors: [
    "Digital payments",
    "Investment funds",
    "Parking management",
    "Healthcare",
    "Pension plans",
    "Education",
  ],
};

/** Papel, descrição, focos e setores no idioma da página. */
export function getSiteText(locale: Locale): SiteText {
  return locale === "en" ? siteTextEn : site;
}

export type NavigationItem = { href: `/${string}`; label: string };

/** Seções da home (âncoras) intercaladas com as páginas que aprofundam cada assunto. */
export const navigation: readonly NavigationItem[] = [
  { href: "/#cases", label: "Cases" },
  { href: "/#atuacao", label: "Atuação" },
  { href: "/#trajetoria", label: "Trajetória" },
  { href: "/projetos", label: "Projetos" },
  { href: "/diario", label: "Diário" },
  { href: "/sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

/** Menu da versão em inglês: só aponta para páginas que existem em inglês. */
export const navigationEn: readonly NavigationItem[] = [
  { href: "/en#cases", label: "Cases" },
  { href: "/en#expertise", label: "Expertise" },
  { href: "/en#experience", label: "Experience" },
  { href: "/en/about", label: "About" },
  { href: "/en#contact", label: "Contact" },
];

export function getNavigation(locale: Locale): readonly NavigationItem[] {
  return locale === "en" ? navigationEn : navigation;
}

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
  "/en",
  "/en/about",
] as const;
