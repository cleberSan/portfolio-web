export type SiteUrl = {
  /** Origem pública do site, usada em URLs canônicas, sitemap e Open Graph. */
  url: URL;
  /** `false` quando `SITE_URL` não foi definida e o site ainda não tem endereço público. */
  configured: boolean;
};

const fallback = "http://localhost:3000";
const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Lê a origem pública do site. Sem valor, usa localhost e marca como não configurada,
 * para que o site não seja indexado com URLs erradas. Um valor inválido derruba o build
 * em vez de publicar metadados quebrados. A mensagem de erro não repete o valor, que
 * pode conter credenciais coladas por engano.
 */
export function resolveSiteUrl(raw: string | undefined): SiteUrl {
  const value = raw?.trim();
  if (!value) {
    return { url: new URL(fallback), configured: false };
  }

  if (!URL.canParse(value)) {
    throw new Error("SITE_URL não é uma URL válida.");
  }

  const url = new URL(value);

  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopbackHosts.has(url.hostname))) {
    throw new Error("SITE_URL deve usar https (http só é aceito para localhost).");
  }

  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("SITE_URL deve conter apenas a origem, sem caminho, query ou credenciais.");
  }

  return { url, configured: true };
}

export const siteUrl = resolveSiteUrl(process.env.SITE_URL);
