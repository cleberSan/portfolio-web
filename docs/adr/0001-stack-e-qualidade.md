# ADR-0001: Stack e portões de qualidade

- Status: aceito
- Data: 2026-10-14

## Contexto

O site precisa ser rápido, bem indexado, acessível e seguro, e servir de exemplo do mesmo rigor aplicado ao backend.

## Decisão

- **Framework:** Next.js 16 (App Router) com TypeScript estrito e Tailwind CSS 4. Páginas estáticas por padrão; renderização dinâmica só onde houver dado em tempo real (Painel do CareFlow, fase 6).
- **Testes:** Vitest + Testing Library no padrão AAA, cobertura mínima de 80% (linhas, branches, funções e statements) aplicada no CI. Testes E2E com Playwright entram na fase 1.
- **Estilo:** Prettier (com ordenação de classes Tailwind) e ESLint com as regras do Next.js.
- **CI:** formatação, lint, checagem de tipos, testes com cobertura e build em todo PR; CodeQL para TypeScript e para os workflows.
- **Dependências:** `npm ci` com lock file, Dependabot semanal, `npm audit` nas dependências de produção e revisão de dependências nos PRs.

## Alternativas

- **Jest:** maduro, mas Vitest é mais rápido e usa a mesma configuração do Vite.
- **Bloquear PR por vulnerabilidade em dependência de desenvolvimento:** hoje `eslint-config-next` depende de uma versão de `braces` com alerta de negação de serviço sem correção disponível. Bloquear todo PR por isso não reduz o risco do site publicado, já que ferramentas de lint não são enviadas ao navegador. A revisão de dependências bloqueia vulnerabilidades em escopo de produção, e o Dependabot avisa quando houver correção.

## Consequências

- Uma vulnerabilidade em ferramenta de desenvolvimento não bloqueia o merge, mas aparece nos alertas do repositório.
- Componentes assíncronos de servidor são testados por E2E, porque o Vitest não os suporta.
