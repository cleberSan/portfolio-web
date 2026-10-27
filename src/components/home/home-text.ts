import type { Locale } from "@/i18n/locales";

type Section = { id: string; eyebrow: string; title: string };

type SectionLink = { href: `/${string}`; label: string; hrefLang?: string };

/** Textos da home em cada idioma. Os dados (perfil, cases, atuação) vêm de `src/content`. */
export type HomeText = {
  eyebrow: (location: string) => string;
  statement: string;
  topologyCaption: string;
  intro: (years: number, sectors: string) => string;
  cta: { cases: string; how: string; whatsapp: string };
  indicators: {
    years: (years: number) => string;
    yearsLabel: string;
    sectorsLabel: string;
    companiesLabel: string;
    phasesLabel: string;
    /** Só a versão em português leva o indicador de fases à página do CareFlow. */
    phasesHref?: `/${string}`;
  };
  employers: string;
  cases: Section & { lead: string };
  expertise: Section & { lead: string };
  about: Section & {
    more: SectionLink;
    base: string;
    languages: string;
    languageLine: (name: string, level: string) => string;
    ai: string;
    principles: string;
  };
  skills: Section & {
    more: SectionLink;
    lead: (total: number, groups: number) => string;
    items: (count: number) => string;
  };
  experience: Section & { lead: (period: string, companies: number) => string };
  buildLog: Section & { more: SectionLink; lead: string };
  contact: Section & { lead: string };
};

const inPortuguese = "pt-BR";

export const homeText: Record<Locale, HomeText> = {
  "pt-BR": {
    eyebrow: (location) => `Portfólio · ${location}`,
    statement: "Engenheiro de software sênior, especialista em sistemas críticos.",
    topologyCaption:
      "CareFlow, meu projeto vitrine · cada serviço com o próprio banco, eventos com Outbox e Inbox",
    intro: (years, sectors) =>
      `Há ${years} anos construo sistemas críticos e escaláveis em ${sectors}: backend resiliente em .NET, mensageria, frontends modernos e observabilidade de ponta a ponta.`,
    cta: { cases: "Ver os cases", how: "Como eu trabalho", whatsapp: "Falar no WhatsApp" },
    indicators: {
      years: (years) => `${years} anos`,
      yearsLabel: "construindo software que roda em produção",
      sectorsLabel: "setores atendidos, de pagamentos a saúde",
      companiesLabel: "empresas na trajetória",
      phasesLabel: "fases do CareFlow entregues em público",
      phasesHref: "/projetos/careflow",
    },
    employers: "Onde já construí software",
    cases: {
      id: "cases",
      eyebrow: "Cases",
      title: "Problemas reais que resolvi",
      lead: "Cada case diz o problema, como eu ataquei e o que ficou de pé. Os de empresa contam só o que é público; os autorais têm código, decisões e números abertos.",
    },
    expertise: {
      id: "atuacao",
      eyebrow: "Atuação",
      title: "Com o que eu trabalho",
      lead: "As frentes em que construo software, todas com sistemas que já coloquei em produção.",
    },
    about: {
      id: "sobre",
      eyebrow: "Sobre",
      title: "Quem sou",
      more: { href: "/sobre", label: "Ler mais sobre mim" },
      base: "Base",
      languages: "Idiomas",
      languageLine: (name, level) => `${name} ${level.toLowerCase()}`,
      ai: "IA no ciclo de engenharia",
      principles: "Princípios",
    },
    skills: {
      id: "habilidades",
      eyebrow: "Habilidades",
      title: "Stack e competências",
      more: { href: "/stack", label: "Ver a stack com evidências no código" },
      lead: (total, groups) => `${total} tecnologias e práticas em ${groups} grupos.`,
      items: (count) => `${count} itens`,
    },
    experience: {
      id: "trajetoria",
      eyebrow: "Trajetória",
      title: "Experiência e formação",
      lead: (period, companies) => `${period}, em ${companies} empresas.`,
    },
    buildLog: {
      id: "diario",
      eyebrow: "Diário",
      title: "Diário de bordo",
      more: { href: "/diario", label: "Todos os posts" },
      lead: "Cada fase do CareFlow vira um post com o que foi decidido e por quê.",
    },
    contact: {
      id: "contato",
      eyebrow: "Contato",
      title: "Vamos conversar",
      lead: "Para conversar sobre engenharia, arquitetura ou algum dos projetos daqui, o caminho mais rápido é o WhatsApp. O código de tudo está no GitHub.",
    },
  },
  en: {
    eyebrow: (location) => `Portfolio · ${location}`,
    statement: "Senior software engineer, specialized in critical systems.",
    topologyCaption:
      "CareFlow, my flagship project · each service with its own database, events with Outbox and Inbox",
    intro: (years, sectors) =>
      `For ${years} years I've been building critical, scalable systems in ${sectors}: resilient .NET backends, messaging, modern frontends and end-to-end observability.`,
    cta: { cases: "See the cases", how: "How I work", whatsapp: "Message me on WhatsApp" },
    indicators: {
      years: (years) => `${years} years`,
      yearsLabel: "building software that runs in production",
      sectorsLabel: "industries served, from payments to healthcare",
      companiesLabel: "companies in my career",
      phasesLabel: "CareFlow phases delivered in public",
    },
    employers: "Where I've built software",
    cases: {
      id: "cases",
      eyebrow: "Cases",
      title: "Real problems I've solved",
      lead: "Each case states the problem, how I tackled it and what was left standing. Company cases tell only what is public; personal projects have open code, decisions and numbers.",
    },
    expertise: {
      id: "expertise",
      eyebrow: "Expertise",
      title: "What I work with",
      lead: "The areas where I build software, all backed by systems I've put into production.",
    },
    about: {
      id: "about",
      eyebrow: "About",
      title: "Who I am",
      more: { href: "/en/about", label: "Read more about me" },
      base: "Based in",
      languages: "Languages",
      languageLine: (name, level) => `${name} (${level.toLowerCase()})`,
      ai: "AI in the engineering cycle",
      principles: "Principles",
    },
    skills: {
      id: "skills",
      eyebrow: "Skills",
      title: "Stack and skills",
      more: {
        href: "/stack",
        label: "See the stack with code evidence (in Portuguese)",
        hrefLang: inPortuguese,
      },
      lead: (total, groups) => `${total} technologies and practices in ${groups} groups.`,
      items: (count) => `${count} items`,
    },
    experience: {
      id: "experience",
      eyebrow: "Career",
      title: "Experience and education",
      lead: (period, companies) => `${period}, across ${companies} companies.`,
    },
    buildLog: {
      id: "build-log",
      eyebrow: "Build log",
      title: "Build log",
      more: { href: "/diario", label: "All posts (in Portuguese)", hrefLang: inPortuguese },
      lead: "Each CareFlow phase becomes a post on what was decided and why. The posts are written in Portuguese.",
    },
    contact: {
      id: "contact",
      eyebrow: "Contact",
      title: "Let's talk",
      lead: "To talk about engineering, architecture or any of the projects here, WhatsApp is the fastest way. The code for all of it is on GitHub.",
    },
  },
};
