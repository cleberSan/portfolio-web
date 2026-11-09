import { careflow, careflowPhases } from "@/content/careflow";
import { qualityPipeline } from "@/content/engineering";
import { lojinha } from "@/content/lojinha";
import { agenteIds, type Regiao, type RegiaoId } from "./modelo";

const github = "https://github.com/cleberSan";

const fasesConcluidas = careflowPhases.filter((phase) => phase.status === "concluida").length;

/**
 * As cinco regiões do mapa. Números vêm do conteúdo tipado (fases, portões do CI, agentes) para
 * não desatualizarem quando o projeto andar.
 */
export const regioes: readonly Regiao[] = [
  {
    id: "careflow",
    nome: careflow.name,
    papel: "projeto vitrine",
    resumo: `${careflow.tagline} Dados 100% sintéticos.`,
    estado: `${fasesConcluidas} de ${careflowPhases.length} fases concluídas`,
    stack: [".NET 10", "PostgreSQL", "RabbitMQ", "OpenTelemetry"],
    links: [
      { rotulo: "Estudo de caso", href: "/projetos/careflow" },
      { rotulo: "Painel", href: "/projetos/careflow/painel" },
      { rotulo: "Código", href: careflow.repository },
    ],
  },
  {
    id: "agentes",
    nome: "Agentes",
    papel: "quem constrói",
    resumo:
      "Subagentes do Claude Code com um papel só cada: pesquisa de fatos, implementação, QA destrutivo, segurança, revisão Staff, redação e curadoria da base. O Cleber aprova a spec antes do código e faz o merge.",
    estado: `${agenteIds.length - 1} agentes e um orquestrador, com portão humano em toda fase`,
    stack: ["Claude Code", "subagentes", "Spec-Driven Development"],
    links: [
      {
        rotulo: "Fluxo de uma fase",
        href: `${github}/claude-works/blob/main/agents/fluxo-fase.md`,
      },
      { rotulo: "Agentes", href: `${github}/claude-works/blob/main/agents/README.md` },
    ],
  },
  {
    id: "portfolio",
    nome: "portfolio-web",
    papel: "este site",
    resumo:
      "Este site: quem o Cleber é, com o que e como trabalha, os estudos de caso, o diário de bordo e o Painel do CareFlow.",
    estado: `${qualityPipeline.gates.length} portões de qualidade no CI, cobertura mínima de 80%`,
    stack: ["Next.js 16", "React 19", "Tailwind 4", "Playwright com axe"],
    links: [
      { rotulo: "Diário de bordo", href: "/diario" },
      { rotulo: "Código", href: `${github}/portfolio-web` },
    ],
  },
  {
    id: "lojinha",
    nome: lojinha.name,
    papel: "loja real",
    resumo: lojinha.tagline,
    estado: "No ar na Cloudflare, em plano gratuito",
    stack: ["Astro", "React", "Cloudflare"],
    links: [
      { rotulo: "Estudo de caso", href: "/projetos/lojinha-da-lua" },
      { rotulo: "Código", href: lojinha.repository },
    ],
  },
  {
    id: "claude-works",
    nome: "claude-works",
    papel: "memória",
    resumo:
      "A memória do ecossistema: convenções, decisões, stacks, modelos e fluxos que os agentes leem antes de trabalhar. É pública e validada no CI.",
    estado: "Base pública, validada a cada PR",
    stack: ["Markdown", "Node sem dependências"],
    links: [{ rotulo: "Código", href: `${github}/claude-works` }],
  },
];

export function getRegiao(id: RegiaoId): Regiao {
  const regiao = regioes.find((item) => item.id === id);
  if (!regiao) {
    throw new Error(`Região desconhecida: ${id}`);
  }
  return regiao;
}
