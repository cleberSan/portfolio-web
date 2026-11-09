import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { avisoDePrivacidade, semResposta } from "@/content/ecossistema/assistente";
import type { RespostaGravada } from "@/content/ecossistema/modelo";
import { intervaloDaDigitacaoMs } from "@/lib/assistente/digitar";
import { simularFala, vozInglesa, vozPtBrLocal } from "@/test-utils/fala";
import { AssistenteUi } from "./assistente-ui";

const respostas: RespostaGravada[] = [
  {
    id: "careflow",
    pergunta: "O que é o CareFlow?",
    chaves: { careflow: 2 },
    texto: "O CareFlow é o projeto vitrine, com dados sintéticos.",
    regiao: "careflow",
    reproducao: "reserva",
    fontes: [
      { rotulo: "Estudo de caso", href: "/projetos/careflow" },
      { rotulo: "Código", href: "https://github.com/cleberSan/careflow" },
    ],
  },
  {
    id: "privacidade",
    pergunta: "Como o CareFlow protege os dados?",
    chaves: { lgpd: 3, privac: 3 },
    texto: "Os dados pessoais ficam no cofre do paciente.",
    regiao: "careflow",
    reproducao: "revogacao",
    fontes: [{ rotulo: "ADR-0004", href: "https://github.com/cleberSan/careflow/x" }],
  },
];

function montar(props: Partial<Parameters<typeof AssistenteUi>[0]> = {}) {
  const aoResponder = vi.fn();
  const resultado = render(
    <AssistenteUi
      respostas={respostas}
      sugestoes={["careflow", "privacidade", "nao-existe"]}
      pausado={false}
      animado
      aoResponder={aoResponder}
      {...props}
    />,
  );
  return { ...resultado, aoResponder };
}

function perguntar(texto: string) {
  fireEvent.change(screen.getByLabelText("Sua pergunta"), { target: { value: texto } });
  fireEvent.click(screen.getByRole("button", { name: "Perguntar" }));
}

/** Cada palavra agenda a próxima depois de renderizar, então o tempo anda um quadro por vez. */
function esperar(ms: number) {
  for (let decorrido = 0; decorrido < ms; decorrido += intervaloDaDigitacaoMs) {
    act(() => {
      vi.advanceTimersByTime(intervaloDaDigitacaoMs);
    });
  }
}

function digitarTudo() {
  esperar(5000);
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Sinapse na tela", () => {
  // spec 0001 CA-14
  it("avisa que as respostas foram escritas antes e que nada sai do navegador", () => {
    montar();

    expect(screen.getByText(avisoDePrivacidade)).toBeInTheDocument();
  });

  // spec 0001 CA-12
  it("pergunta sugerida mostra a resposta com as fontes e avisa a cena", () => {
    // Arrange
    const { aoResponder } = montar();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "O que é o CareFlow?" }));
    digitarTudo();

    // Assert
    const resposta = screen.getByTestId("resposta");
    expect(resposta).toHaveTextContent(respostas[0].texto);
    expect(within(resposta).getByRole("link", { name: "Estudo de caso" })).toHaveAttribute(
      "href",
      "/projetos/careflow",
    );
    expect(within(resposta).getByRole("link", { name: /^Código/ })).toHaveAttribute(
      "href",
      "https://github.com/cleberSan/careflow",
    );
    expect(aoResponder).toHaveBeenCalledWith(respostas[0]);
  });

  it("só sugere perguntas que têm resposta", () => {
    montar();

    const sugeridas = within(screen.getByRole("list", { name: "Perguntas sugeridas" }));
    expect(sugeridas.getAllByRole("button")).toHaveLength(2);
  });

  // spec 0001 CA-12
  it("busca a pergunta digitada entre as respostas gravadas e limpa o campo", () => {
    // Arrange
    const { aoResponder } = montar();

    // Act
    perguntar("E a LGPD?");
    digitarTudo();

    // Assert
    expect(screen.getByText("Você perguntou: E a LGPD?")).toBeInTheDocument();
    expect(screen.getByTestId("resposta")).toHaveTextContent(respostas[1].texto);
    expect(aoResponder).toHaveBeenCalledWith(respostas[1]);
    expect(screen.getByLabelText("Sua pergunta")).toHaveValue("");
  });

  // spec 0001 CA-13
  it("sem resposta gravada, diz que não tem e mantém as sugestões", () => {
    // Arrange
    const { aoResponder } = montar();

    // Act
    perguntar("qual a previsão do tempo?");
    digitarTudo();

    // Assert
    expect(screen.getByTestId("resposta")).toHaveTextContent(semResposta);
    expect(screen.queryByText("Fontes:")).not.toBeInTheDocument();
    expect(aoResponder).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "O que é o CareFlow?" })).toBeInTheDocument();
  });

  // spec 0001 CA-15
  it("ignora envio vazio ou só com espaços e limita o campo a 200 caracteres", () => {
    montar();

    perguntar("");
    perguntar("    ");

    expect(screen.queryByText(/^Você perguntou/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Sua pergunta")).toHaveAttribute("maxLength", "200");
  });

  // spec 0001 CA-15
  it("mostra HTML digitado como texto, sem criar elemento", () => {
    // Arrange
    const { container } = montar();
    const ataque = '<img src=x onerror="alert(1)"><script>alert(2)</script>';

    // Act
    perguntar(ataque);

    // Assert
    expect(screen.getByText(`Você perguntou: ${ataque}`)).toBeInTheDocument();
    expect(container.querySelector("img, script")).toBeNull();
  });

  // spec 0001 CA-14
  it("enviar uma pergunta não faz requisição nem grava no navegador", () => {
    // Arrange
    const requisicao = vi.fn();
    vi.stubGlobal("fetch", requisicao);
    const gravar = vi.spyOn(Storage.prototype, "setItem");
    montar();

    // Act
    perguntar("o que é o careflow");
    digitarTudo();

    // Assert
    expect(requisicao).not.toHaveBeenCalled();
    expect(gravar).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  // spec 0001 CA-07
  it("a digitação para na pausa e continua de onde parou", () => {
    // Arrange
    const { rerender, aoResponder } = montar();
    fireEvent.click(screen.getByRole("button", { name: "O que é o CareFlow?" }));
    esperar(80);
    const parcial = screen.getByTestId("resposta").textContent;

    // Act
    const pausar = (pausado: boolean) =>
      rerender(
        <AssistenteUi
          respostas={respostas}
          sugestoes={["careflow"]}
          pausado={pausado}
          animado
          aoResponder={aoResponder}
        />,
      );
    pausar(true);
    esperar(5000);

    // Assert
    expect(screen.getByTestId("resposta").textContent).toBe(parcial);
    expect(parcial).not.toContain(respostas[0].texto);

    // Act
    pausar(false);
    digitarTudo();

    // Assert
    expect(screen.getByTestId("resposta")).toHaveTextContent(respostas[0].texto);
  });

  // spec 0001 CA-17
  it("anuncia a resposta uma vez, completa, quando termina de aparecer", () => {
    // Arrange
    montar();
    const anuncio = screen.getByTestId("anuncio");
    expect(anuncio).toHaveAttribute("aria-live", "polite");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "O que é o CareFlow?" }));
    esperar(80);

    // Assert: durante a digitação a região viva fica vazia.
    expect(anuncio).toBeEmptyDOMElement();

    digitarTudo();
    expect(anuncio).toHaveTextContent(respostas[0].texto);
  });

  // spec 0001 CA-08, CA-17
  it("com movimento reduzido, a resposta aparece e é anunciada inteira de uma vez", () => {
    montar({ animado: false });

    fireEvent.click(screen.getByRole("button", { name: "Como o CareFlow protege os dados?" }));

    expect(screen.getByTestId("resposta")).toHaveTextContent(respostas[1].texto);
    expect(screen.getByTestId("anuncio")).toHaveTextContent(respostas[1].texto);
  });
});

describe("voz do Sinapse", () => {
  const botaoDeVoz = () => screen.queryByRole("button", { name: "Ler respostas em voz alta" });

  // spec 0001 CA-19
  it("sem síntese de fala, o controle de voz não aparece", () => {
    montar();

    expect(botaoDeVoz()).not.toBeInTheDocument();
  });

  // spec 0001 CA-19
  it("sem voz em português, o controle não aparece; com a voz chegando depois, aparece", () => {
    // Arrange
    const fala = simularFala([vozInglesa]);
    montar();

    // Assert
    expect(botaoDeVoz()).not.toBeInTheDocument();

    // Act
    act(() => fala.trocarVozes([vozInglesa, vozPtBrLocal]));

    // Assert
    expect(botaoDeVoz()).toBeInTheDocument();
  });

  // spec 0001 CA-18
  it("começa desligada: responder não fala nada", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);
    montar();

    // Act
    fireEvent.click(screen.getByRole("button", { name: "O que é o CareFlow?" }));

    // Assert
    expect(botaoDeVoz()).toHaveAttribute("aria-pressed", "false");
    expect(fala.falas).toEqual([]);
  });

  // spec 0001 CA-18
  it("ligada, lê só a resposta gravada, nunca o que o visitante digitou", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);
    montar();
    fireEvent.click(botaoDeVoz()!);

    // Act
    perguntar("<b>careflow</b> segredo do visitante");
    perguntar("previsão do tempo amanhã");

    // Assert
    expect(botaoDeVoz()).toHaveAttribute("aria-pressed", "true");
    const lido = fala.falas.map(({ texto }) => texto).join(" ");
    expect(lido).toBe(`${respostas[0].texto} ${semResposta}`);
    expect(lido).not.toMatch(/segredo|visitante|previsão/);
  });

  // spec 0001 CA-18
  it("ligar com uma resposta na tela lê essa resposta; desligar para a leitura", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);
    montar();
    fireEvent.click(screen.getByRole("button", { name: "Como o CareFlow protege os dados?" }));

    // Act
    fireEvent.click(botaoDeVoz()!);

    // Assert
    expect(fala.falas.map(({ texto }) => texto)).toEqual([respostas[1].texto]);

    // Act
    fala.cancel.mockClear();
    fireEvent.click(botaoDeVoz()!);

    // Assert
    expect(fala.cancel).toHaveBeenCalled();
    expect(botaoDeVoz()).toHaveAttribute("aria-pressed", "false");
  });

  // spec 0001 CA-18
  it("a pausa para a voz e, pausada, uma resposta nova não é lida", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);
    const { rerender, aoResponder } = montar();
    fireEvent.click(botaoDeVoz()!);
    fala.cancel.mockClear();

    // Act
    rerender(
      <AssistenteUi
        respostas={respostas}
        sugestoes={["careflow", "privacidade"]}
        pausado
        animado
        aoResponder={aoResponder}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "O que é o CareFlow?" }));
    fireEvent.click(botaoDeVoz()!);
    fireEvent.click(botaoDeVoz()!);

    // Assert
    expect(fala.cancel).toHaveBeenCalled();
    expect(fala.falas).toEqual([]);
  });

  it("para a voz ao sair da página", () => {
    // Arrange
    const fala = simularFala([vozPtBrLocal]);
    const { unmount } = montar();
    fala.cancel.mockClear();

    // Act
    unmount();

    // Assert
    expect(fala.cancel).toHaveBeenCalledTimes(1);
  });
});
