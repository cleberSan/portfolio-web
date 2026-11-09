import { describe, expect, it, vi } from "vitest";
import { criarCiclo, type Agendador } from "./ciclo";

/** Agendador manual: cada `rodar` executa o quadro pendente no instante dado. */
function agendadorManual() {
  let pendente: { id: number; quadro: (agora: number) => void } | null = null;
  let proximo = 1;
  const agendador: Agendador = {
    agendar: vi.fn((quadro) => {
      pendente = { id: proximo, quadro };
      proximo += 1;
      return pendente.id;
    }),
    cancelar: vi.fn((id) => {
      if (pendente?.id === id) {
        pendente = null;
      }
    }),
  };
  const rodar = (agora: number) => {
    const atual = pendente;
    pendente = null;
    atual?.quadro(agora);
  };
  return { agendador, rodar, temPendente: () => pendente !== null };
}

describe("criarCiclo", () => {
  it("anima com a cena na tela, a aba visível e sem pausa, medindo o intervalo", () => {
    // Arrange
    const quadro = vi.fn();
    const { agendador, rodar } = agendadorManual();

    // Act
    criarCiclo(quadro, agendador);
    rodar(100);
    rodar(116);

    // Assert
    expect(quadro).toHaveBeenNthCalledWith(1, 0, true);
    expect(quadro).toHaveBeenNthCalledWith(2, 16, true);
  });

  // spec 0001 CA-10
  it("suspende com a aba oculta ou a cena fora da tela e volta sem pular tempo", () => {
    // Arrange
    const quadro = vi.fn();
    const { agendador, rodar, temPendente } = agendadorManual();
    const ciclo = criarCiclo(quadro, agendador);
    rodar(0);

    // Act: a aba fica oculta; o quadro já pedido desenha uma vez e o laço para.
    ciclo.definir({ oculta: true });
    rodar(16);

    // Assert
    expect(quadro).toHaveBeenLastCalledWith(expect.any(Number), false);
    expect(temPendente()).toBe(false);
    expect(ciclo.rodando()).toBe(false);

    // Act: volta depois de 10 s, e o primeiro intervalo é zero.
    ciclo.definir({ oculta: false });
    rodar(10_016);

    // Assert
    expect(quadro).toHaveBeenLastCalledWith(0, true);

    // Act: sai da tela.
    ciclo.definir({ naTela: false });
    rodar(10_032);
    ciclo.redesenhar();

    // Assert: fora da tela nem redesenha.
    expect(temPendente()).toBe(false);
  });

  // spec 0001 CA-07
  it("na pausa para de animar, mas redesenha uma vez quando algo muda", () => {
    // Arrange
    const quadro = vi.fn();
    const { agendador, rodar, temPendente } = agendadorManual();
    const ciclo = criarCiclo(quadro, agendador, { pausado: true, oculta: false, naTela: true });

    // Assert: começa parado.
    expect(temPendente()).toBe(false);

    // Act
    ciclo.redesenhar();
    rodar(50);

    // Assert
    expect(quadro).toHaveBeenCalledExactlyOnceWith(0, false);
    expect(temPendente()).toBe(false);

    // Act: retomar volta a animar.
    ciclo.definir({ pausado: false });
    rodar(70);
    rodar(86);

    // Assert
    expect(quadro).toHaveBeenLastCalledWith(16, true);
  });

  it("não pede quadro em dobro e para de vez ao descartar", () => {
    const quadro = vi.fn();
    const { agendador, temPendente } = agendadorManual();
    const ciclo = criarCiclo(quadro, agendador);

    ciclo.redesenhar();
    ciclo.definir({ pausado: false });
    expect(agendador.agendar).toHaveBeenCalledTimes(1);

    ciclo.parar();
    ciclo.redesenhar();
    ciclo.definir({ pausado: false });

    expect(agendador.cancelar).toHaveBeenCalledTimes(1);
    expect(temPendente()).toBe(false);
  });
});
