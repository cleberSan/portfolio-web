# portfolio-web

[![CI](https://github.com/cleberSan/portfolio-web/actions/workflows/ci.yml/badge.svg)](https://github.com/cleberSan/portfolio-web/actions/workflows/ci.yml)
[![CodeQL](https://github.com/cleberSan/portfolio-web/actions/workflows/codeql.yml/badge.svg)](https://github.com/cleberSan/portfolio-web/actions/workflows/codeql.yml)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

Portfólio pessoal de Cleber, Engenheiro de Software Full-Stack Sênior, com foco em sistemas críticos, microsserviços distribuídos e frontends modernos.

Construído com Next.js 16, TypeScript e Tailwind CSS. O projeto vitrine é o [CareFlow](https://github.com/cleberSan/careflow), e o site exibe sua evolução num diário de bordo e, na fase 6, vai mostrar o Painel de Privacidade e Resiliência ao vivo.

## O que tem no site

| Rota                 | Conteúdo                                                    |
| -------------------- | ----------------------------------------------------------- |
| `/`                  | Apresentação, foco, projeto em destaque e posts recentes    |
| `/projetos/careflow` | Arquitetura, princípios e roadmap do CareFlow               |
| `/diario`            | Diário de bordo em MDX, um post por fase                    |
| `/stack`             | Tecnologias, com links para onde aparecem em código público |
| `/sobre`             | Experiência, forma de trabalho e contato                    |

## Qualidade

- Páginas estáticas com Cache Components; posts em MDX compilados no build ([ADR-0004](docs/adr/0004-diario-em-mdx-e-404-real.md)).
- CSP completa sem nonce, HSTS e demais cabeçalhos em todas as rotas ([ADR-0003](docs/adr/0003-csp-sem-nonce.md)).
- Testes de unidade com Vitest (mínimo de 80% de cobertura no CI) e E2E com Playwright em desktop e mobile, incluindo axe (WCAG 2.2 AA) nos temas claro e escuro.
- SEO: metadados e Open Graph por página, imagens Open Graph geradas no build, sitemap, robots e dados estruturados (schema.org).

## Roadmap

- [x] **Fase 0:** padrões do repositório, CI com qualidade e segurança, cabeçalhos de segurança, ADRs
- [x] **Fase 1:** home, sobre, stack, diário de bordo em MDX, SEO, acessibilidade e testes E2E
- [ ] **Fase 6:** Painel de Privacidade e Resiliência integrado ao CareFlow

## Decisões

As decisões arquiteturais estão em [docs/adr](docs/adr).

## Rodando localmente

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE)
