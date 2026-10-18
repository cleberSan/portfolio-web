const listFormat = new Intl.ListFormat("pt-BR", { style: "long", type: "conjunction" });

/** "pagamentos digitais, saúde e educação": lista natural em minúsculas, para o meio da frase. */
export function formatList(items: readonly string[]): string {
  return listFormat.format(items.map((item) => item.toLowerCase()));
}
