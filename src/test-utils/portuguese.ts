/**
 * Nomes próprios que ficam em português em qualquer idioma: cidade, empresa, produto e idioma.
 * Saem do texto antes da conferência para não serem confundidos com tradução esquecida.
 */
const properNouns = [
  "São Paulo",
  "São Caetano do Sul",
  "Familhão",
  "SOMOS Educação",
  "Lojinha Da Lua",
  "Português",
];

/** Palavras funcionais e acentos do português que não aparecem num texto em inglês. */
const portugueseMarkers =
  /\b(?:e|de|da|das|dos|com|para|em|na|nas|que|uma|não|sem|pelo|pela|seu|sua)\b|[ãõçáéíóúâêô]/gi;

/** Trechos que denunciam texto em português esquecido numa página ou num conteúdo em inglês. */
/** Endereços como `linkedin.com/in/...`, que não são texto e têm "com" no meio. */
const addresses = /\b[\w.-]+\.[a-z]{2,}(?:\/\S*)?/gi;

export function portugueseLeftovers(text: string): string[] {
  const cleaned = properNouns.reduce(
    (result, noun) => result.replaceAll(noun, " "),
    text.replace(addresses, " "),
  );
  return [...cleaned.matchAll(portugueseMarkers)].map((match) => {
    const start = Math.max(0, match.index - 30);
    return cleaned.slice(start, match.index + 30).trim();
  });
}

/** Texto visível de um elemento, sem os trechos marcados como português (`lang="pt-BR"`). */
export function textOutsidePortuguese(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  // Dados estruturados (JSON-LD) não são texto da página.
  for (const node of clone.querySelectorAll('[lang="pt-BR"], script')) {
    node.remove();
  }
  return clone.textContent ?? "";
}
