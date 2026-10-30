# Política de segurança

Não abra issue pública para vulnerabilidades. Use o [reporte privado de vulnerabilidades do GitHub](https://github.com/cleberSan/portfolio-web/security/advisories/new). O retorno inicial acontece em até 5 dias úteis.

Práticas adotadas: cabeçalhos de segurança e CSP em todas as rotas (ver [ADR-0002](docs/adr/0002-cabecalhos-de-seguranca.md) e [ADR-0003](docs/adr/0003-csp-sem-nonce.md)), CodeQL e revisão de dependências em todo PR, Dependabot semanal com auto-merge só para atualização de baixo risco ([ADR-0007](docs/adr/0007-dependabot-com-auto-merge.md)) e nenhum segredo versionado.
