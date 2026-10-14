# Como contribuir

1. Crie uma branch a partir de `main` (`feat/...`, `fix/...`, `chore/...`, `docs/...`).
2. Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/).
3. Abra um PR com o template; o CI precisa estar verde.
4. Decisões arquiteturais entram como ADR em `docs/adr/`.

## Rodando localmente

Pré-requisito: Node.js 22 (ver `.nvmrc`).

```bash
npm ci
npm run dev            # http://localhost:3000
npm run format:check
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```
