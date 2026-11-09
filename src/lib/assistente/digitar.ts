/**
 * Digitação do assistente de /ecossistema (spec 0001, CA-07 e CA-17): a resposta aparece palavra por
 * palavra. O corte cai sempre no fim de uma palavra, para o texto parcial nunca mostrar meia palavra.
 */

/** Intervalo entre duas palavras na tela. */
export const intervaloDaDigitacaoMs = 35;

/** Fim da próxima palavra depois de `mostrados` caracteres, ou o tamanho do texto. */
export function proximoCorte(texto: string, mostrados: number): number {
  if (mostrados >= texto.length) {
    return texto.length;
  }
  const inicio = Math.max(0, mostrados);
  let corte = inicio;
  while (corte < texto.length && texto[corte] === " ") {
    corte += 1;
  }
  while (corte < texto.length && texto[corte] !== " ") {
    corte += 1;
  }
  return corte;
}
