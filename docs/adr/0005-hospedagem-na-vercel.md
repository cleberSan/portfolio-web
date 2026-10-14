# ADR-0005: Hospedagem na Vercel pela integração com o GitHub

- Status: aceito
- Data: 2026-10-14

## Contexto

O site precisa ir ao ar com o mesmo comportamento validado no CI: páginas estáticas com Cache Components, o proxy que devolve 404 real para posts inexistentes ([ADR-0004](0004-diario-em-mdx-e-404-real.md)), imagens Open Graph geradas no build e os cabeçalhos de segurança de `next.config.ts` ([ADR-0002](0002-cabecalhos-de-seguranca.md) e [ADR-0003](0003-csp-sem-nonce.md)).

Requisitos:

- Nenhum segredo de deploy guardado no GitHub.
- Só código que passou no CI chega à produção, e voltar uma versão leva segundos.
- Cada PR pode ser conferido numa URL própria, sem aparecer nos buscadores.
- Custo zero enquanto o site for vitrine pessoal.

A escolha entre Azure e AWS para o CareFlow só acontece na fase 9 e não deve travar a publicação do site.

## Decisão

Hospedar na Vercel, conectada ao repositório pelo app oficial dela no GitHub.

- **Sem token no GitHub:** a Vercel lê o repositório pelo próprio app, instalado com acesso só a este repositório. Não há `VERCEL_TOKEN` em secrets nem workflow de deploy para manter.
- **Produção e previews:** merge no `main` publica em produção; cada PR ganha um preview. A proteção padrão da Vercel exige login na conta para abrir previews.
- **Endereço público sem configuração:** `src/config/site-url.ts` usa `SITE_URL` quando definida e, sem ela, o domínio de produção que a Vercel informa em `VERCEL_PROJECT_PRODUCTION_URL`. Só builds com `VERCEL_ENV=production` liberam indexação; previews apontam canônicas para a produção e o `robots.txt` pede para não rastrear. Fora da Vercel, sem `SITE_URL`, o site continua bloqueando indexação.
- **Build reproduzível:** `vercel.json` fixa `npm ci`, que instala exatamente o `package-lock.json` e falha se ele estiver fora de sincronia, e `npm run build`, os mesmos comandos do CI. O `engines` do `package.json` fixa o Node em `22.x`, a versão do `.nvmrc` usada no CI; sem isso a Vercel usaria a versão padrão dela, hoje a 24.
- **Portão de qualidade:** a Vercel publica tudo que chega ao `main`, então o `main` fica protegido no GitHub exigindo PR e os checks de CI, revisão de dependências e CodeQL. Essa regra é configurada pelo dono do repositório.
- **Rollback:** promover a publicação anterior no painel da Vercel, sem novo build.

## Alternativas

- **Azure Static Web Apps ou AWS Amplify:** alinhariam o site à nuvem do CareFlow, mas a escolha da nuvem ainda está aberta e o suporte a proxy e Cache Components do Next.js 16 passa por adaptadores próprios dessas plataformas, que precisariam ser validados.
- **Contêiner próprio (`next start` atrás de um CDN):** controle total e portável, mas exige servidor, TLS, CDN, atualizações e monitoração para um site estático em quase tudo.
- **Export estático (`output: 'export'`):** hospedagem em qualquer CDN, mas o export ignora os cabeçalhos de `next.config.ts` e não roda o proxy; a CSP, o HSTS e os demais cabeçalhos teriam de ser recriados na configuração de cada CDN.
- **Deploy por GitHub Actions com a CLI da Vercel:** daria o deploy só depois do CI verde no próprio workflow, ao custo de guardar um token com acesso à conta. A proteção do `main` dá a mesma garantia sem segredo.

## Consequências

- O acoplamento com a Vercel fica na hospedagem: não há SDK, banco, analytics nem função específica dela no código. Migrar exige trocar o provedor e definir `SITE_URL`.
- O plano gratuito (Hobby) é para uso pessoal e não comercial. Pelas regras de uso justo da Vercel, anunciar a venda de um serviço já conta como uso comercial. Se o site passar a oferecer serviços pagos, o projeto vai para o plano Pro ou para outra hospedagem, e este ADR será revisto.
- A barra de ferramentas da Vercel injetada nos previews carrega scripts de outra origem, que a CSP bloqueia. Isso só gera erros no console dos previews; a produção não é afetada.
- Revisar esta decisão na fase 9, quando a nuvem do CareFlow for escolhida, ou se o site precisar de dados ou funções que pesem nos limites do plano.
