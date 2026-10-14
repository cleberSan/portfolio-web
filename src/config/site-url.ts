export type SiteUrl = {
  /** Origem pública do site, usada em URLs canônicas, sitemap e Open Graph. */
  url: URL;
  /** `true` só quando o endereço público é conhecido e este build é o de produção. */
  indexable: boolean;
};

/** Variáveis lidas no build. As `VERCEL_*` são preenchidas pela própria Vercel. */
export type SiteUrlEnv = {
  /** Origem pública definida à mão; tem prioridade sobre a detecção automática. */
  SITE_URL?: string;
  /** `production`, `preview` ou `development` na Vercel; ausente fora dela. */
  VERCEL_ENV?: string;
  /** Domínio de produção do projeto, sem protocolo. A Vercel o define até em previews. */
  VERCEL_PROJECT_PRODUCTION_URL?: string;
};

const fallback = "http://localhost:3000";
const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Resolve a origem pública do site e se ele pode ser indexado.
 *
 * - `SITE_URL` vence; sem ela, na Vercel, usa o domínio de produção do projeto.
 * - Sem nenhum dos dois (CI, máquina local), usa localhost e bloqueia indexação, para
 *   não publicar URLs canônicas apontando para localhost.
 * - Previews da Vercel nunca são indexáveis: as canônicas apontam para produção e o
 *   `robots.txt` pede para não rastrear.
 *
 * Um valor inválido derruba o build em vez de publicar metadados quebrados. As mensagens
 * de erro não repetem o valor, que pode conter credenciais coladas por engano.
 */
export function resolveSiteUrl(env: SiteUrlEnv): SiteUrl {
  const explicit = env.SITE_URL?.trim();
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  const isVercelNonProduction = Boolean(env.VERCEL_ENV) && env.VERCEL_ENV !== "production";

  if (explicit) {
    return { url: parseOrigin(explicit, "SITE_URL"), indexable: !isVercelNonProduction };
  }

  if (vercelHost) {
    const url = parseOrigin(`https://${vercelHost}`, "VERCEL_PROJECT_PRODUCTION_URL");
    return { url, indexable: env.VERCEL_ENV === "production" };
  }

  return { url: new URL(fallback), indexable: false };
}

function parseOrigin(value: string, name: string): URL {
  if (!URL.canParse(value)) {
    throw new Error(`${name} não é uma URL válida.`);
  }

  const url = new URL(value);

  if (url.protocol !== "https:" && !(url.protocol === "http:" && loopbackHosts.has(url.hostname))) {
    throw new Error(`${name} deve usar https (http só é aceito para localhost).`);
  }

  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error(`${name} deve conter apenas a origem, sem caminho, query ou credenciais.`);
  }

  return url;
}

export const siteUrl = resolveSiteUrl({
  SITE_URL: process.env.SITE_URL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
});
