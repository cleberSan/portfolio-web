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

Nenhuma variável é obrigatória. Na Vercel, o site descobre o próprio endereço pelas variáveis de sistema que ela preenche.

| Variável                                       | Uso                                                                                                                                                                          | Sem ela                                                                    |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `SITE_URL`                                     | Origem pública (ex.: `https://exemplo.dev`) para URLs canônicas, sitemap e Open Graph. Precisa ser `https`, exceto em localhost. Tem prioridade sobre a detecção automática. | Usa o domínio de produção da Vercel ou, fora dela, `http://localhost:3000` |
| `VERCEL_ENV` e `VERCEL_PROJECT_PRODUCTION_URL` | Preenchidas pela Vercel. Só a produção libera indexação; previews apontam canônicas para produção e bloqueiam rastreamento.                                                  | O `robots.txt` bloqueia indexação                                          |

| `NEXT_PUBLIC_CAREFLOW_DEMO_URL` | Origem `https` do backend da demonstração do CareFlow (ex.: `https://careflow-demo.duckdns.org`). Liga a seção Ao vivo do Painel e é a única origem de fora em `connect-src` na CSP. É lida no build: mudar exige redeploy. | O Painel fica só no replay das gravações |

Nenhuma variável do site é secreta. Não use o prefixo `NEXT_PUBLIC_` para nada sensível: ele vai para o navegador.

## Deploy

O site é publicado na Vercel pela integração com o GitHub ([ADR-0005](docs/adr/0005-hospedagem-na-vercel.md)):

- Merge no `main` publica em produção.
- Cada PR ganha uma URL de preview, fora dos buscadores e aberta só para quem está logado na conta da Vercel.
- Para voltar uma versão, promova a publicação anterior no painel da Vercel.
- Comandos e versão do Node vêm do repositório (`vercel.json` e `engines` no `package.json`), iguais aos do CI.

Configuração inicial, feita uma vez pelo dono do repositório:

1. Em [vercel.com/new](https://vercel.com/new), entre com o GitHub e importe `cleberSan/portfolio-web`. Ao instalar o app da Vercel no GitHub, escolha **Only select repositories** e marque só este repositório.
2. Não altere preset, comandos nem variáveis: o `vercel.json` já define tudo.
3. Clique em **Deploy**.
4. No GitHub, em **Settings → Branches**, proteja o `main` exigindo PR e os checks `Lint, tipos, testes e build`, `Revisão de dependências` e `CodeQL`. A Vercel publica tudo que chega ao `main`, então é essa regra que garante que só código testado vai ao ar.

Domínio próprio é opcional: adicione em **Settings → Domains** na Vercel. O HSTS do site usa `includeSubDomains; preload`, então todo subdomínio desse domínio precisa servir HTTPS.

## Novo post no diário

1. Crie `src/content/diario/<slug>.mdx`, começando em `##` (o título vem da página).
2. Adicione a entrada em `src/content/posts.ts` com título, descrição, data e fase.
3. Rode `npm test`: os testes falham se o arquivo e o registro não baterem.
