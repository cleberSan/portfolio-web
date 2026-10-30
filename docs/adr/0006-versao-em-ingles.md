# ADR-0006: Versão em inglês com um layout raiz por idioma

- Status: aceito
- Data: 2026-10-27

## Contexto

O Cleber pediu a opção de ver o site em inglês. Na primeira versão, escolhida por ele, entram em inglês as páginas principais: a home e o Sobre. Projetos, diário e Painel continuam só em português.

Requisitos:

- As URLs atuais em português não mudam: já estão em posts do LinkedIn e no índice dos buscadores.
- O `<html lang>` de cada página diz o idioma dela (WCAG 3.1.1), e trechos no outro idioma levam `lang` (WCAG 3.1.2).
- O seletor de idioma funciona sem JavaScript e sem script inline, porque a CSP não tem nonce ([ADR-0003](0003-csp-sem-nonce.md)).
- As páginas continuam estáticas, sem custo de função por requisição.
- O inglês não pode ficar para trás quando o português muda: falta de tradução tem que quebrar o build ou os testes.

## Decisão

- **Rotas:** o português continua na raiz (`/`, `/sobre`) e o inglês fica abaixo de `/en` (`/en`, `/en/about`). O mapa entre as duas está em `src/i18n/routes.ts`.
- **Um layout raiz por idioma:** as rotas em português foram para o grupo `app/(pt)`, sem mudar URL, com `<html lang="pt-BR">`; `app/en` tem o próprio layout raiz com `<html lang="en">`. Os dois usam o mesmo `RootDocument` (fontes, cabeçalho, rodapé).
- **404:** com dois layouts raiz não existe um layout único para a página 404 de URL sem rota. Ela vem de `app/global-not-found.tsx`, ligado pela opção experimental `globalNotFound` do Next.js 16. O `notFound()` das páginas continua no `not-found.tsx` do grupo.
- **Seletor:** `PT-BR | EN` no cabeçalho, feito só de links com `hrefLang` e `lang`. Leva à mesma página no outro idioma; quando ela só existe em português, o EN leva à home em inglês. Não há redirecionamento por `Accept-Language`: quem escolhe o idioma é a pessoa.
- **SEO:** cada página traduzida declara as alternativas com `hreflang` (e `x-default` no português), `og:locale` do idioma, e o sitemap lista as duas versões com as alternativas.
- **Textos:** os componentes recebem o idioma por propriedade. Rótulos de interface ficam em `src/i18n/dictionaries.ts`; textos das páginas em `src/components/home` e `src/components/about`; o conteúdo traduzido em arquivos `*.en.ts` ao lado do original em `src/content`. As traduções são indexadas pelo id ou nome do original (empresa, case, grupo, portão do CI), então um item novo sem tradução não compila; o que não dá para tipar, um teste confere.
- **Imagem Open Graph padrão:** sai de Route Handlers com URL fixa (`/opengraph-image` e `/en/opengraph-image`). Dentro de um grupo de rotas o Next acrescenta um hash ao caminho do arquivo `opengraph-image.tsx`, e o `pageMetadata` precisa repetir essa URL nas páginas sem imagem própria.
- **Links para páginas em português:** a partir do inglês, levam `hrefLang="pt-BR"` e avisam "(in Portuguese)" no texto. Os posts do diário mostrados na home em inglês ficam num bloco com `lang="pt-BR"`.

## Alternativas

- **Segmento dinâmico `app/[lang]` com `proxy` reescrevendo `/` para `/pt`:** é o caminho do guia de internacionalização do Next.js e daria o idioma por `next/root-params`, mas exige reescrita em toda requisição, duplica cada rota em `/pt/...` e também precisa do `globalNotFound` para a 404.
- **Um layout raiz só, com `lang="en"` num `div` das páginas em inglês:** sem opção experimental, mas o `<html lang>` e o `<title>` ficariam em português nas páginas em inglês, o que fere a WCAG 3.1.1.
- **Biblioteca de i18n (next-intl e similares):** resolve mensagens, plurais e roteamento, mas é uma dependência a mais para duas páginas e um seletor. Pode ser revista se o site inteiro passar a ter dois idiomas.
- **Tradução automática no navegador:** sem custo de manutenção, mas sem controle do texto nem da terminologia técnica, e sem URL própria para compartilhar.

## Consequências

- Toda mudança de texto na home ou no Sobre precisa da versão em inglês no mesmo PR. O TypeScript e os testes apontam o que faltar.
- O `globalNotFound` é experimental. Se ele mudar numa atualização do Next.js, os testes E2E de 404 quebram no PR da atualização, e a alternativa é voltar a um layout raiz único.
- Navegar entre as duas versões recarrega a página inteira, porque os layouts raiz são diferentes. Para trocar de idioma isso é aceitável.
- Estender o inglês a projetos, diário ou Painel é acrescentar rotas em `app/en`, os pares em `src/i18n/routes.ts` e os textos; a estrutura não muda.
