export type Header = { key: string; value: string };

export type SecurityHeadersOptions = {
  /** `next dev` precisa de `'unsafe-eval'` para o React reconstruir stack traces. */
  isDevelopment: boolean;
  /** Backend da demonstração ao vivo do Painel; sem ele, o navegador só fala com o próprio site. */
  demoBackend?: URL;
};

/**
 * CSP sem nonce, para manter as páginas estáticas (ver ADR-0003). Todo recurso vem da
 * própria origem; `'unsafe-inline'` em scripts existe porque o Next.js injeta o payload
 * do React Server Components em scripts inline cujo conteúdo muda a cada build. A única origem
 * de fora é o backend da demonstração ao vivo, em `connect-src`.
 */
export function buildContentSecurityPolicy({
  isDevelopment,
  demoBackend,
}: SecurityHeadersOptions): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])];
  // Só a origem, nunca um curinga: o Painel ao vivo chama um único host.
  const connectSrc = ["'self'", ...(demoBackend ? [demoBackend.origin] : [])];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function buildSecurityHeaders(options: SecurityHeadersOptions): readonly Header[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
