# ADR-0008: Especificar antes de implementar (Spec-Driven Development)

- Status: proposto
- Data: 2026-11-04

## Contexto

O site muda por PRs pequenos e frequentes: páginas, seções, versão em inglês, Painel do CareFlow, posts do diário. As decisões de arquitetura estão nos ADRs, mas o comportamento esperado de cada mudança (o que a página deve mostrar, para quem, o que fica de fora) aparecia só nos testes e na descrição do PR, e a revisão acontecia com o código pronto.

Em 2026-11-04 Cleber decidiu adotar Spec-Driven Development em todos os repositórios do ecossistema. O processo comum e as ferramentas avaliadas (GitHub Spec Kit, OpenSpec, Kiro) estão no [ADR-0002 da base claude-works](https://github.com/cleberSan/claude-works/blob/main/docs/adr/0002-spec-driven-development.md).

## Decisão

- **Specs em `docs/specs/NNNN-titulo/`**, ao lado dos ADRs: `spec.md` (o quê e por quê), `plano.md` (como) e `tarefas.md` (em que ordem), conforme [docs/specs/README.md](../specs/README.md).
- **Nível completo, com a spec aprovada por Cleber antes do código,** quando a mudança cria página, rota ou redirecionamento; mexe em CSP, cabeçalhos ou `NEXT_PUBLIC_*`; exibe ou coleta dado pessoal; acrescenta idioma ou página traduzida; envolve o Painel ou o careflow (a spec mora no careflow); ou traz dependência, serviço, custo ou licença novos.
- **Nível leve** (só `spec.md`) para seção, componente ou comportamento novo numa página existente; **direto** (só o PR) para post do diário, texto do perfil vindo do LinkedIn, atualização de dependência (ADR-0007), documentação, refatoração e bug com causa clara.
- **Critérios de aceite `CA-NN`** em EARS, com acessibilidade (WCAG 2.2 AA nos dois temas) como requisito não funcional de toda tela; o teste Vitest ou Playwright que prova cada critério leva o comentário `// spec NNNN CA-NN`.
- **Spec por mudança:** depois de `implementada`, só o status muda; comportamento novo ganha spec nova.
- **Template de PR** com a linha "Spec" e os itens de critério coberto.
- Nenhuma ferramenta nem dependência nova: os modelos vêm da base claude-works.

## Alternativas

- **Continuar só com ADR e descrição do PR:** o comportamento só é revisado depois do código e o requisito não fica no repositório.
- **GitHub Spec Kit no repositório:** licença MIT, mas traz um CLI em Python e arquivos próprios para manter (ADR-0002 da base).
- **Spec para todo PR:** post do diário e atualização de dependência teriam spec maior que a mudança.

## Consequências

- Mudanças maiores no site chegam ao PR com o comportamento já combinado; a revisão confere critério sem teste e código fora da spec.
- Custo de escrita a cada mudança com spec; o nível direto continua igual.
- Specs são públicas: nada de segredo, e-mail ou endereço.
- Este ADR reabre junto com o ADR-0002 da base.
