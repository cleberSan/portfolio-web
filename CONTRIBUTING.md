# Como contribuir

1. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `chore/...`, `docs/...`).
2. Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/).
3. Abra um PR com o template; o CI precisa estar verde.
4. Decisões arquiteturais entram como ADR em `docs/adr/`.

## Rodando localmente

Pré-requisito: Node.js 22 (ver `.nvmrc`).

```bash
npm ci
npm run dev            # http://localhost:3000
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e       # sobe o build de produção e roda Playwright + axe
```

Antes do primeiro `test:e2e`, instale o navegador com `npx playwright install chromium`. Se a máquina já tiver um Chromium compatível, aponte para ele com `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Variáveis de ambiente

| Variável   | Uso                                                                                                                                           | Padrão                                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `SITE_URL` | Origem pública do site (ex.: `https://exemplo.dev`), usada em URLs canônicas, sitemap e Open Graph. Precisa ser `https`, exceto em localhost. | `http://localhost:3000`, e o `robots.txt` bloqueia indexação |

Nenhuma variável do site é secreta. Não use o prefixo `NEXT_PUBLIC_` para nada sensível: ele vai para o navegador.

## Novo post no diário

1. Crie `src/content/diario/<slug>.mdx`, começando em `##` (o título vem da página).
2. Adicione a entrada em `src/content/posts.ts` com título, descrição, data e fase.
3. Rode `npm test`: os testes falham se o arquivo e o registro não baterem.
