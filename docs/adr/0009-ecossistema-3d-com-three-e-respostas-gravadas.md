# ADR-0009: Ecossistema em 3D com three.js e assistente de respostas gravadas

- Status: aceito
- Data: 2026-11-09
- Spec: [0001, ecossistema em 3D](../specs/0001-ecossistema-em-3d/spec.md)

## Contexto

A página `/ecossistema` mostra os projetos como um mapa 3D em forma de cérebro, com sinais que reproduzem execuções gravadas pelo CI do CareFlow, e um assistente que conversa sobre os projetos. Três escolhas mudavam custo, dependências, cabeçalhos e privacidade: como o assistente responde, qual biblioteca desenha a cena e até onde vai a voz. O Cleber decidiu as três em 2026-11-09, nos cards da thread da spec.

Restrições vigentes: custo zero na Vercel Hobby (ADR-0005), CSP sem nonce com tudo da própria origem (ADR-0003), página só em português (ADR-0006), Dependabot com minor de framework em revisão manual (ADR-0007).

## Decisão

- **Assistente de respostas gravadas.** As respostas são escritas antes, revisadas no PR e trazem fonte; a busca é local, no navegador. O texto que o visitante digita não sai do navegador nem fica guardado, e nenhum modelo de linguagem fala pelo Cleber em público.
- **three.js (MIT) só na rota.** Importado sob demanda pelo componente de cliente da página, depois do conteúdo e só com WebGL e movimento permitido; o resto do site não baixa a biblioteca (regra do ESLint e teste E2E). A cena fica numa "tela de monitor" escura nos dois temas, porque brilho aditivo some em fundo claro. `three` entra no grupo de revisão manual do Dependabot, porque minor do three costuma mudar API.
- **Voz só de leitura.** `speechSynthesis` do navegador, desligada no início, lendo só as respostas gravadas e preferindo vozes locais do sistema. Sem microfone: o Permissions-Policy continua com `microphone=()`.
- Nenhuma mudança de CSP, cabeçalho ou variável `NEXT_PUBLIC_*`. Sem WebGL, com movimento reduzido ou sem JavaScript, a mesma informação aparece em 2D e em texto.

## Alternativas

- **Claude ao vivo por rota do servidor:** exigiria chave em variável da Vercel, limite de gasto, controle de abuso com armazenamento externo e deixaria um modelo responder sobre o Cleber em público, com risco de erro e de texto fora das regras do site.
- **WebGL escrito à mão:** uns 15 KB sem dependência, mas todo o código de renderização seria nosso para manter e testar.
- **React Three Fiber com drei:** mais dependências e peso; a versão 9.8 declara React abaixo de 19.4 como peer e prenderia o React do site.
- **Microfone (reconhecimento de voz):** mudaria o Permissions-Policy; no Chrome o áudio do visitante vai para um serviço do Google, e o Firefox não suporta.

## Consequências

- O pedaço 3D custa cerca de 133 KB comprimidos (medido com three 0.187.0), pagos só por quem abre `/ecossistema`.
- Respostas novas ou corrigidas entram por PR, como o resto do conteúdo; números vêm dos arquivos de conteúdo para não desatualizar.
- Atualizar o three é manual e precisa de conferência visual no preview.
- Se um dia o assistente ao vivo fizer sentido, ele pede spec e ADR próprios, com custo e abuso tratados.
