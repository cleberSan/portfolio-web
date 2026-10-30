import type { Locale } from "@/i18n/locales";

type Heading = { id: string; title: string };

type InlineLink = { href: `/${string}`; label: string; hrefLang?: string };

/** Textos do Sobre em cada idioma. Os dados (perfil, princípios) vêm de `src/content`. */
export type AboutText = {
  title: string;
  description: string;
  path: `/${string}`;
  whoAmI: Heading & {
    base: string;
    education: string;
    educationValue: string;
    languages: string;
    and: string;
  };
  experience: Heading;
  howIWork: Heading;
  educationAndCertifications: Heading;
  /** "O [CareFlow] é construído em público… no [diário de bordo]." em pedaços, para os links. */
  inTheOpen: Heading & {
    before: string;
    careflow: InlineLink;
    middle: string;
    buildLog: InlineLink;
    after: string;
  };
  contact: Heading & { lead: string };
};

const inPortuguese = "pt-BR";

export const aboutText: Record<Locale, AboutText> = {
  "pt-BR": {
    title: "Sobre",
    description:
      "Trajetória, formação, competências e contato de Cleber Costa Santos, engenheiro de software full-stack sênior em sistemas críticos de pagamentos, fundos de investimento, saúde, previdência e educação.",
    path: "/sobre",
    whoAmI: {
      id: "quem-sou",
      title: "Quem sou",
      base: "Base",
      education: "Formação",
      educationValue: "Análise e Desenvolvimento de Sistemas",
      languages: "Idiomas",
      and: "e",
    },
    experience: { id: "experiencia", title: "Experiência" },
    howIWork: { id: "como-trabalho", title: "Como eu trabalho" },
    educationAndCertifications: { id: "formacao", title: "Formação e certificações" },
    inTheOpen: {
      id: "vitrine",
      title: "Trabalho à vista",
      before: "O ",
      careflow: { href: "/projetos/careflow", label: "CareFlow" },
      middle:
        " é construído em público, fase a fase, para mostrar o processo e não só o resultado. Cada decisão fica registrada em ADRs e cada fase vira um post no ",
      buildLog: { href: "/diario", label: "diário de bordo" },
      after: ".",
    },
    contact: {
      id: "contato",
      title: "Contato",
      lead: "Para conversar sobre engenharia, arquitetura ou algum dos projetos daqui, o caminho mais rápido é o WhatsApp. O código de tudo o que aparece aqui está no GitHub.",
    },
  },
  en: {
    title: "About",
    description:
      "Career, education, skills and contact of Cleber Costa Santos, a senior full-stack software engineer working on critical systems for payments, investment funds, healthcare, pension plans and education.",
    path: "/en/about",
    whoAmI: {
      id: "who-i-am",
      title: "Who I am",
      base: "Based in",
      education: "Education",
      educationValue: "Systems Analysis and Development",
      languages: "Languages",
      and: "and",
    },
    experience: { id: "experience", title: "Experience" },
    howIWork: { id: "how-i-work", title: "How I work" },
    educationAndCertifications: { id: "education", title: "Education and certifications" },
    inTheOpen: {
      id: "in-the-open",
      title: "Work in the open",
      before: "",
      careflow: { href: "/projetos/careflow", label: "CareFlow", hrefLang: inPortuguese },
      middle:
        " is built in public, phase by phase, to show the process and not just the result. Every decision is recorded in ADRs, and every phase becomes a post in the ",
      buildLog: { href: "/diario", label: "build log", hrefLang: inPortuguese },
      after: ". Both are written in Portuguese.",
    },
    contact: {
      id: "contact",
      title: "Contact",
      lead: "To talk about engineering, architecture or any of the projects here, WhatsApp is the fastest way. The code for everything shown here is on GitHub.",
    },
  },
};
