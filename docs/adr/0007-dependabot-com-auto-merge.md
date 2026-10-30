# ADR-0007: Dependabot com auto-merge só para atualização de baixo risco

- Status: aceito
- Data: 2026-10-30

## Contexto

O Dependabot abre PRs semanais de atualização de dependências (ADR-0001). A `main` exige PR e os checks obrigatórios, mas não exige aprovação: cada PR do Dependabot ficava parado até alguém clicar em mesclar. Em 30/10 eram sete abertos, quatro deles verdes havia dias.

O Cleber pediu que o bot não precise dele a cada atualização, com critério para o site não sair do ar.

## Decisão

O workflow `dependabot-auto-merge.yml` decide em cada PR do Dependabot e, se a atualização for de baixo risco, liga o auto-merge do GitHub. Quem mescla é o GitHub, e só depois de todos os checks obrigatórios passarem: lint, tipos, testes com cobertura, build, E2E com axe e cabeçalhos, `npm audit` de produção, revisão de dependências e CodeQL.

| Atualização                                                   | Destino                                                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Patch ou minor de pacote npm                                  | auto-merge                                                                                 |
| Patch de Next, React ou Tailwind                              | auto-merge                                                                                 |
| Minor de Next, React ou Tailwind (`FRAMEWORK` no workflow)    | revisão manual: muda o que o site renderiza e os testes não comparam visual                |
| Major de qualquer pacote                                      | revisão manual                                                                             |
| Actions oficiais (`actions/*`, `github/*`), qualquer versão   | auto-merge: o próprio PR roda os workflows com a versão nova, e nada disso vai para o site |
| Action de terceiros, ou o próprio `dependabot/fetch-metadata` | revisão manual                                                                             |
| PR que avisa troca de mantenedores do pacote                  | revisão manual: sinal clássico de conta sequestrada                                        |
| Commit de outra pessoa no branch, ou commit sem assinatura    | revisão manual, e o auto-merge é desligado                                                 |
| Metadados ilegíveis ou tipo de atualização desconhecido       | revisão manual                                                                             |

Correções de segurança seguem a mesma tabela, pelo tipo de versão.

Para o merge automático ser raro e previsível:

- **Cooldown de 7 dias:** versão nova só vira PR depois de uma semana publicada. Pacotes comprometidos no npm costumam sair do ar em horas ou dias. Correção de segurança não espera.
- **Um PR por semana:** minor e patch de tudo vão num grupo só, na segunda às 5h. Com a `main` exigindo branch atualizado, dois PRs automáticos ao mesmo tempo deixariam o segundo parado, porque o Dependabot só faz rebase quando há conflito ou na próxima rodada. Actions ficam para quarta.
- **Majors que precisam casar versão num PR só:** Next com React e `eslint-config-next`, Vitest com os plugins dele.
- **`@types/node` sem major:** os tipos acompanham o Node 22 do `.nvmrc`.

O workflow não faz checkout nem roda código do PR, tem `permissions: {}` no topo e escrita só no job que decide. O `fetch-metadata` fica fixado por SHA. Cada execução deixa a decisão e o motivo no resumo do job.

## Ajustes que só o dono do repositório faz

1. **Settings → General → Pull Requests → Allow auto-merge:** ligar. Sem isso o passo "Ligar o auto-merge" falha com aviso.
2. **Opcional, recomendado:** incluir o status `Vercel` nos checks obrigatórios do ruleset da `main`, para a prévia da Vercel também precisar passar. O CI já faz o mesmo `next build`, então o ganho é pegar diferença de ambiente da Vercel.

## Como desfazer

- **Site com problema depois de um merge automático:** promover a publicação anterior no painel da Vercel, sem novo build (ADR-0005). Depois, `git revert` do commit (é squash, um commit por atualização) num PR.
- **Pausar a automação:** desligar "Allow auto-merge" ou desativar o workflow em Actions. Os PRs voltam a esperar merge manual.
- **PR parado como desatualizado:** comentar `@dependabot rebase`.

## Alternativas

- **Mesclar tudo que passar no CI:** mais simples, mas major e minor de framework são onde mora a quebra de comportamento que o CI não vê.
- **Exigir aprovação e aprovar com bot:** a aprovação de um bot não acrescenta revisão humana; só daria a sensação de controle.
- **Renovate:** tem auto-merge nativo e mais opções, mas é mais uma ferramenta e mais um app com acesso ao repositório para o mesmo resultado.
- **Token de um GitHub App em vez do `GITHUB_TOKEN`:** faria o merge disparar os workflows de `push` na `main` (ver Consequências), ao custo de uma chave privada com escrita guardada nos secrets. Não compensa aqui.

## Consequências

- Patch e minor comuns entram sozinhos, com os mesmos portões de qualquer PR. Ficam com o Cleber: majors, minors de framework e qualquer sinal estranho.
- O merge feito com o `GITHUB_TOKEN` não dispara workflows de `push`: CI e CodeQL não rodam de novo na `main` depois de um merge automático. O deploy não muda, porque quem publica é a integração da Vercel. Como a `main` exige branch atualizado, o código mesclado é o mesmo que passou nos checks do PR, e o CodeQL semanal cobre a `main`.
- Cada merge automático é um deploy de produção. O agrupamento semanal limita isso a cerca de um por semana.
- Risco que fica: uma versão maliciosa que passe da semana de cooldown e de todos os checks. Os portões reduzem esse risco, mas não zeram.
