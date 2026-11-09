import type { Metadata } from "next";
import Link from "next/link";
import { fundoDaRegiao } from "@/components/ecossistema/cores";
import { Experiencia } from "@/components/ecossistema/experiencia";
import { caminhoDoEvento, detalheDoEvento } from "@/components/ecossistema/linha-do-tempo";
import { ExternalLink } from "@/components/external-link";
import { PageHeader } from "@/components/page-header";
import { SmartLink } from "@/components/smart-link";
import { TagList } from "@/components/tag-list";
import {
  buildRespostas,
  nomeDoAssistente,
  saudacao,
  sugestoes,
} from "@/content/ecossistema/assistente";
import { regioes } from "@/content/ecossistema/regioes";
import { buildReproducoes, resumoDaGravacao } from "@/content/ecossistema/reproducoes";
import { pageMetadata } from "@/lib/metadata";

/**
 * Página /ecossistema (spec 0001). O HTML do servidor já é a página inteira em texto: regiões,
 * reproduções e as respostas do assistente. A experiência com o mapa entra por cima, no cliente.
 */

const description =
  "Os projetos, os agentes que trabalham neles e a base que guarda as decisões, num mapa só. As execuções do CareFlow são reproduzidas a partir de uma gravação do CI, e o Sinapse responde com textos escritos antes, sempre com fonte.";

export const metadata: Metadata = pageMetadata({
  title: "Ecossistema",
  description,
  path: "/ecossistema",
  ownImage: true,
});

const fluxoDaFase = "https://github.com/cleberSan/claude-works/blob/main/agents/fluxo-fase.md";

const linkClass = "underline underline-offset-4 hover:text-foreground";

export default function EcossistemaPage() {
  const gravacao = resumoDaGravacao();
  const reproducoes = buildReproducoes();
  const respostas = buildRespostas({ gravacao });

  return (
    <div className="max-w-5xl space-y-16 [&_section>p]:max-w-3xl">
      <PageHeader title="Ecossistema" eyebrow="Mapa dos projetos">
        <p>{description}</p>
      </PageHeader>

      <div
        role="note"
        className="border-accent bg-surface space-y-2 rounded-md border-l-4 px-4 py-3 text-sm leading-relaxed"
      >
        <p>
          As reproduções do CareFlow vêm da gravação do CI de {gravacao.data}, no commit{" "}
          {gravacao.href ? (
            <ExternalLink href={gravacao.href} className={`font-mono ${linkClass}`}>
              {gravacao.commit}
            </ExternalLink>
          ) : (
            <span className="font-mono">{gravacao.commit}</span>
          )}
          , na ordem e na proporção de tempo originais, só que mais devagar. A fase com agentes
          segue o roteiro documentado em{" "}
          <ExternalLink href={fluxoDaFase} className={`font-mono ${linkClass}`}>
            agents/fluxo-fase.md
          </ExternalLink>
          . Todos os dados são sintéticos.
        </p>
      </div>

      <Experiencia
        regioes={regioes}
        reproducoes={reproducoes}
        respostas={respostas}
        sugestoes={sugestoes}
      />

      <section aria-labelledby="regioes" className="space-y-6">
        <h2 id="regioes" className="text-2xl font-semibold tracking-tight">
          As cinco regiões
        </h2>
        <ul className="grid gap-4 md:grid-cols-2">
          {regioes.map((regiao) => (
            <li key={regiao.id} id={`regiao-${regiao.id}`}>
              <article
                aria-labelledby={`regiao-${regiao.id}-nome`}
                className="border-border bg-surface flex h-full flex-col gap-3 rounded-xl border p-5"
              >
                <p className="text-muted flex items-center gap-2 font-mono text-xs">
                  <span
                    aria-hidden="true"
                    className={`ring-foreground/25 size-2.5 shrink-0 rounded-full ring-1 ${fundoDaRegiao[regiao.id]}`}
                  />
                  {regiao.papel}
                </p>
                <h3
                  id={`regiao-${regiao.id}-nome`}
                  className="text-xl font-semibold tracking-tight"
                >
                  {regiao.nome}
                </h3>
                <p className="text-muted leading-relaxed">{regiao.resumo}</p>
                <p className="font-mono text-sm">{regiao.estado}</p>
                <TagList tags={regiao.stack} label={`Ferramentas de ${regiao.nome}`} />
                <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm">
                  {regiao.links.map((link) => (
                    <li key={link.href}>
                      <SmartLink href={link.href} className={linkClass}>
                        {link.rotulo}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reproducoes" className="space-y-6">
        <h2 id="reproducoes" className="text-2xl font-semibold tracking-tight">
          Reproduções
        </h2>
        <p className="text-muted leading-relaxed">
          Cada reprodução acende, no mapa, o caminho de uma execução: quem chamou quem, em que ordem
          e quanto tempo levou. Sem JavaScript, o registro de cada uma fica aqui.
        </p>
        <ul className="space-y-4">
          {reproducoes.map((reproducao) => (
            <li key={reproducao.id}>
              <article
                aria-labelledby={`reproducao-${reproducao.id}`}
                className="border-border space-y-2 rounded-xl border p-5"
              >
                <h3 id={`reproducao-${reproducao.id}`} className="text-lg font-semibold">
                  {reproducao.nome}
                </h3>
                <p className="text-muted leading-relaxed">{reproducao.descricao}</p>
                <p className="text-muted font-mono text-xs">
                  Origem:{" "}
                  {reproducao.fonte.href ? (
                    <ExternalLink href={reproducao.fonte.href} className={linkClass}>
                      {reproducao.fonte.rotulo}
                    </ExternalLink>
                  ) : (
                    reproducao.fonte.rotulo
                  )}
                </p>
                <details>
                  <summary className="text-accent cursor-pointer text-sm font-medium">
                    {reproducao.fonte.tipo === "gravacao"
                      ? `Os ${reproducao.eventos.length} passos gravados`
                      : `Os ${reproducao.eventos.length} passos do roteiro`}
                  </summary>
                  <ol className="mt-3 space-y-1.5 font-mono text-xs">
                    {reproducao.eventos.map((evento, index) => (
                      <li key={index} className="grid gap-x-3 sm:grid-cols-[7rem_1fr]">
                        <span className="text-muted">{evento.marca}</span>
                        <span className="break-words">
                          {caminhoDoEvento(evento)}: {detalheDoEvento(evento)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </details>
              </article>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sinapse" className="space-y-6">
        <h2 id="sinapse" className="text-2xl font-semibold tracking-tight">
          Pergunte ao {nomeDoAssistente}
        </h2>
        <p className="text-muted leading-relaxed">{saudacao}</p>
        <p className="text-muted text-sm leading-relaxed">
          As respostas foram escritas antes e revisadas como qualquer conteúdo do site; nenhuma é
          gerada na hora. Sem JavaScript, todas ficam nesta lista.
        </p>
        <div className="divide-border border-border divide-y rounded-xl border">
          {respostas.map((resposta) => (
            <details key={resposta.id} id={`pergunta-${resposta.id}`} className="px-5 py-4">
              <summary className="cursor-pointer font-medium">{resposta.pergunta}</summary>
              <div className="mt-3 space-y-2">
                <p className="text-muted leading-relaxed">{resposta.texto}</p>
                <p className="text-sm">
                  <span className="text-muted">Fontes: </span>
                  {resposta.fontes.map((fonte, index) => (
                    <span key={`${index}-${fonte.href}`}>
                      {index > 0 ? " · " : null}
                      <SmartLink href={fonte.href} className={linkClass}>
                        {fonte.rotulo}
                      </SmartLink>
                    </span>
                  ))}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      <p className="text-muted text-sm">
        Quer o detalhe de uma execução, span por span? O{" "}
        <Link href="/projetos/careflow/painel" className={linkClass}>
          Painel do CareFlow
        </Link>{" "}
        mostra a mesma gravação em profundidade.
      </p>
    </div>
  );
}
