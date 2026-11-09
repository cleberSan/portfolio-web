/**
 * Busca local do assistente da página /ecossistema (spec 0001, CA-12, CA-13 e CA-15). Roda no
 * navegador, sem rede e sem guardar nada: compara as palavras da pergunta com as palavras-chave de
 * cada resposta gravada e devolve a melhor acima do limiar, ou nenhuma.
 */

export const tamanhoMaximoDaPergunta = 200;

/** Pontuação mínima: uma palavra-chave forte (peso 2 ou 3), ou duas fracas. */
export const limiarPadrao = 2;

export type Buscavel = { chaves: Readonly<Record<string, number>> };

const palavrasVazias = new Set(
  (
    "a o as os um uma uns umas de do da dos das e em no na nos nas que como qual quais por para pra " +
    "com se isso esse essa este esta me te seu sua meu minha mais muito tem ser foi sao e ou " +
    "ao aos la lo eu ele ela eles elas"
  ).split(" "),
);

/** Minúsculas, sem acento e sem pontuação (o hífen fica, para nomes como claude-works). */
export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ");
}

export function termos(texto: string): string[] {
  return normalizar(texto.slice(0, tamanhoMaximoDaPergunta))
    .split(/\s+/)
    .filter((termo) => termo.length > 1 && !palavrasVazias.has(termo));
}

/**
 * Um termo casa com a chave quando é igual a ela, quando começa por ela (a chave é um radical de
 * quatro letras ou mais, como "privac") ou quando é o começo dela com cinco letras ou mais.
 */
function casa(termo: string, chave: string): boolean {
  return (
    termo === chave ||
    (chave.length >= 4 && termo.startsWith(chave)) ||
    (termo.length >= 5 && chave.startsWith(termo))
  );
}

export function pontuar(
  lista: readonly string[],
  chaves: Readonly<Record<string, number>>,
): number {
  let total = 0;
  for (const [chave, peso] of Object.entries(chaves)) {
    const normalizada = normalizar(chave).trim();
    if (lista.some((termo) => casa(termo, normalizada))) {
      total += peso;
    }
  }
  return total;
}

/** A resposta de maior pontuação; no empate vale a que vem antes na lista. */
export function buscar<T extends Buscavel>(
  pergunta: string,
  respostas: readonly T[],
  limiar = limiarPadrao,
): T | null {
  const lista = termos(pergunta);
  if (lista.length === 0) {
    return null;
  }
  let melhor: T | null = null;
  let melhorPontuacao = 0;
  for (const resposta of respostas) {
    const pontuacao = pontuar(lista, resposta.chaves);
    if (pontuacao > melhorPontuacao) {
      melhor = resposta;
      melhorPontuacao = pontuacao;
    }
  }
  return melhorPontuacao >= limiar ? melhor : null;
}
