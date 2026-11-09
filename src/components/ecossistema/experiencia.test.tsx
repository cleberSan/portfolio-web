import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EventoReproducao, NoId, Reproducao } from "@/content/ecossistema/modelo";
import { regioes } from "@/content/ecossistema/regioes";
import type { Cena, CarregarCena, OpcoesDaCena } from "./cena/tipos";
import { Experiencia } from "./experiencia";

const capacidades = vi.hoisted(() => ({
  webgl: false,
  menosMovimento: false,
}));

vi.mock("@/lib/capacidades", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/capacidades")>();
  return {
    ...real,
    webglDisponivel: () => capacidades.webgl,
    pedeMenosMovimento: () => capacidades.menosMovimento,
    observarMenosMovimento: () => () => {},
  };
});

function passo(
  inicioMs: number,
  origem: NoId,
  destino: NoId,
  operacao: string,
  extra: Partial<EventoReproducao> = {},
): EventoReproducao {
  return {
    inicioMs,
    origem,
    destino,
    operacao,
    viaBroker: false,
    marca: `+${inicioMs} ms`,
    duracao: "",
    portao: false,
    ...extra,
  };
}

const reproducoes: Reproducao[] = [
  {
    id: "reserva",
    nome: "Reserva de consulta",
    descricao: "Uma paciente sintética reserva uma consulta.",
    regiao: "careflow",
    fonte: {
      tipo: "gravacao",
      rotulo: "gravação do CI de teste",
      href: "https://github.com/cleberSan/careflow/commit/abc",
    },
    duracaoMs: 2000,
    eventos: [
      passo(0, "demo", "demo", "POST /demo/v1/appointments", { duracao: "20 ms" }),
      passo(1000, "demo", "agenda", "POST /v1/appointments", { duracao: "12 ms" }),
      passo(2000, "agenda", "notificacoes", "process appointment.booked", {
        viaBroker: true,
        duracao: "3 ms",
      }),
    ],
  },
  {
    id: "agentes",
    nome: "Uma fase com agentes",
    descricao: "Como uma fase anda.",
    regiao: "agentes",
    fonte: { tipo: "roteiro", rotulo: "roteiro de teste", href: "https://github.com/cleberSan/x" },
    duracaoMs: 1000,
    eventos: [
      passo(0, "base", "orquestrador", "lê a base"),
      passo(500, "orquestrador", "cleber", "OK da spec", { portao: true }),
    ],
  },
];

function cenaFalsa() {
  const cena: Cena = {
    destacar: vi.fn(),
    reproduzir: vi.fn(),
    pausar: vi.fn(),
    descartar: vi.fn(),
  };
  const opcoes: { atual?: OpcoesDaCena } = {};
  const criarCena = vi.fn((_container: HTMLElement, recebidas: OpcoesDaCena) => {
    opcoes.atual = recebidas;
    return cena;
  });
  const carregar: CarregarCena = vi.fn(() => Promise.resolve(criarCena));
  return { cena, criarCena, carregar, opcoes };
}

function montar(carregarCena?: CarregarCena) {
  return render(
    <Experiencia regioes={regioes} reproducoes={reproducoes} carregarCena={carregarCena} />,
  );
}

function monitor(): HTMLElement {
  return screen.getByRole("region", { name: "Mapa do ecossistema" });
}

function registro(): HTMLElement {
  return screen.getByRole("list", { name: /^Registro/ });
}

function avancar(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

async function esperarCena() {
  await act(async () => {
    await Promise.resolve();
  });
}

beforeEach(() => {
  capacidades.webgl = false;
  capacidades.menosMovimento = false;
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("experiência do ecossistema", () => {
  // spec 0001 CA-01
  it("no HTML do servidor, mostra o mapa parado e manda para o texto", () => {
    // Act
    const html = renderToString(<Experiencia regioes={regioes} reproducoes={reproducoes} />);

    // Assert
    expect(html).toContain('data-modo="estatico"');
    expect(html).toContain("O mapa interativo precisa de JavaScript");
    expect(html).not.toContain("<button");
  });

  // spec 0001 CA-05
  it("escolher uma região na lista destaca a região e abre o cartão dela", () => {
    // Arrange
    montar();
    const botao = screen.getByRole("button", { name: "Agentes" });

    // Act
    fireEvent.click(botao);

    // Assert
    expect(botao).toHaveAttribute("aria-pressed", "true");
    const cartao = screen.getByRole("article", { name: "Agentes" });
    const agentes = regioes.find((regiao) => regiao.id === "agentes")!;
    expect(cartao).toHaveTextContent(agentes.estado);
    expect(cartao).toHaveTextContent(agentes.stack.join(" · "));
    expect(within(cartao).getAllByRole("link")).toHaveLength(agentes.links.length);
    expect(monitor().querySelector('[data-regiao="agentes"]')).toHaveAttribute(
      "data-ativa",
      "true",
    );

    // Act: escolher de novo fecha o cartão.
    fireEvent.click(botao);

    // Assert
    expect(botao).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  // spec 0001 CA-05
  it("tocar uma região no mapa também abre o cartão", () => {
    montar();

    fireEvent.click(monitor().querySelector('[data-regiao="lojinha"]')!);

    expect(screen.getByRole("button", { name: "Lojinha Da Lua" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("article", { name: "Lojinha Da Lua" })).toBeInTheDocument();
  });

  // spec 0001 CA-06
  it("o registro lista serviço, operação e duração de cada sub-rotina, no tempo gravado", () => {
    // Arrange
    montar();
    expect(monitor()).toHaveAttribute("data-estado", "animando");
    expect(registro()).toHaveTextContent("Nenhum passo ainda.");

    // Act + Assert: o primeiro passo começa em 0, o segundo em 1 s e o terceiro em 2 s.
    avancar(50);
    expect(within(registro()).getAllByRole("listitem")).toHaveLength(1);

    avancar(1000);
    expect(within(registro()).getAllByRole("listitem")).toHaveLength(2);
    expect(registro()).toHaveTextContent(
      "Demo (BFF do Painel) → Agenda: POST /v1/appointments (12 ms)",
    );

    avancar(1000);
    expect(within(registro()).getAllByRole("listitem")).toHaveLength(3);
    expect(registro()).toHaveTextContent(
      "Agenda → RabbitMQ → Notificações: process appointment.booked (3 ms)",
    );
    expect(monitor().querySelector('[data-no="rabbitmq"]')).toHaveAttribute("data-aceso", "true");
  });

  // spec 0001 CA-06
  it("toca uma reprodução atrás da outra até o visitante escolher uma", () => {
    // Arrange
    montar();

    // Act: fim da reserva (2 s + cauda) e a pausa entre reproduções.
    avancar(3600);
    expect(screen.getByTestId("situacao")).toHaveTextContent("Fim da reprodução");
    avancar(1600);

    // Assert
    expect(screen.getByRole("button", { name: "Uma fase com agentes" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  // spec 0001 CA-03, CA-06
  it("escolher uma reprodução recomeça o registro, mostra a origem e para no fim", () => {
    // Arrange
    montar();
    avancar(1100);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Uma fase com agentes" }));

    // Assert
    expect(registro()).toHaveTextContent("Nenhum passo ainda.");
    expect(screen.getByRole("link", { name: /roteiro de teste/ })).toHaveAttribute(
      "href",
      "https://github.com/cleberSan/x",
    );
    avancar(600);
    expect(registro()).toHaveTextContent("claude-works → orquestrador: lê a base");
    expect(registro()).toHaveTextContent("OK da spec · espera o OK do Cleber");

    // Escolhida pelo visitante, a reprodução não emenda na próxima.
    avancar(5000);
    expect(screen.getByRole("button", { name: "Uma fase com agentes" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Repetir" }));
    expect(registro()).toHaveTextContent("Nenhum passo ainda.");
  });

  // spec 0001 CA-07
  it("Pausar para o relógio e o registro; Retomar continua de onde parou", () => {
    // Arrange
    montar();
    avancar(50);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    avancar(5000);

    // Assert
    expect(monitor()).toHaveAttribute("data-estado", "pausado");
    expect(within(registro()).getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByTestId("situacao")).toHaveTextContent("Pausado");

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Retomar" }));
    avancar(1000);

    // Assert
    expect(monitor()).toHaveAttribute("data-estado", "animando");
    expect(within(registro()).getAllByRole("listitem")).toHaveLength(2);
  });

  // spec 0001 CA-08
  it("com movimento reduzido, nada anima sozinho e a reprodução avança passo a passo", () => {
    // Arrange
    capacidades.menosMovimento = true;
    capacidades.webgl = true;
    const { carregar } = cenaFalsa();
    montar(carregar);

    // Act
    avancar(10_000);

    // Assert
    expect(monitor()).toHaveAttribute("data-modo", "2d");
    expect(monitor()).toHaveAttribute("data-estado", "pausado");
    expect(carregar).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Pausar" })).not.toBeInTheDocument();
    expect(registro()).toHaveTextContent("Nenhum passo ainda.");

    // Act + Assert
    const proximo = screen.getByRole("button", { name: "Próximo passo" });
    fireEvent.click(proximo);
    expect(screen.getByTestId("situacao")).toHaveTextContent("Passo 1 de 3");
    fireEvent.click(proximo);
    fireEvent.click(proximo);
    expect(screen.getByTestId("situacao")).toHaveTextContent("Passo 3 de 3");
    expect(proximo).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.getByTestId("situacao")).toHaveTextContent("Passo 0 de 3");
  });

  // spec 0001 CA-09
  it("sem WebGL, mostra o mapa 2D e avisa em uma linha", () => {
    montar();

    expect(monitor()).toHaveAttribute("data-modo", "2d");
    expect(screen.getByTestId("mapa-2d")).toBeInTheDocument();
    expect(monitor()).toHaveTextContent("mapa em 2D neste navegador");
  });

  // spec 0001 CA-09
  it("falha ao importar a cena troca para o mapa 2D sem erro no console", async () => {
    // Arrange
    capacidades.webgl = true;
    const erro = vi.spyOn(console, "error");
    const carregar: CarregarCena = () => Promise.reject(new Error("rede caiu"));

    // Act
    montar(carregar);
    expect(monitor()).toHaveAttribute("data-modo", "3d");
    await esperarCena();

    // Assert
    expect(monitor()).toHaveAttribute("data-modo", "2d");
    expect(erro).not.toHaveBeenCalled();
    erro.mockRestore();
  });

  // spec 0001 CA-09
  it("erro ao criar a cena também troca para o mapa 2D", async () => {
    capacidades.webgl = true;
    const carregar: CarregarCena = () =>
      Promise.resolve(() => {
        throw new Error("sem contexto");
      });

    montar(carregar);
    await esperarCena();

    expect(monitor()).toHaveAttribute("data-modo", "2d");
  });

  // spec 0001 CA-04, CA-05, CA-07, CA-09
  it("com WebGL, monta a cena e conversa com ela; contexto perdido vira mapa 2D", async () => {
    // Arrange
    capacidades.webgl = true;
    const { cena, criarCena, carregar, opcoes } = cenaFalsa();

    // Act
    montar(carregar);
    await esperarCena();

    // Assert: cena montada no palco, com a reprodução e sem destaque.
    expect(monitor()).toHaveAttribute("data-modo", "3d");
    expect(criarCena).toHaveBeenCalledWith(screen.getByTestId("palco-3d"), expect.any(Object));
    expect(screen.queryByTestId("mapa-2d")).not.toBeInTheDocument();
    expect(cena.reproduzir).toHaveBeenCalledWith(reproducoes[0].eventos);
    expect(cena.destacar).toHaveBeenLastCalledWith(null);
    expect(cena.pausar).toHaveBeenLastCalledWith(false);

    // A cena lê o relógio da reprodução.
    avancar(500);
    expect(opcoes.atual!.tempo()).toBeGreaterThanOrEqual(400);

    // Clique na cena e na lista chegam ao mesmo estado.
    act(() => opcoes.atual!.aoSelecionar("portfolio"));
    expect(screen.getByRole("button", { name: "portfolio-web" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Agentes" }));
    expect(cena.destacar).toHaveBeenLastCalledWith("agentes");

    fireEvent.click(screen.getByRole("button", { name: "Pausar" }));
    expect(cena.pausar).toHaveBeenLastCalledWith(true);

    // Act: o navegador derruba o contexto WebGL.
    act(() => opcoes.atual!.aoPerderContexto());

    // Assert
    expect(monitor()).toHaveAttribute("data-modo", "2d");
    expect(cena.descartar).toHaveBeenCalled();
    expect(screen.getByTestId("mapa-2d")).toBeInTheDocument();
  });

  it("descarta a cena ao sair da página", async () => {
    capacidades.webgl = true;
    const { cena, carregar } = cenaFalsa();
    const { unmount } = montar(carregar);
    await esperarCena();

    unmount();

    expect(cena.descartar).toHaveBeenCalled();
  });

  it("não monta a cena que chega depois de a página sair", async () => {
    capacidades.webgl = true;
    const { criarCena, carregar } = cenaFalsa();
    const { unmount } = montar(carregar);

    unmount();
    await esperarCena();

    expect(criarCena).not.toHaveBeenCalled();
  });

  // spec 0001 CA-10: a suspensão da renderização é da cena 3D (cena.test.ts, tarefa T07).
  it.todo("aba oculta ou cena fora da tela suspende a renderização");
});
