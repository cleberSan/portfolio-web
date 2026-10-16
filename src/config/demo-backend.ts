/**
 * Origem do backend da demonstração hospedada do CareFlow (ADR-0013 do CareFlow), lida no build de
 * `NEXT_PUBLIC_CAREFLOW_DEMO_URL`. É a única origem fora do site que a CSP deixa o navegador chamar, e só o
 * Painel a usa. Sem a variável, o Painel fica só no replay das gravações.
 *
 * Um valor inválido derruba o build em vez de abrir a CSP para um endereço errado. As mensagens de erro não
 * repetem o valor.
 */
export function resolveDemoBackend(value: string | undefined): URL | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!URL.canParse(trimmed)) {
    throw new Error("NEXT_PUBLIC_CAREFLOW_DEMO_URL não é uma URL válida.");
  }

  const url = new URL(trimmed);
  if (url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_CAREFLOW_DEMO_URL deve usar https.");
  }

  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error(
      "NEXT_PUBLIC_CAREFLOW_DEMO_URL deve conter apenas a origem, sem caminho, query ou credenciais.",
    );
  }

  return url;
}

// Referência literal: o Next.js só embute no código do navegador variáveis NEXT_PUBLIC_ escritas assim.
export const demoBackend = resolveDemoBackend(process.env.NEXT_PUBLIC_CAREFLOW_DEMO_URL);
