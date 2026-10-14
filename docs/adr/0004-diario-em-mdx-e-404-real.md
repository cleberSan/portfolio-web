# ADR-0004: Diário de bordo em MDX e 404 real para posts inexistentes

- Status: aceito
- Data: 2026-10-14

## Contexto

O diário de bordo conta cada fase do CareFlow. Os posts precisam de componentes próprios (links seguros, blocos de código acessíveis), páginas estáticas e metadados de SEO por post. Com Cache Components, `dynamicParams = false` não é suportado, então a rota `/diario/[slug]` aceita qualquer slug na URL.

Medimos o comportamento de um slug inexistente no build de produção:

| Configuração                         | Primeira requisição                                         | Requisições seguintes | Cache em disco                 |
| ------------------------------------ | ----------------------------------------------------------- | --------------------- | ------------------------------ |
| Só `notFound()` na página            | 200 com `noindex` (App Shell enviado antes do `notFound()`) | 404                   | uma entrada por slug inventado |
| `ensureStatic = 'navigation'`        | 404, mas com HTML de erro renderizado no cliente            | 404                   | uma entrada por slug inventado |
| Proxy barrando antes da renderização | 404 com a página de erro do site renderizada no servidor    | 404                   | nenhuma entrada                |

O cache por slug é um vetor de abuso: qualquer pessoa pode gerar URLs infinitas e fazer o servidor renderizar e gravar cada uma.

## Decisão

- **Conteúdo:** cada post é um arquivo `src/content/diario/<slug>.mdx`, compilado por `@next/mdx` no build. Metadados (título, descrição, data, fase, tags) ficam num registro tipado em `src/content/posts.ts`, que é a única fonte da lista de posts. Testes garantem que todo slug do registro tem arquivo MDX, é seguro para URL e tem data válida.
- **Rota:** `generateStaticParams` prerenderiza todos os posts; o import dinâmico do MDX usa o slug vindo do registro, nunca o texto da URL.
- **Componentes:** `src/mdx-components.tsx` aplica estilos e troca todo link pelo `SmartLink`, que só aceita rotas internas, âncoras e `https`.
- **404 real:** `src/proxy.ts` roda apenas em `/diario/:slug` e reescreve slugs fora do registro para a página 404 antes da renderização. O `notFound()` da página continua como defesa em profundidade.
- **Garantia de estático:** a página do post exporta `ensureStatic = 'navigation'`, e o build falha se ela passar a depender de dados da requisição.

## Alternativas

- **CMS headless:** útil com vários autores; aqui adicionaria um serviço externo, credenciais e uma dependência de rede no build sem ganho real.
- **Metadados em frontmatter:** exigiria plugins remark extras e parsing no build; o registro em TypeScript é tipado e testável sem dependências.
- **Aceitar o 200 com `noindex`:** é o comportamento documentado do Next.js e resolve SEO, mas mantém o status errado para monitoração e o cache aberto a abuso.

## Consequências

- Publicar um post exige dois passos no mesmo PR: o arquivo MDX e a entrada no registro. Os testes de unidade falham se um faltar.
- O proxy executa em toda visita a um post. O custo é uma busca em memória numa lista pequena.
- Se o roadmap trouxer muitos posts ou autores externos, o registro pode ser gerado a partir dos arquivos e este ADR será revisto.
