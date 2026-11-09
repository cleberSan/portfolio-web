import { careflow, careflowPhases } from "@/content/careflow";
import { lojinha } from "@/content/lojinha";
import type { Fonte, RespostaGravada } from "./modelo";

/**
 * Respostas do Sinapse, o assistente da página /ecossistema (spec 0001, ADR-0009). Foram escritas
 * antes e entram por PR como qualquer conteúdo; nenhuma é composta na hora. Números vêm do conteúdo
 * tipado, e cada resposta traz ao menos uma fonte: rota do site ou repositório público do Cleber.
 */

export const nomeDoAssistente = "Sinapse";

export const saudacao =
  "Oi, eu sou o Sinapse. Pergunte sobre o CareFlow, os agentes ou qualquer projeto daqui, e eu mostro no mapa a parte de que estou falando.";

export const semResposta =
  "Não tenho uma resposta gravada para isso. Tente uma das perguntas sugeridas ou escolha uma região no mapa.";

export const avisoDePrivacidade =
  "Respostas escritas antes, revisadas e com fonte. O que você digita fica neste navegador: não é enviado nem guardado.";

const github = "https://github.com/cleberSan";
const adrCareflow = (arquivo: string) => `${github}/careflow/blob/main/docs/adr/${arquivo}`;
const adrSite = (arquivo: string) => `${github}/portfolio-web/blob/main/docs/adr/${arquivo}`;

export type ContextoDasRespostas = {
  /** Gravação do CI que as reproduções usam: data por extenso, commit curto e link. */
  gravacao: { data: string; commit: string; href?: string };
};

export function buildRespostas({ gravacao }: ContextoDasRespostas): readonly RespostaGravada[] {
  const concluidas = careflowPhases.filter((phase) => phase.status === "concluida").length;
  const fonteDaGravacao: Fonte = gravacao.href
    ? { rotulo: `Commit ${gravacao.commit}`, href: gravacao.href }
    : { rotulo: "Painel", href: "/projetos/careflow/painel" };

  return [
    {
      id: "careflow",
      pergunta: "O que é o CareFlow?",
      chaves: { careflow: 2, vitrine: 2, agenda: 1, clinica: 1, consulta: 1 },
      texto: `O CareFlow é o projeto vitrine: agendamento multi-clínica com triagem assistida por IA e privacidade por design, em .NET 10, PostgreSQL, RabbitMQ e OpenTelemetry. Usa só dados sintéticos. ${concluidas} de ${careflowPhases.length} fases estão concluídas.`,
      regiao: "careflow",
      reproducao: "reserva",
      fontes: [
        { rotulo: "Estudo de caso", href: "/projetos/careflow" },
        { rotulo: "Código", href: careflow.repository },
      ],
    },
    {
      id: "privacidade",
      pergunta: "Como o CareFlow protege os dados?",
      chaves: {
        privac: 3,
        lgpd: 3,
        protege: 2,
        dado: 2,
        consentimento: 3,
        revog: 3,
        cofre: 2,
        pseudonim: 2,
      },
      texto:
        "Os dados pessoais ficam no cofre do paciente, cifrados por campo com chave por paciente; os outros serviços recebem só um pseudônimo. Quando a paciente revoga um consentimento, o evento passa pelo RabbitMQ e chega à agenda, às notificações e à triagem. A reprodução no mapa mostra essa revogação.",
      regiao: "careflow",
      reproducao: "revogacao",
      fontes: [
        {
          rotulo: "ADR-0004, cofre",
          href: adrCareflow("0004-patient-vault-cifragem-por-campo.md"),
        },
        {
          rotulo: "ADR-0008, consentimento",
          href: adrCareflow("0008-consentimento-e-propagacao-para-a-agenda.md"),
        },
      ],
    },
    {
      id: "arquitetura",
      pergunta: "Qual é a arquitetura do CareFlow?",
      chaves: {
        arquitetura: 3,
        microsservic: 2,
        servicos: 2,
        ddd: 3,
        vertical: 3,
        fatias: 3,
        mensageria: 3,
        outbox: 3,
        inbox: 3,
        eventos: 2,
        rabbitmq: 2,
      },
      texto:
        "Cada serviço é organizado em fatias verticais com DDD. Os serviços conversam por eventos no RabbitMQ, com outbox transacional na saída e inbox idempotente na entrada, e o trace do OpenTelemetry atravessa o broker de ponta a ponta.",
      regiao: "careflow",
      reproducao: "reserva",
      fontes: [
        { rotulo: "ADR-0001", href: adrCareflow("0001-arquitetura-base.md") },
        {
          rotulo: "ADR-0006, mensageria",
          href: adrCareflow("0006-mensageria-outbox-inbox-rabbitmq.md"),
        },
      ],
    },
    {
      id: "resiliencia",
      pergunta: "E se o WhatsApp cair?",
      chaves: {
        whatsapp: 3,
        cair: 2,
        cai: 2,
        caiu: 2,
        falha: 2,
        resilien: 3,
        fallback: 3,
        sms: 3,
        circuito: 2,
      },
      texto:
        "A notificação tenta o WhatsApp; se ele falha, a mensagem segue por SMS e o aviso não se perde. A falha é provocada de propósito nos testes, e a reprodução mostra cada tentativa com a duração gravada.",
      regiao: "careflow",
      reproducao: "fallback",
      fontes: [
        {
          rotulo: "ADR-0009, notificações",
          href: adrCareflow("0009-notificacoes-com-fallback-e-falhas-injetaveis.md"),
        },
        { rotulo: "Painel", href: "/projetos/careflow/painel" },
      ],
    },
    {
      id: "triagem",
      pergunta: "Como funciona a triagem com IA?",
      chaves: { triagem: 3, ia: 2, inteligencia: 2, modelo: 2, haiku: 2, llm: 2 },
      texto:
        "A triagem manda ao modelo só texto mascarado e a faixa etária, sem nome, CPF ou contato. Alarmes por regra vêm antes e o modelo nunca rebaixa a prioridade; o profissional sempre confirma ou corrige. É uma demonstração com dados sintéticos e respostas gravadas, não uma ferramenta clínica.",
      regiao: "careflow",
      reproducao: "triagem",
      fontes: [{ rotulo: "ADR-0011", href: adrCareflow("0011-triagem-com-ia-pseudonimizada.md") }],
    },
    {
      id: "auditoria",
      pergunta: "Como funciona a auditoria?",
      chaves: { auditoria: 3, audit: 3, hmac: 3, trilha: 2, cadeia: 2, acesso: 1 },
      texto:
        "Cada acesso a dado pessoal vira um evento de auditoria. A trilha é encadeada com HMAC, então mudar ou apagar uma entrada quebra a verificação da cadeia. Na reserva do mapa, os sinais que chegam à Auditoria são esses eventos.",
      regiao: "careflow",
      reproducao: "reserva",
      fontes: [{ rotulo: "ADR-0007", href: adrCareflow("0007-auditoria-com-cadeia-hmac.md") }],
    },
    {
      id: "titular",
      pergunta: "E os direitos do titular na LGPD?",
      chaves: { titular: 3, direitos: 3, portabilidade: 3, eliminac: 3, fhir: 3, apagar: 2 },
      texto:
        "A paciente pode pedir acesso aos dados, levar os dados num pacote no padrão HL7 FHIR e pedir a eliminação, feita por crypto-shredding: a chave dela é destruída e a auditoria continua íntegra.",
      regiao: "careflow",
      reproducao: null,
      fontes: [
        { rotulo: "ADR-0012", href: adrCareflow("0012-direitos-do-titular-e-fhir.md") },
        { rotulo: "Painel", href: "/projetos/careflow/painel" },
      ],
    },
    {
      id: "agentes",
      pergunta: "Como os agentes trabalham?",
      chaves: { agente: 3, agentes: 3, orquestr: 3, subagente: 3, automac: 2, autonom: 2, fase: 1 },
      texto:
        "Cada fase passa por agentes com um papel só: pesquisa de fatos, implementação, QA destrutivo, segurança, revisão Staff, redação e curadoria da base. Custo, licença, escopo e merge são sempre do Cleber: o fluxo para no portão e espera o OK dele.",
      regiao: "agentes",
      reproducao: "agentes",
      fontes: [
        {
          rotulo: "Fluxo de uma fase",
          href: `${github}/claude-works/blob/main/agents/fluxo-fase.md`,
        },
        { rotulo: "Agentes", href: `${github}/claude-works/blob/main/agents/README.md` },
      ],
    },
    {
      id: "spec",
      pergunta: "Como uma mudança começa?",
      chaves: { spec: 3, especifica: 3, sdd: 3, criterio: 2, aceite: 2, mudanca: 2, comeca: 1 },
      texto:
        "Pedido novo passa por spec, plano e tarefas antes do código. Nas mudanças maiores o Cleber aprova a spec primeiro, e cada critério de aceite tem um teste marcado com o número dele. Esta página nasceu assim.",
      regiao: "agentes",
      reproducao: "agentes",
      fontes: [
        { rotulo: "ADR-0008", href: adrSite("0008-especificar-antes-de-implementar.md") },
        {
          rotulo: "Spec desta página",
          href: `${github}/portfolio-web/blob/main/docs/specs/0001-ecossistema-em-3d/spec.md`,
        },
      ],
    },
    {
      id: "claude-works",
      pergunta: "O que é a claude-works?",
      chaves: { "claude-works": 3, works: 3, base: 2, memoria: 3, conhecimento: 3 },
      texto:
        "É a memória do ecossistema: uma base pública com convenções, decisões, stacks, modelos e fluxos. Os agentes leem a base antes de trabalhar, o que poupa releitura de histórico e mantém as mesmas regras em todos os repositórios.",
      regiao: "claude-works",
      reproducao: "agentes",
      fontes: [{ rotulo: "Repositório", href: `${github}/claude-works` }],
    },
    {
      id: "lojinha",
      pergunta: "O que é a Lojinha Da Lua?",
      chaves: {
        lojinha: 3,
        loja: 3,
        lua: 2,
        catalogo: 2,
        astro: 2,
        cloudflare: 2,
        pedido: 2,
        whatsapp: 2,
      },
      texto:
        "É o site de uma loja real de produtos personalizados: o cliente monta o pedido no navegador e envia numa mensagem só pelo WhatsApp. Feito em Astro com uma ilha React, CSP por hash e hospedagem gratuita na Cloudflare.",
      regiao: "lojinha",
      reproducao: null,
      fontes: [
        { rotulo: "Estudo de caso", href: "/projetos/lojinha-da-lua" },
        { rotulo: "Código", href: lojinha.repository },
      ],
    },
    {
      id: "site",
      pergunta: "Como este site foi feito?",
      chaves: {
        site: 3,
        portfolio: 3,
        next: 2,
        nextjs: 2,
        pagina: 2,
        feito: 2,
        csp: 2,
        acessib: 2,
      },
      texto:
        "Em Next.js 16, com CSP sem nonce e tudo servido pela própria origem, testes de unidade com cobertura mínima de 80%, testes de ponta a ponta com axe nos temas claro e escuro e CodeQL. O 3D desta página só é baixado aqui, e quem pede menos movimento vê tudo parado e em texto.",
      regiao: "portfolio",
      reproducao: null,
      fontes: [
        { rotulo: "Código", href: `${github}/portfolio-web` },
        { rotulo: "ADR-0003, CSP", href: adrSite("0003-csp-sem-nonce.md") },
      ],
    },
    {
      id: "reais",
      pergunta: "Os sinais do mapa são reais?",
      chaves: {
        reais: 3,
        real: 3,
        vivo: 3,
        tempo: 1,
        gravad: 3,
        simulad: 3,
        sinais: 2,
        verdade: 2,
      },
      texto: `Os sinais do CareFlow reproduzem uma execução real, gravada pelo CI em ${gravacao.data} (commit ${gravacao.commit}), na ordem e na proporção de tempo originais, só que mais devagar. O fluxo dos agentes segue o roteiro documentado. O Painel do CareFlow tem o modo que conversa com a demonstração hospedada, quando ela está no ar.`,
      regiao: null,
      reproducao: null,
      fontes: [fonteDaGravacao, { rotulo: "Painel", href: "/projetos/careflow/painel" }],
    },
    {
      id: "custo",
      pergunta: "Quanto custa manter isso?",
      chaves: { custo: 3, custa: 3, gratis: 3, gratuito: 3, hospedagem: 2, preco: 2, pago: 2 },
      texto:
        "Nada. O site fica na Vercel, a loja na Cloudflare e o CI no GitHub, todos em planos gratuitos. Esta página não chama serviço pago, e as respostas do Sinapse foram escritas antes.",
      regiao: null,
      reproducao: null,
      fontes: [{ rotulo: "ADR-0005, hospedagem", href: adrSite("0005-hospedagem-na-vercel.md") }],
    },
    {
      id: "sinapse",
      pergunta: "Quem é você?",
      chaves: { sinapse: 3, assistente: 3, voce: 1, quem: 1 },
      texto:
        "Sou o Sinapse, o assistente desta página. Respondo com textos escritos antes e revisados, sempre com fonte, e mostro no mapa a parte de que estou falando. Não invento resposta: se não souber, digo.",
      regiao: null,
      reproducao: null,
      fontes: [
        {
          rotulo: "ADR-0009",
          href: adrSite("0009-ecossistema-3d-com-three-e-respostas-gravadas.md"),
        },
      ],
    },
    {
      id: "cleber",
      pergunta: "Quem é o Cleber?",
      chaves: { cleber: 3, autor: 2, dono: 2, engenheiro: 2, contato: 2 },
      texto:
        "Cleber Costa Santos é engenheiro de software full-stack sênior: .NET, mensageria com RabbitMQ e Azure Service Bus, React e Angular, AWS e Azure. Constrói estes projetos em público, com decisões registradas em ADR e testes em todo PR. O contato está na página Sobre.",
      regiao: null,
      reproducao: null,
      fontes: [
        { rotulo: "Sobre", href: "/sobre" },
        { rotulo: "GitHub", href: github },
      ],
    },
  ];
}

/** Perguntas que aparecem como sugestão, na ordem. */
export const sugestoes = ["careflow", "privacidade", "agentes", "reais", "lojinha"] as const;
