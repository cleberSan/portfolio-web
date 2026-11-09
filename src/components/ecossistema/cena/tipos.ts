import type { EventoReproducao, RegiaoId } from "@/content/ecossistema/modelo";

/**
 * Contrato entre a experiência de /ecossistema e a cena 3D (spec 0001). A experiência baixa a cena
 * sob demanda e fala com ela só por esta interface, para o resto da página não depender do three.
 */

export type OpcoesDaCena = {
  /** Clique ou toque numa região da cena. */
  aoSelecionar: (regiao: RegiaoId) => void;
  /** O navegador derrubou o contexto WebGL: a experiência troca para o mapa 2D. */
  aoPerderContexto: () => void;
  /** Instante atual da reprodução, em milissegundos, lido a cada quadro. */
  tempo: () => number;
};

export type Cena = {
  destacar(regiao: RegiaoId | null): void;
  reproduzir(eventos: readonly EventoReproducao[]): void;
  /** Para rotação e sinais; a cena também para sozinha com a aba oculta ou fora da tela. */
  pausar(pausado: boolean): void;
  descartar(): void;
};

export type CriarCena = (container: HTMLElement, opcoes: OpcoesDaCena) => Cena;

export type CarregarCena = () => Promise<CriarCena>;
