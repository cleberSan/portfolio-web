import { describe, expect, it, vi } from "vitest";
import {
  decidirModo,
  observarMenosMovimento,
  pedeMenosMovimento,
  temWebGL,
  webglDisponivel,
} from "./capacidades";

function documentoCom(getContext: (tipo: string) => unknown): Document {
  return { createElement: () => ({ getContext }) } as unknown as Document;
}

function janelaCom(matches: boolean | undefined) {
  const consulta = {
    matches: Boolean(matches),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  const janela = {
    matchMedia: matches === undefined ? undefined : vi.fn(() => consulta),
  } as unknown as Window;
  return { janela, consulta };
}

describe("decidirModo", () => {
  // spec 0001 CA-04, CA-08, CA-09
  it.each([
    [true, false, "3d"],
    [true, true, "2d"],
    [false, false, "2d"],
    [false, true, "2d"],
  ] as const)("webgl %s e menos movimento %s dá %s", (webgl, menosMovimento, modo) => {
    expect(decidirModo({ webgl, menosMovimento })).toBe(modo);
  });
});

describe("temWebGL", () => {
  it("prefere WebGL 2 e libera o contexto de teste", () => {
    // Arrange
    const loseContext = vi.fn();
    const contexto = { getExtension: vi.fn(() => ({ loseContext })) };
    const getContext = vi.fn((tipo: string) => (tipo === "webgl2" ? contexto : null));

    // Act
    const resultado = temWebGL(documentoCom(getContext));

    // Assert
    expect(resultado).toBe(true);
    expect(getContext).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalled();
  });

  it("aceita WebGL 1 sem a extensão de liberar contexto", () => {
    const contexto = { getExtension: () => null };

    expect(temWebGL(documentoCom((tipo) => (tipo === "webgl" ? contexto : null)))).toBe(true);
  });

  // spec 0001 CA-09
  it("conta como falta de WebGL quando não há contexto ou quando o navegador lança erro", () => {
    expect(temWebGL(documentoCom(() => null))).toBe(false);
    expect(
      temWebGL(
        documentoCom(() => {
          throw new Error("bloqueado");
        }),
      ),
    ).toBe(false);
  });

  it("guarda o resultado para não criar contexto a cada consulta", () => {
    // O jsdom não implementa canvas; o teste simula um navegador sem WebGL.
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const primeira = webglDisponivel();
    const segunda = webglDisponivel();

    expect([primeira, segunda]).toEqual([false, false]);
    expect(getContext).toHaveBeenCalledTimes(2); // webgl2 e webgl, uma única vez
    getContext.mockRestore();
  });
});

describe("movimento reduzido", () => {
  // spec 0001 CA-08
  it("lê a preferência do sistema", () => {
    expect(pedeMenosMovimento(janelaCom(true).janela)).toBe(true);
    expect(pedeMenosMovimento(janelaCom(false).janela)).toBe(false);
    expect(pedeMenosMovimento(janelaCom(undefined).janela)).toBe(false);
  });

  it("assina e cancela a mudança de preferência", () => {
    // Arrange
    const { janela, consulta } = janelaCom(false);
    const aoMudar = vi.fn();

    // Act
    const cancelar = observarMenosMovimento(aoMudar, janela);
    cancelar();

    // Assert
    expect(consulta.addEventListener).toHaveBeenCalledWith("change", aoMudar);
    expect(consulta.removeEventListener).toHaveBeenCalledWith("change", aoMudar);
  });

  it("não quebra sem matchMedia", () => {
    expect(() => observarMenosMovimento(() => {}, janelaCom(undefined).janela)()).not.toThrow();
  });
});
