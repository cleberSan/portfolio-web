# Specs

Especificações das mudanças do site (Spec-Driven Development): o que cada mudança deve fazer e por quê, escrito e revisado antes do código ([ADR-0008](../adr/0008-especificar-antes-de-implementar.md)). Decisões de arquitetura continuam em [docs/adr](../adr); a spec cita as que a restringem.

## Quando

| Nível    | Quando                                                                                                                                                                            | Artefatos                                                                    |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Direto   | Post do diário, texto do perfil vindo do LinkedIn, atualização de dependência, documentação, refatoração sem mudança visível, bug com causa clara (o teste de regressão é a spec) | Só o PR                                                                      |
| Leve     | Seção, componente ou comportamento novo numa página existente, sem nenhum gatilho do completo                                                                                     | `spec.md` com plano e tarefas curtos                                         |
| Completo | Qualquer gatilho abaixo                                                                                                                                                           | `spec.md`, `plano.md`, `tarefas.md`; código só depois de a spec ser aprovada |

Gatilhos do nível completo neste repositório:

- página ou rota nova, redirecionamento ou mudança de URL pública;
- CSP, cabeçalhos de segurança ou variável `NEXT_PUBLIC_*`;
- dado pessoal exibido ou coletado (contato, formulário, analytics);
- idioma novo ou página traduzida nova (ADR-0006);
- Painel do CareFlow ou qualquer mudança feita junto com o careflow (a spec mora lá e este PR linka);
- dependência, serviço externo, custo ou licença novos.

## Como

1. Pasta `NNNN-titulo-em-kebab-case/` com o próximo número livre, nunca reaproveitado.
2. `spec.md`: problema, fora de escopo, critérios de aceite `CA-NN` em EARS (`QUANDO ..., ... DEVE ...`), requisitos não funcionais (acessibilidade WCAG 2.2 AA, performance, CSP) e perguntas abertas.
3. `plano.md` e `tarefas.md` no nível completo: rotas e componentes, conteúdo, segurança, teste por critério (Vitest ou Playwright com axe), riscos e rollback.
4. Cada teste que prova um critério leva o comentário `// spec NNNN CA-NN` logo acima do `it(...)` ou `test(...)`. Conferência: `grep -rn "spec NNNN CA-" src/ e2e/`.
5. O PR linka a spec e mostra a tabela critério → teste. Ao concluir, o status vira `implementada`; depois disso a spec não é reescrita, e comportamento novo ganha spec nova.

Specs são públicas: nada de segredo, e-mail ou endereço. Modelos e processo completo: [claude-works](https://github.com/cleberSan/claude-works/blob/main/memorias/spec-driven-development.md).
