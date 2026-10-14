export type Header = { key: string; value: string };

export type SecurityHeadersOptions = {
  /** `next dev` precisa de `'unsafe-eval'` para o React reconstruir stack traces. */
  isDevelopment: boolean;
};

/**
 * CSP sem nonce, para manter as páginas estáticas (ver ADR-0003). Todo recurso vem da
 * própria origem; `'unsafe-inline'` em scripts existe porque o Next.js injeta o payload
 * do React Server Components em scripts inline cujo conteúdo muda a cada build.
 */
export function buildContentSecurityPolicy({ isDevelopment }: SecurityHeadersOptions): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])];

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
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
