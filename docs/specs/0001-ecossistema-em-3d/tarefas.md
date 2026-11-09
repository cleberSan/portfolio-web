# Tarefas 0001: Ecossistema em 3D com assistente de respostas gravadas

Spec: [spec.md](spec.md) · Plano: [plano.md](plano.md)

Em ordem de execução; cada tarefa cabe num commit e deixa o build verde. Teste junto ou antes do código.

- [x] **T01** `three` na lista de revisão manual do Dependabot (o ADR-0009 entrou junto com a decisão dos cards) — arquivos: `.github/workflows/dependabot-auto-merge.yml` — prova: `npm run format:check` — cobre: decisões
- [x] **T02** Regiões e linha do tempo compacta das reproduções, só no servidor — arquivos: `src/content/ecossistema/regioes.ts`, `reproducoes.ts` e testes — prova: `npm test` — cobre: CA-03, CA-06
- [x] **T03** Busca local e respostas gravadas do assistente — arquivos: `src/lib/assistente/buscar.ts`, `src/content/ecossistema/assistente.ts` e testes — prova: `npm test` — cobre: CA-12, CA-13, CA-15, CA-16
- [x] **T04** Rota estática `/ecossistema` com conteúdo completo sem JS, metadados, imagem Open Graph, `staticRoutes`, links na home (PT e EN) e em `/projetos`, tokens do monitor — arquivos: `src/app/(pt)/ecossistema/`, `src/config/site.ts`, `src/components/home/`, `src/app/(pt)/projetos/page.tsx`, `src/app/globals.css` — prova: `npm test`, E2E sem JS — cobre: CA-01, CA-02, CA-03
- [x] **T05** Experiência de cliente sem 3D: modos, seleção de região, cartões, registro, Pausar/Retomar, movimento reduzido e mapa 2D — arquivos: `src/components/ecossistema/experiencia.tsx`, `mapa-2d.tsx`, `registro.tsx`, `src/lib/capacidades.ts` e testes — prova: `npm test`, E2E — cobre: CA-05, CA-06, CA-07, CA-08, CA-09
- [x] **T06** Assistente na tela: sugestões, campo, aviso de privacidade, digitação pausável, `aria-live`, destaque de região — arquivos: `src/components/ecossistema/assistente-ui.tsx` e teste — prova: `npm test`, E2E de rede e armazenamento — cobre: CA-12, CA-13, CA-14, CA-15, CA-17
- [x] **T07** Cena 3D: dependência `three`, geometria do cérebro, sinais, carga sob demanda, suspensão, perda de contexto, regra ESLint — arquivos: `package.json`, `src/components/ecossistema/cena/`, `eslint.config.mjs` e testes — prova: `npm test`, `npm run lint`, E2E animado e com WebGL bloqueado — cobre: CA-04, CA-06, CA-09, CA-10, CA-11
- [x] **T08** Voz só de leitura, opcional — arquivos: `src/lib/voz.ts`, `assistente-ui.tsx` e testes — prova: `npm test` — cobre: CA-18, CA-19
- [ ] **T09** E2E de segurança e acessibilidade: cabeçalhos iguais, mesma origem, teclado com foco visível — arquivos: `e2e/ecossistema.spec.ts`, `e2e/http.spec.ts` — prova: `npm run test:e2e` — cobre: CA-20, acessibilidade
- [ ] **T10** Documentação: rota no README, peso medido do pedaço 3D e das reproduções na descrição do PR, conferência manual com leitor de tela e celular no preview — arquivos: `README.md` — prova: revisão
- [ ] **T11** Fechar: todo critério com teste (`grep -rn "spec 0001 CA-" src/ e2e/`), CI verde, spec com status `implementada`
