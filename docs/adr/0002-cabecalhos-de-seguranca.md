# ADR-0002: Cabeçalhos de segurança e CSP

- Status: aceito; a política de `script-src` e `style-src` foi decidida no [ADR-0003](0003-csp-sem-nonce.md)
- Data: 2026-10-14

## Contexto

O site deve se proteger de clickjacking, sniffing de MIME, vazamento de referrer e injeção de conteúdo. No Next.js, uma CSP completa para scripts depende de nonce por requisição, o que obriga renderização dinâmica e elimina as páginas estáticas.

## Decisão

Todas as rotas recebem, via `headers()` em `next.config.ts`, os cabeçalhos definidos em `src/config/security-headers.ts`: HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` e uma CSP parcial (`base-uri`, `form-action`, `frame-ancestors`, `object-src`), que não depende de nonce. O cabeçalho `X-Powered-By` é removido.

A política de `script-src` e `style-src` fica pendente até a fase 1, quando será escolhida entre nonce (renderização dinâmica) e hashes/SRI (mantém páginas estáticas).

## Alternativas

- **CSP completa com nonce já na fase 0:** mais segura contra XSS, mas troca desempenho e cache por proteção num site sem entrada de usuário.
- **Nenhum cabeçalho até o deploy:** deixaria a proteção para depois e sem teste.

## Consequências

- Os cabeçalhos são testados por unidade, então removê-los quebra o CI.
- Até a fase 1, a CSP não restringe origens de scripts.
