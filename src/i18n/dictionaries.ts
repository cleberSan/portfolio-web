import type { Locale } from "./locales";

/**
 * Textos de interface dos componentes compartilhados entre as versões em português e em inglês.
 * O conteúdo (perfil, cases, atuação) fica em `src/content`; aqui ficam rótulos, títulos e avisos.
 */
export type Dictionary = {
  skipLink: string;
  /** Sufixo lido por leitores de tela em links que abrem outra aba. */
  newTab: string;
  header: { navLabel: string; languageLabel: string };
  /** Nome de cada idioma escrito nele mesmo, como no seletor. */
  languageNames: Record<Locale, string>;
  footer: { source: string };
  contact: { label: string; phone: string };
  caseCard: { problem: string; approach: string; result: string };
  experience: { now: string; details: string; at: (company: string) => string };
  education: { education: string; certifications: string; languages: string };
  pipeline: { title: string; steps: string; gates: string; required: string; note: string };
  topology: { title: string; description: (count: number, services: string) => string };
};

const ptBR: Dictionary = {
  skipLink: "Pular para o conteúdo",
  newTab: ", abre em nova aba",
  header: { navLabel: "Principal", languageLabel: "Idioma" },
  languageNames: { "pt-BR": "Português", en: "English" },
  footer: { source: "Código deste site" },
  contact: { label: "Contato", phone: "Telefone" },
  caseCard: { problem: "Problema", approach: "Abordagem", result: "Resultado" },
  experience: {
    now: "agora",
    details: "Destaques e stack",
    at: (company) => `na ${company}`,
  },
  education: { education: "Formação", certifications: "Certificações", languages: "Idiomas" },
  pipeline: {
    title: "Pipeline deste site",
    steps: "Etapas até produção",
    gates: "Portões do CI",
    required: "obrigatório",
    note: "A branch principal é protegida: só entra o que passa em todos os portões.",
  },
  topology: {
    title: "Topologia do CareFlow",
    description: (count, services) =>
      `${count} serviços .NET trocam eventos pelo RabbitMQ com Outbox e Inbox: ${services}.`,
  },
};

const en: Dictionary = {
  skipLink: "Skip to content",
  newTab: ", opens in a new tab",
  header: { navLabel: "Main", languageLabel: "Language" },
  languageNames: { "pt-BR": "Português", en: "English" },
  footer: { source: "Source code of this site" },
  contact: { label: "Contact", phone: "Phone" },
  caseCard: { problem: "Problem", approach: "Approach", result: "Result" },
  experience: {
    now: "now",
    details: "Highlights and stack",
    at: (company) => `at ${company}`,
  },
  education: { education: "Education", certifications: "Certifications", languages: "Languages" },
  pipeline: {
    title: "This site's pipeline",
    steps: "Steps to production",
    gates: "CI gates",
    required: "required",
    note: "The main branch is protected: only what passes every gate gets in.",
  },
  topology: {
    title: "CareFlow topology",
    description: (count, services) =>
      `${count} .NET services exchange events over RabbitMQ with Outbox and Inbox: ${services}.`,
  },
};

export const dictionaries: Record<Locale, Dictionary> = { "pt-BR": ptBR, en };
