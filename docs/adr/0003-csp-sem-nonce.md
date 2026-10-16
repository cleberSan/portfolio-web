# ADR-0003: CSP completa sem nonce

- Status: aceito
- Data: 2026-10-14
- Complementa: [ADR-0002](0002-cabecalhos-de-seguranca.md), que deixou `script-src` e `style-src` pendentes

## Contexto

O Next.js injeta o payload do React Server Components em scripts inline (`self.__next_f.push(...)`) cujo conteúdo muda a cada página e a cada build. Há três formas de permitir esses scripts numa CSP:

1. **Nonce por requisição.** É a opção mais forte contra XSS, mas o nonce só existe na requisição, então toda página passa a ser renderizada sob demanda: acaba o HTML estático servido por CDN.
2. **Hashes.** Exigiriam calcular o hash de cada script inline depois do build e manter a lista em sincronia. O suporte a SRI do Next.js (`experimental.sri`) cobre só os arquivos externos, não os scripts inline.
3. **`'unsafe-inline'` restrito à própria origem.** Mantém as páginas estáticas e continua bloqueando qualquer script, estilo, fonte, imagem ou conexão de outra origem.

O site não tem formulário, login, comentário nem conteúdo de terceiros: todo texto vem do repositório e é compilado no build. A superfície de XSS é o próprio código revisado em PR.

## Decisão

Opção 3, seguindo a configuração "sem nonce" da documentação do Next.js, com endurecimentos extras:

```
default-src 'self';
script-src 'self' 'unsafe-inline';          (+ 'unsafe-eval' só em `next dev`)
script-src-attr 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' blob: data:;
font-src 'self';
connect-src 'self';
frame-src 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none'
```

- `script-src-attr 'none'` bloqueia handlers inline em atributos (`onclick`, `onerror`), um vetor clássico de XSS que o React não usa.
- `connect-src 'self'` e `img-src` sem origens externas impedem exfiltração para outro domínio mesmo se um script for injetado.
- `upgrade-insecure-requests` ficou de fora: todos os recursos são da própria origem e o HSTS já força HTTPS, então a diretiva não acrescenta proteção e quebraria o servidor local em HTTP usado nos testes.
- A política é gerada por `buildContentSecurityPolicy` em `src/config/security-headers.ts`, testada por unidade e conferida nos testes E2E, que falham se o navegador registrar qualquer erro de console (violações de CSP aparecem assim).

## Alternativas

- **Nonce:** reavaliar na fase 6, quando o Painel de Privacidade e Resiliência trouxer dados ao vivo. Rotas dinâmicas poderão receber nonce sem afetar as páginas estáticas.
- **Hashes gerados no pós-build:** frágil e sem suporte oficial para scripts inline.
- **Trusted Types (`require-trusted-types-for 'script'`):** proteção forte contra XSS de DOM, mas depende de compatibilidade do React e do Next.js; fica para avaliação futura.

## Consequências

- As páginas continuam estáticas (`○` no build) e podem ser servidas por CDN.
- Um script injetado na própria página ainda executaria; a proteção contra isso é não haver entrada de usuário e revisar todo conteúdo em PR.
- Qualquer integração de terceiros (analytics, fontes externas, embeds) exige mudar a CSP e, portanto, um novo ADR.

## Atualização (fase 9 do CareFlow)

A seção Ao vivo do Painel chama o backend da demonstração hospedada direto do navegador. `connect-src` passa a aceitar, além de `'self'`, só a origem definida em `NEXT_PUBLIC_CAREFLOW_DEMO_URL` no build (`src/config/demo-backend.ts`, que recusa tudo que não for uma origem `https`). As demais diretivas não mudam. Sem a variável, a CSP continua igual. A decisão da hospedagem está no [ADR-0013 do CareFlow](https://github.com/cleberSan/careflow/blob/main/docs/adr/0013-demonstracao-hospedada-na-oracle.md).
