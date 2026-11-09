/**
 * Laço de quadros da cena 3D (spec 0001, CA-07 e CA-10). Só roda com a cena visível na tela, a
 * aba visível e sem pausa; parado, a cena desenha um quadro quando algo muda (destaque ou
 * reprodução nova) e não gasta GPU. Separado da cena para ser testado sem WebGL.
 */

export type Agendador = {
  agendar: (quadro: (agora: number) => void) => number;
  cancelar: (id: number) => void;
};

export type EstadoDoCiclo = { pausado: boolean; oculta: boolean; naTela: boolean };

export type Ciclo = {
  definir: (mudanca: Partial<EstadoDoCiclo>) => void;
  /** Pede um quadro avulso, para mostrar uma mudança com o laço parado. */
  redesenhar: () => void;
  rodando: () => boolean;
  parar: () => void;
};

/**
 * `quadro` recebe o intervalo desde o quadro anterior (0 no primeiro depois de parado) e se o
 * laço está animando ou só redesenhando.
 */
export function criarCiclo(
  quadro: (deltaMs: number, animando: boolean) => void,
  agendador: Agendador,
  inicial: EstadoDoCiclo = { pausado: false, oculta: false, naTela: true },
): Ciclo {
  const estado = { ...inicial };
  let id: number | null = null;
  let anterior: number | null = null;
  let parado = false;

  const podeAnimar = () => !estado.pausado && !estado.oculta && estado.naTela;

  const passo = (agora: number) => {
    id = null;
    const animando = podeAnimar();
    const delta = anterior === null ? 0 : agora - anterior;
    anterior = animando ? agora : null;
    quadro(delta, animando);
    if (animando && !parado) {
      id = agendador.agendar(passo);
    }
  };

  const garantir = () => {
    if (id === null && !parado) {
      id = agendador.agendar(passo);
    }
  };

  const ciclo: Ciclo = {
    definir(mudanca) {
      Object.assign(estado, mudanca);
      if (podeAnimar()) {
        garantir();
      } else {
        anterior = null;
      }
    },
    redesenhar() {
      if (!estado.oculta && estado.naTela) {
        garantir();
      }
    },
    rodando: () => id !== null,
    parar() {
      parado = true;
      if (id !== null) {
        agendador.cancelar(id);
        id = null;
      }
    },
  };

  if (podeAnimar()) {
    garantir();
  }
  return ciclo;
}
