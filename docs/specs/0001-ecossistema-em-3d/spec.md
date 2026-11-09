# Spec 0001: Ecossistema em 3D com assistente de respostas gravadas

- Status: rascunho
- Data: 2026-11-09
- Nível: completo (rota nova, dependência nova, voz no navegador)
- PRs: portfolio-web#38
- Relacionados: [ADR-0001](../../adr/0001-stack-e-qualidade.md) (portões de qualidade), [ADR-0003](../../adr/0003-csp-sem-nonce.md) (CSP sem nonce), [ADR-0006](../../adr/0006-versao-em-ingles.md) (idiomas), [ADR-0007](../../adr/0007-dependabot-com-auto-merge.md) (Dependabot), [ADR-0008](../../adr/0008-especificar-antes-de-implementar.md) (SDD), visual "Sala de controle" (#19), Painel do CareFlow ([ADR-0010 do careflow](https://github.com/cleberSan/careflow/blob/main/docs/adr/0010-observabilidade-e-painel-de-privacidade.md))

## Problema

O site mostra cada projeto numa página separada: estudo de caso, Painel, diário. Quem visita não vê o ecossistema como um sistema só: como CareFlow, Lojinha da Lua, este site e a base claude-works se ligam, o que roda dentro do CareFlow quando um paciente sintético reserva uma consulta e como os agentes do Claude constroem cada fase com o Cleber aprovando. Cleber quer uma experiência mais atrativa e futurista que mostre isso e que permita conversar sobre os projetos, sem abrir mão das regras do site: custo zero, CSP estrita, acessibilidade e nenhum rótulo falso (dizer "ao vivo" sobre algo gravado).

## Objetivo

Uma página `/ecossistema` com um mapa 3D em forma de cérebro em que cada região é um projeto. Sinais percorrem as regiões reproduzindo execuções reais gravadas pelo CI do CareFlow e o fluxo documentado dos agentes. Um assistente com identidade própria, **Sinapse** (nome provisório), responde perguntas sobre os projetos com respostas escritas antes, revisadas no PR e com fonte, e pode lê-las em voz alta. Tudo funciona sem custo, sem servidor novo e sem falar com outra origem; sem WebGL ou com movimento reduzido, a mesma informação aparece em 2D e em texto.

## Fora de escopo

- Chamar o Claude ou outro modelo de linguagem a partir do site: exige chave, limite de gasto, controle de abuso e abre risco de resposta errada sobre o Cleber em público. Fica para uma spec própria, se um dia valer.
- Microfone ou reconhecimento de voz.
- Dados ao vivo de GitHub, Vercel, threads do Claude (privadas) ou do backend da demonstração. O modo ao vivo continua só no Painel.
- Versão em inglês da página (ADR-0006): o link a partir de `/en` leva "(in Portuguese)".
- Assistente pessoal do Cleber para conversar com o Claude por voz no dia a dia: outra conversa, com outro público e outras regras.
- Analytics, cookies ou qualquer armazenamento do que o visitante digita.
- Nome, visual, voz ou bordão de personagem ou franquia existente.
- Mudança no Painel, na gravação do CI ou no repositório careflow.
- Termos ou promessas clínicas: o cérebro é só a metáfora visual.

## Critérios de aceite

### Página e conteúdo

- **CA-01:** QUANDO alguém abre `/ecossistema`, o site DEVE responder com HTML estático que, sem JavaScript, já traz as cinco regiões (CareFlow, Lojinha da Lua, portfolio-web, claude-works e Agentes) com resumo, estado e links, e as perguntas do assistente com as respostas em lista expansível.
- **CA-02:** O site DEVE levar a `/ecossistema` a partir do topo da home (em português e em inglês, este com "(in Portuguese)") e de `/projetos`, e a rota DEVE constar do sitemap.
- **CA-03:** A página DEVE dizer a origem de cada reprodução, "gravação do CI" com data e commit para os traces do CareFlow e "roteiro documentado" com link para o fluxo dos agentes, e NÃO DEVE usar "ao vivo" nem "tempo real" em nenhum texto.

### Cena

- **CA-04:** QUANDO o navegador tem WebGL e não pede movimento reduzido, a página DEVE carregar a cena 3D depois do conteúdo, com as regiões em forma de cérebro girando devagar e sinais percorrendo as regiões.
- **CA-05:** QUANDO o visitante escolhe uma região, na cena ou na lista de regiões (mouse, toque ou teclado), a página DEVE destacar a região na cena e mostrar o cartão dela (o que é, stack, estado e links).
- **CA-06:** QUANDO o visitante escolhe uma reprodução (reserva de consulta, revogação do consentimento, queda do WhatsApp com fallback, triagem com IA ou uma fase com agentes), a cena DEVE disparar os sinais na ordem e na proporção de tempo gravadas, e o registro textual DEVE listar cada sub-rotina com serviço, operação e duração.
- **CA-07:** A página DEVE ter um controle Pausar/Retomar que para e retoma toda animação: rotação, sinais, registro e digitação do assistente.
- **CA-08:** ENQUANTO o sistema pede movimento reduzido, a página NÃO DEVE animar nada sozinha: sem rotação, sem sinais automáticos, reprodução só passo a passo.
- **CA-09:** SE o navegador não tem WebGL, perde o contexto WebGL ou falha ao baixar o código 3D, ENTÃO a página DEVE mostrar o mapa em 2D com as mesmas regiões e manter cartões, registro e assistente funcionando, sem erro no console.
- **CA-10:** ENQUANTO a aba está oculta ou a cena está fora da tela, a página DEVE suspender a renderização.
- **CA-11:** O código 3D (biblioteca e cena) só DEVE ser baixado pela rota `/ecossistema`.

### Assistente

- **CA-12:** QUANDO o visitante escolhe uma pergunta sugerida ou envia uma pergunta digitada, o assistente DEVE mostrar a resposta gravada mais próxima com as fontes e destacar na cena a região de que ela fala.
- **CA-13:** SE nenhuma resposta gravada atende à pergunta, ENTÃO o assistente DEVE dizer que não tem resposta para isso e oferecer perguntas sugeridas, sem compor resposta nova.
- **CA-14:** O assistente DEVE avisar que as respostas foram escritas antes e têm fonte, e que o texto digitado não sai do navegador nem fica guardado; enviar uma pergunta NÃO DEVE gerar requisição de rede nem gravação no armazenamento do navegador.
- **CA-15:** SE a pergunta vem vazia ou só com espaços, ENTÃO o assistente DEVE ignorar o envio; o campo DEVE aceitar no máximo 200 caracteres.
- **CA-16:** Toda resposta gravada DEVE ter ao menos uma fonte, toda fonte DEVE ser rota do site ou endereço `https://github.com/cleberSan/`, e nenhuma resposta DEVE falar em busca de vaga ou disponibilidade, trazer e-mail ou endereço, dizer que o CareFlow usa Clean Architecture ou fazer promessa clínica.
- **CA-17:** QUANDO uma resposta termina de aparecer, a página DEVE anunciá-la uma única vez a leitores de tela, com o texto completo.

### Voz

- **CA-18:** QUANDO o visitante liga a voz e o navegador tem síntese de fala em português, o assistente DEVE ler cada resposta; a voz DEVE começar desligada, parar ao pausar ou desligar e ler só o texto das respostas gravadas, nunca o que o visitante digitou.
- **CA-19:** SE o navegador não tem síntese de fala ou voz em português, ENTÃO o controle de voz NÃO DEVE aparecer.

### Segurança

- **CA-20:** A rota `/ecossistema` DEVE ter os mesmos cabeçalhos de segurança das outras páginas (CSP e Permissions-Policy sem microfone) e NÃO DEVE fazer requisição a outra origem.

## Requisitos não funcionais

- **Segurança e privacidade:** biblioteca 3D servida pela própria origem; nada do visitante sai do navegador; a voz lê só texto público e prefere vozes locais do sistema; nenhuma variável `NEXT_PUBLIC_*` nova.
- **Performance:** o conteúdo em texto é o maior elemento da primeira pintura, não a cena; código 3D em pedaço próprio de no máximo 170 KB comprimido (biblioteca medida em 133 KB); os dados das reproduções chegam ao navegador compactados, no máximo 40 KB serializados, nunca a gravação inteira (488 KB); no máximo 6.000 pontos no computador e 2.500 no celular, densidade de pixels limitada a 2; meta de 60 quadros por segundo no computador e 30 num celular intermediário, medida no preview do PR.
- **Observabilidade:** site estático sem telemetria; falha de WebGL ou da carga do código 3D vira mapa 2D sem erro no console, e os testes E2E falham se aparecer erro de console.
- **Acessibilidade:** WCAG 2.2 AA nos temas claro e escuro, no computador e no celular (axe sem violações); tudo o que a cena mostra também existe em texto; operação completa por teclado com foco visível; nenhum brilho que pisque mais de três vezes por segundo; alvos de toque com pelo menos 24 px.
- **Custo:** zero. Nenhum serviço novo; a página é estática na Vercel Hobby.

## Perguntas abertas

Decididas pelo Cleber em 2026-11-09, nos cards da thread, todas pela opção recomendada; registro no [ADR-0009](../../adr/0009-ecossistema-3d-com-three-e-respostas-gravadas.md).

- Como o assistente responde: **respostas gravadas** e revisadas no PR, com busca local no navegador. Descartados: Claude ao vivo por uma rota do servidor (chave, custo, abuso) e ficar sem assistente.
- Biblioteca da cena 3D: **three.js**, MIT, carregada só nesta rota. Descartados: WebGL escrito à mão e React Three Fiber com drei (aceita só React abaixo de 19.4).
- Voz: **só leitura em voz alta**, opcional e desligada no início, sem microfone. Descartados: microfone (muda o Permissions-Policy e, no Chrome, manda o áudio do visitante ao Google) e ficar sem voz.
- Nome do assistente e da rota: Sinapse e `/ecossistema`, salvo outra preferência do Cleber na revisão.
