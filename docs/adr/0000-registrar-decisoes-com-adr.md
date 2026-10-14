# ADR-0000: Registrar decisões arquiteturais com ADRs

- Status: aceito
- Data: 2026-10-14

## Contexto

Este site é a vitrine do portfólio e é construído em etapas públicas. Quem visita o repositório deve entender por que cada escolha foi feita.

## Decisão

Decisões com impacto em arquitetura, segurança, desempenho ou operação são registradas em `docs/adr/` como `NNNN-titulo-em-kebab-case.md`, com Contexto, Decisão, Alternativas e Consequências. ADRs aceitos não são editados; mudanças de rumo geram um novo ADR.

## Consequências

- Decisões são revisadas no mesmo PR do código.
- O mesmo formato é usado no repositório [careflow](https://github.com/cleberSan/careflow).
