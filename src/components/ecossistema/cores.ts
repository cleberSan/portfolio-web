import type { RegiaoId } from "@/content/ecossistema/modelo";

/**
 * Classes de cor de cada região (tokens `--regiao-*` em `globals.css`). Ficam escritas por inteiro
 * para o Tailwind achar as classes no código.
 */
export const fundoDaRegiao: Readonly<Record<RegiaoId, string>> = {
  careflow: "bg-regiao-careflow",
  agentes: "bg-regiao-agentes",
  portfolio: "bg-regiao-portfolio",
  lojinha: "bg-regiao-lojinha",
  "claude-works": "bg-regiao-claude-works",
};

export const textoDaRegiao: Readonly<Record<RegiaoId, string>> = {
  careflow: "text-regiao-careflow",
  agentes: "text-regiao-agentes",
  portfolio: "text-regiao-portfolio",
  lojinha: "text-regiao-lojinha",
  "claude-works": "text-regiao-claude-works",
};
