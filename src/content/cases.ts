import type { Locale } from "@/i18n/locales";
import { casesTextEn } from "./cases.en";
import { careflow, careflowPhases } from "./careflow";
import { lojinha } from "./lojinha";

export type CaseLink = {
  href: string;
  label: string;
  /** Idioma da página de destino, quando difere do idioma da página atual. */
  hrefLang?: string;
};

/**
 * Um problema real e o que foi feito nele, no formato problema, abordagem e resultado.
 * Os cases de empresa vêm só do que o Cleber publicou no LinkedIn: nenhum número inventado.
 * Os autorais usam os números que os próprios projetos medem.
 */
export type Case = {
  id: string;
  /** Área do problema, como "Pagamentos". */
  tag: string;
  /** Onde aconteceu: a empresa ou o projeto autoral. */
  context: string;
  title: string;
  problem: string;
  approach: string;
  result: string;
  stack: readonly string[];
  /** Links internos (`/...`) ou externos (`https://...`). */
  links?: readonly CaseLink[];
};

const careflowPhasesDone = careflowPhases.filter((phase) => phase.status === "concluida").length;

const allCases = [
  {
    id: "pagamentos-resilientes",
    tag: "Pagamentos",
    context: "Exactaworks · Familhão",
    title: "Pagamentos que não cancelam às cegas",
    problem:
      "Pix, cartão, estornos e renovação de assinaturas dependem de provedores externos que às vezes respondem de forma ambígua ou entregam o mesmo evento duas vezes. Cancelar no primeiro sinal de erro pode desfazer um pagamento que deu certo.",
    approach:
      "Microsserviços .NET com filas e tópicos no Service Bus e RabbitMQ/AMQP na AWS, com idempotência, tratamento de duplicidade, retry e reconciliação de estados. Resposta ambígua do provedor é tratada como potencial sucesso e reconciliada, não cancelada.",
    result:
      "Jornadas de Pix, cartão, estorno e assinatura recorrente que tratam duplicidade e reconciliam o estado com o provedor, em vez de disparar cancelamentos cegos.",
    stack: [".NET", "Azure Service Bus", "RabbitMQ", "AWS", "React"],
  },
  {
    id: "scripts-mongodb",
    tag: "Dados",
    context: "Exactaworks",
    title: "Scripts de dados com caminho de volta",
    problem:
      "Ajustes de dados em homologação mexem direto no MongoDB. Um script sem caminho de volta deixa o ambiente num estado que ninguém consegue explicar nem desfazer.",
    approach:
      "Scripts operacionais com o rollback desenhado antes da execução e validação pareada de cada escrita: toda alteração tem a sua conferência.",
    result: "Operações de dados reversíveis e auditáveis em homologação.",
    stack: ["MongoDB", "Rollback", "Auditoria"],
  },
  {
    id: "fundos-cotas",
    tag: "Fundos de investimento",
    context: "BTG Pactual",
    title: "Cálculo de cotas e precificação de ativos",
    problem:
      "Cálculo de cota (NAV), precificação de ativos e processos regulatórios e contábeis não aceitam erro silencioso nem regressão entre versões.",
    approach:
      "Backend .NET e frontend Vue.js e React integrados por APIs REST, mensageria com RabbitMQ, cache com Redis e testes de unidade e de integração com xUnit, em Docker e Kubernetes com Rancher.",
    result:
      "Entregas que passam pelo quality gate do SonarQube no Azure DevOps e são acompanhadas em produção no Datadog.",
    stack: [".NET", "Vue.js", "React", "RabbitMQ", "Redis", "Kubernetes"],
  },
  {
    id: "estacionamento-3ds",
    tag: "Pagamentos",
    context: "Estapar",
    title: "Compra de tickets com 3DS, de ponta a ponta",
    problem:
      "Parquímetros, cartões e tickets de estacionamento precisam de pagamento com cartão e autenticação forte, em sistemas que convivem do .NET Framework 4 ao .NET 8.",
    approach:
      "Integração com Adyen e 3DS e cartões com Firebase pay card, Redis e Blob Storage, Docker e Kubernetes no Azure, com Angular e React no frontend.",
    result:
      "Compra de cartões e tickets de ponta a ponta nas aplicações de estacionamento, monitorada no Datadog.",
    stack: [".NET 8", "Adyen", "3DS", "Azure", "Kubernetes", "Angular"],
  },
  {
    id: "careflow",
    tag: "Saúde · projeto autoral",
    context: careflow.name,
    title: "Agenda e triagem com LGPD desde o desenho",
    problem:
      "Clínicas que compartilham agenda, cadastro e IA lidam com dado de saúde, que é dado sensível na LGPD: precisa de base legal, trilha de acesso e direito de eliminação.",
    approach: `${careflow.services.length} serviços .NET, cada um com o próprio banco, trocando eventos pelo RabbitMQ com Outbox e Inbox. Row-Level Security por clínica, cifra por campo, auditoria em cadeia HMAC e IA só sobre dados pseudonimizados.`,
    result: `${careflowPhasesDone} fases entregues em público, com ADRs e CI, e ${careflow.triageEval.withinOneLevel} de acerto da triagem com IA dentro de uma faixa de tolerância. O Painel reproduz uma execução real do CI.`,
    stack: [".NET 10", "RabbitMQ", "PostgreSQL", "OpenTelemetry", "IA"],
    links: [
      { href: "/projetos/careflow", label: "Ver arquitetura e roadmap" },
      { href: "/projetos/careflow/painel", label: "Abrir o Painel do CareFlow" },
    ],
  },
  {
    id: "lojinha-da-lua",
    tag: "Varejo · projeto autoral",
    context: lojinha.name,
    title: "Catálogo com pedido pelo WhatsApp, sem custo fixo",
    problem: lojinha.problem,
    approach:
      "Site estático em Astro, com React só nas telas de pedido, publicado num Worker da Cloudflare. Sem backend e sem guardar dado pessoal, com CSP por hash e a suíte E2E conferindo a produção todo dia.",
    result:
      "R$ 0 por mês de hospedagem com uso comercial permitido, 0 KB de JavaScript nas páginas sem pedido e 8 decisões registradas em ADR.",
    stack: ["Astro", "React", "Cloudflare", "Playwright"],
    links: [
      { href: "/projetos/lojinha-da-lua", label: "Ver o estudo de caso da Lojinha" },
      { href: lojinha.site, label: "Abrir o site da Lojinha" },
    ],
  },
] as const satisfies readonly Case[];

export const cases: readonly Case[] = allCases;

export type CaseId = (typeof allCases)[number]["id"];

export type CaseText = Pick<Case, "tag" | "title" | "problem" | "approach" | "result" | "stack"> & {
  /** Rótulos e idioma de destino dos links, na mesma ordem dos links do case. */
  links?: readonly Omit<CaseLink, "href">[];
};

/** Os cases em português ou com os textos de `cases.en.ts`; contexto e destinos dos links não mudam. */
export function getCases(locale: Locale): readonly Case[] {
  if (locale === "pt-BR") {
    return cases;
  }

  return cases.map((item): Case => {
    const { links, ...text } = casesTextEn[item.id as CaseId];
    return {
      ...item,
      ...text,
      links: item.links?.map((link, index) => ({ ...link, ...links?.[index] })),
    };
  });
}
