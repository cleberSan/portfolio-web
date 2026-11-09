import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/config/site";
import { buscar } from "@/lib/assistente/buscar";
import { avisoDePrivacidade, buildRespostas, saudacao, semResposta, sugestoes } from "./assistente";
import { regiaoIds, type ReproducaoId } from "./modelo";

const gravacao = {
  data: "16 de outubro de 2026",
  commit: "abc12345",
  href: "https://github.com/cleberSan/careflow/commit/abc12345",
};
const respostas = buildRespostas({ gravacao });
const reproducaoIds: readonly ReproducaoId[] = [
  "reserva",
  "revogacao",
  "fallback",
  "triagem",
  "agentes",
];

describe("respostas gravadas do Sinapse", () => {
  it("tem ids únicos", () => {
    const ids = respostas.map((resposta) => resposta.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  // spec 0001 CA-12
  it("acha cada resposta pela própria pergunta", () => {
    for (const resposta of respostas) {
      expect(buscar(resposta.pergunta, respostas)?.id, resposta.pergunta).toBe(resposta.id);
    }
  });

  // spec 0001 CA-12
  it.each([
    ["vocês seguem a LGPD?", "privacidade"],
    ["o que acontece se eu revogar o consentimento", "privacidade"],
    ["usa microsserviços com DDD?", "arquitetura"],
    ["tem fallback para SMS?", "resiliencia"],
    ["inteligência artificial na triagem", "triagem"],
    ["posso pedir a eliminação dos meus dados?", "titular"],
    ["como funcionam os subagentes", "agentes"],
    ["vocês usam spec antes do código?", "spec"],
    ["o que é a claude-works", "claude-works"],
    ["a loja vende pelo WhatsApp?", "lojinha"],
    ["é tudo em tempo real?", "reais"],
    ["isso é de graça? é gratuito?", "custo"],
    ["quem é você", "sinapse"],
  ])("responde %j com %s", (pergunta, id) => {
    expect(buscar(pergunta, respostas)?.id).toBe(id);
  });

  // spec 0001 CA-13
  it("não responde ao que está fora do ecossistema", () => {
    expect(buscar("qual a previsão do tempo amanhã em Curitiba?", respostas)).toBeNull();
    expect(buscar("me receita um remédio para dor de cabeça", respostas)).toBeNull();
  });

  // spec 0001 CA-16
  it("traz ao menos uma fonte, sempre rota do site ou repositório público do Cleber", () => {
    const rotas = new Set<string>(staticRoutes);
    for (const resposta of respostas) {
      expect(resposta.fontes.length, resposta.id).toBeGreaterThan(0);
      for (const fonte of resposta.fontes) {
        expect(fonte.rotulo.trim(), resposta.id).not.toBe("");
        if (fonte.href.startsWith("/")) {
          expect(rotas.has(fonte.href), fonte.href).toBe(true);
        } else {
          expect(fonte.href).toMatch(/^https:\/\/github\.com\/cleberSan(\/|$)/);
        }
      }
    }
  });

  // spec 0001 CA-16
  it("não fala em vaga, não publica contato privado, não promete clínica nem Clean Architecture", () => {
    const textos = [
      saudacao,
      semResposta,
      avisoDePrivacidade,
      ...respostas.flatMap((resposta) => [
        resposta.pergunta,
        resposta.texto,
        ...resposta.fontes.map((f) => f.rotulo),
      ]),
    ].join("\n");

    expect(textos).not.toMatch(/\bvaga|oportunidade|busco|disponível|currículo/i);
    expect(textos).not.toMatch(/@|\bRua |e-mail/i);
    expect(textos).not.toMatch(/clean architecture/i);
    expect(textos).not.toMatch(/diagnóstic|prescrev|tratamento|cura\b/i);
    // spec 0001 CA-03: a página nunca chama a reprodução de ao vivo.
    expect(textos).not.toMatch(/ao vivo|tempo real/i);
  });

  it("aponta só para região e reprodução que existem", () => {
    for (const resposta of respostas) {
      if (resposta.regiao !== null) {
        expect(regiaoIds).toContain(resposta.regiao);
      }
      if (resposta.reproducao !== null) {
        expect(reproducaoIds).toContain(resposta.reproducao);
      }
    }
  });

  it("sugere perguntas que têm resposta", () => {
    const ids = new Set(respostas.map((resposta) => resposta.id));

    for (const id of sugestoes) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  // spec 0001 CA-03
  it("diz a data e o commit da gravação quando fala dos sinais", () => {
    const reais = respostas.find((resposta) => resposta.id === "reais");

    expect(reais?.texto).toContain("16 de outubro de 2026");
    expect(reais?.texto).toContain("abc12345");
    expect(reais?.fontes[0]).toEqual({ rotulo: "Commit abc12345", href: gravacao.href });
  });

  it("aponta para o Painel quando a gravação não tem link de commit", () => {
    const semLink = buildRespostas({ gravacao: { data: "hoje", commit: "abc12345" } });
    const reais = semLink.find((resposta) => resposta.id === "reais");

    expect(reais?.fontes[0]).toEqual({ rotulo: "Painel", href: "/projetos/careflow/painel" });
  });
});
