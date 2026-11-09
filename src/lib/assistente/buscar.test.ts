import { describe, expect, it } from "vitest";
import {
  buscar,
  limiarPadrao,
  normalizar,
  pontuar,
  tamanhoMaximoDaPergunta,
  termos,
  type Buscavel,
} from "./buscar";

const respostas: readonly (Buscavel & { id: string })[] = [
  { id: "careflow", chaves: { careflow: 2, vitrine: 2 } },
  { id: "privacidade", chaves: { privac: 3, lgpd: 3, dado: 2 } },
  { id: "loja", chaves: { lojinha: 3, "claude-works": 3, ia: 2 } },
  { id: "fraca", chaves: { agenda: 1, clinica: 1 } },
];

describe("normalizar e termos", () => {
  it("tira acento, caixa e pontuação, mas guarda o hífen", () => {
    expect(normalizar("Privacidade, LGPD e Eliminação?")).toBe("privacidade  lgpd e eliminacao ");
    expect(termos("O que é a claude-works?")).toEqual(["claude-works"]);
  });

  it("descarta palavras vazias e termos de uma letra", () => {
    expect(termos("Como é que a IA funciona x")).toEqual(["ia", "funciona"]);
  });

  // spec 0001 CA-15
  it("lê só os primeiros 200 caracteres", () => {
    const longa = `${"a".repeat(tamanhoMaximoDaPergunta)} careflow`;

    expect(termos(longa)).not.toContain("careflow");
  });
});

describe("pontuar", () => {
  it("soma o peso de cada chave que casa uma vez só", () => {
    expect(pontuar(["dados", "dado", "lgpd"], respostas[1].chaves)).toBe(5);
  });

  it("casa radical, palavra inteira e começo de palavra com cinco letras ou mais", () => {
    expect(pontuar(["privacidade"], respostas[1].chaves)).toBe(3);
    expect(pontuar(["lojin"], respostas[2].chaves)).toBe(3);
    // Termo curto não casa pelo começo: "lo" não é "lojinha", "i" não chega a ser termo.
    expect(pontuar(["lo", "loj"], respostas[2].chaves)).toBe(0);
    // Chave curta só casa inteira: "iam" não é "ia".
    expect(pontuar(["iam"], respostas[2].chaves)).toBe(0);
  });
});

describe("buscar", () => {
  // spec 0001 CA-12
  it.each([
    ["O que é o CareFlow?", "careflow"],
    ["como vocês tratam a PRIVACIDADE?", "privacidade"],
    ["e a lgpd", "privacidade"],
    ["Me fala da Lojinha", "loja"],
    ["claude-works", "loja"],
  ])("acha a resposta de %j", (pergunta, id) => {
    expect(buscar(pergunta, respostas)?.id).toBe(id);
  });

  it("no empate, fica com a resposta que vem antes", () => {
    const empate = [
      { id: "primeira", chaves: { agenda: 2 } },
      { id: "segunda", chaves: { agenda: 2 } },
    ];

    expect(buscar("agenda", empate)?.id).toBe("primeira");
  });

  // spec 0001 CA-13
  it("não responde abaixo do limiar", () => {
    // Uma chave fraca vale 1; o limiar pede 2.
    expect(limiarPadrao).toBe(2);
    expect(buscar("agenda", respostas)).toBeNull();
    expect(buscar("agenda da clínica", respostas)?.id).toBe("fraca");
  });

  // spec 0001 CA-13
  it("não responde ao que não conhece", () => {
    expect(buscar("qual é a receita de bolo de fubá?", respostas)).toBeNull();
  });

  // spec 0001 CA-15
  it("ignora pergunta vazia ou só com espaço e pontuação", () => {
    expect(buscar("", respostas)).toBeNull();
    expect(buscar("   \n\t ", respostas)).toBeNull();
    expect(buscar("?!...", respostas)).toBeNull();
  });

  // spec 0001 CA-15
  it("trata HTML e script como texto, sem executar nada", () => {
    const pergunta = `<img src=x onerror="alert(1)"><script>fetch('//x')</script> careflow vitrine`;

    expect(buscar(pergunta, respostas)?.id).toBe("careflow");
  });

  // spec 0001 CA-15
  it("aguenta pergunta enorme sem passar dos 200 caracteres", () => {
    const enorme = "careflow ".repeat(100_000);

    expect(buscar(enorme, respostas)?.id).toBe("careflow");
  });
});
