"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  Regiao,
  RegiaoId,
  Reproducao,
  ReproducaoId,
  RespostaGravada,
} from "@/content/ecossistema/modelo";
import {
  decidirModo,
  observarMenosMovimento,
  pedeMenosMovimento,
  webglDisponivel,
  type Modo,
} from "@/lib/capacidades";
import { AssistenteUi } from "./assistente-ui";
import type { CarregarCena, Cena } from "./cena/tipos";
import { fundoDaRegiao, textoDaRegiao } from "./cores";
import { fimDaReproducao, passosAte } from "./linha-do-tempo";
import { Mapa2D } from "./mapa-2d";
import { LinkDoMonitor } from "./link-do-monitor";
import { Registro } from "./registro";

/** O three só é baixado aqui, por import dinâmico, e só quando o modo é 3D (CA-11). */
const carregarCenaPadrao: CarregarCena = () =>
  import("./cena/cena").then((modulo) => modulo.criarCena);

const semAssinatura = () => () => {};
const noCliente = () => true;
const noServidor = () => false;

/** Falso no servidor e na hidratação, verdadeiro depois: o HTML inicial é sempre o estático. */
function useHidratado(): boolean {
  return useSyncExternalStore(semAssinatura, noCliente, noServidor);
}

function useMenosMovimento(): boolean {
  return useSyncExternalStore(observarMenosMovimento, () => pedeMenosMovimento(), noServidor);
}

function useWebGL(): boolean {
  return useSyncExternalStore(semAssinatura, webglDisponivel, noServidor);
}

/** Pausa entre uma reprodução e a seguinte quando a página toca sozinha. */
const esperaEntreReproducoesMs = 1500;
/** Passos que o mapa 2D mantém acesos, do mais apagado ao atual. */
const passosRecentes = 4;
/** Maior salto do relógio entre dois quadros: a aba volta do fundo sem pular a reprodução. */
const maiorQuadroMs = 100;

const botao =
  "border-monitor-border hover:border-monitor-fg aria-pressed:bg-monitor-fg aria-pressed:text-monitor aria-pressed:border-monitor-fg rounded-md border px-3 py-1.5 text-sm disabled:opacity-60";

function CartaoDaRegiao({ regiao }: { regiao: Regiao }) {
  return (
    <article aria-labelledby="cartao-da-regiao-nome" className="space-y-2">
      <p className="text-monitor-muted font-mono text-xs">{regiao.papel}</p>
      <h3
        id="cartao-da-regiao-nome"
        className={`text-lg font-semibold tracking-tight ${textoDaRegiao[regiao.id]}`}
      >
        {regiao.nome}
      </h3>
      <p className="text-sm leading-relaxed">{regiao.resumo}</p>
      <p className="font-mono text-xs">{regiao.estado}</p>
      <p className="text-monitor-muted font-mono text-xs">{regiao.stack.join(" · ")}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {regiao.links.map((link) => (
          <li key={link.href}>
            <LinkDoMonitor href={link.href}>{link.rotulo}</LinkDoMonitor>
          </li>
        ))}
      </ul>
    </article>
  );
}

type ExperienciaProps = {
  regioes: readonly Regiao[];
  /** Ao menos uma reprodução; a primeira toca ao abrir a página quando o movimento é permitido. */
  reproducoes: readonly Reproducao[];
  /** Respostas gravadas do Sinapse e os ids das que viram perguntas sugeridas. */
  respostas: readonly RespostaGravada[];
  sugestoes: readonly string[];
  /** Carga da cena 3D; os testes trocam por uma cena falsa. */
  carregarCena?: CarregarCena;
};

/**
 * Experiência de /ecossistema no cliente (spec 0001, CA-04 a CA-10): escolhe entre cena 3D e mapa
 * 2D, toca as reproduções no tempo gravado, mantém o registro e respeita pausa e movimento reduzido.
 * Antes do JavaScript, mostra o mapa parado e manda para o texto logo abaixo.
 */
export function Experiencia({
  regioes,
  reproducoes,
  respostas,
  sugestoes,
  carregarCena = carregarCenaPadrao,
}: ExperienciaProps) {
  const hidratado = useHidratado();
  const menosMovimento = useMenosMovimento();
  const webgl = useWebGL();
  const [falhou3d, setFalhou3d] = useState(false);
  const modo: Modo = hidratado
    ? decidirModo({ webgl: webgl && !falhou3d, menosMovimento })
    : "estatico";
  const animado = modo !== "estatico" && !menosMovimento;

  const [regiaoAtiva, setRegiaoAtiva] = useState<RegiaoId | null>(null);
  const [reproducaoId, setReproducaoId] = useState<ReproducaoId>(reproducoes[0].id);
  const reproducao = reproducoes.find((item) => item.id === reproducaoId) ?? reproducoes[0];
  const total = reproducao.eventos.length;
  const [passos, setPassos] = useState(0);
  const [tocando, setTocando] = useState(true);
  const [automatico, setAutomatico] = useState(true);
  const [pausado, setPausado] = useState(false);
  const tempo = useRef(0);

  const palco = useRef<HTMLDivElement>(null);
  const cena = useRef<Cena | null>(null);
  const [cenaPronta, setCenaPronta] = useState(false);

  const iniciar = useCallback((id: ReproducaoId) => {
    tempo.current = 0;
    setReproducaoId(id);
    setPassos(0);
    setTocando(true);
  }, []);

  // Relógio da reprodução: anda só com movimento permitido, sem pausa e com a aba visível
  // (o navegador não chama requestAnimationFrame em aba oculta).
  useEffect(() => {
    if (!animado || pausado || !tocando) {
      return;
    }
    const fim = fimDaReproducao(reproducao.duracaoMs);
    let quadro = 0;
    let anterior = performance.now();
    const avancar = () => {
      const agora = performance.now();
      tempo.current = Math.min(tempo.current + Math.min(agora - anterior, maiorQuadroMs), fim);
      anterior = agora;
      setPassos(passosAte(reproducao.eventos, tempo.current));
      if (tempo.current >= fim) {
        setTocando(false);
        return;
      }
      quadro = requestAnimationFrame(avancar);
    };
    quadro = requestAnimationFrame(avancar);
    return () => cancelAnimationFrame(quadro);
  }, [animado, pausado, tocando, reproducao]);

  // Sem escolha do visitante, uma reprodução emenda na outra.
  useEffect(() => {
    if (!animado || pausado || tocando || !automatico) {
      return;
    }
    const indice = reproducoes.findIndex((item) => item.id === reproducaoId);
    const proxima = reproducoes[(indice + 1) % reproducoes.length].id;
    const espera = setTimeout(() => iniciar(proxima), esperaEntreReproducoesMs);
    return () => clearTimeout(espera);
  }, [animado, pausado, tocando, automatico, reproducoes, reproducaoId, iniciar]);

  // Cena 3D sob demanda; erro na carga ou na criação, ou contexto perdido, vira mapa 2D.
  useEffect(() => {
    const container = palco.current;
    if (modo !== "3d" || !container) {
      return;
    }
    let cancelado = false;
    let instancia: Cena | null = null;
    carregarCena()
      .then((criarCena) => {
        if (cancelado) {
          return;
        }
        instancia = criarCena(container, {
          aoSelecionar: setRegiaoAtiva,
          aoPerderContexto: () => setFalhou3d(true),
          tempo: () => tempo.current,
        });
        cena.current = instancia;
        setCenaPronta(true);
      })
      .catch(() => {
        if (!cancelado) {
          setFalhou3d(true);
        }
      });
    return () => {
      cancelado = true;
      instancia?.descartar();
      cena.current = null;
    };
  }, [modo, carregarCena]);

  useEffect(() => {
    cena.current?.destacar(regiaoAtiva);
  }, [regiaoAtiva, cenaPronta]);

  useEffect(() => {
    cena.current?.reproduzir(reproducao.eventos);
  }, [reproducao, cenaPronta]);

  useEffect(() => {
    cena.current?.pausar(pausado || !animado);
  }, [pausado, animado, cenaPronta]);

  const escolherReproducao = (id: ReproducaoId) => {
    setAutomatico(false);
    iniciar(id);
  };

  // A resposta do Sinapse mostra no mapa a região de que fala e toca a reprodução dela.
  const responder = (resposta: RespostaGravada) => {
    if (resposta.regiao) {
      setRegiaoAtiva(resposta.regiao);
    }
    if (resposta.reproducao) {
      escolherReproducao(resposta.reproducao);
    }
  };

  const proximoPasso = () => {
    const proximo = Math.min(passos + 1, total);
    tempo.current = reproducao.eventos[proximo - 1]?.inicioMs ?? 0;
    setPassos(proximo);
  };

  const recomecar = () => {
    tempo.current = 0;
    setPassos(0);
  };

  const regiao = regioes.find((item) => item.id === regiaoAtiva);
  const recentes = reproducao.eventos.slice(Math.max(0, passos - passosRecentes), passos);

  const rotuloDoModo =
    modo === "3d"
      ? "cena 3D"
      : modo === "estatico"
        ? "mapa parado"
        : menosMovimento
          ? "mapa em 2D, sem animação: o sistema pede menos movimento"
          : "mapa em 2D neste navegador";

  const situacao = !animado
    ? `Passo ${passos} de ${total}`
    : pausado
      ? "Pausado"
      : tocando
        ? "Reproduzindo"
        : "Fim da reprodução";

  return (
    <section
      aria-labelledby="mapa-titulo"
      data-modo={modo}
      data-estado={animado && !pausado ? "animando" : "pausado"}
      className="monitor bg-monitor text-monitor-fg border-monitor-border space-y-5 rounded-xl border p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h2 id="mapa-titulo" className="font-mono text-sm font-medium">
            Mapa do ecossistema
          </h2>
          <p className="text-monitor-muted font-mono text-xs">{rotuloDoModo}</p>
        </div>
        {animado ? (
          <button type="button" onClick={() => setPausado((valor) => !valor)} className={botao}>
            {pausado ? "Retomar" : "Pausar"}
          </button>
        ) : null}
      </div>

      {modo === "estatico" ? (
        <div className="space-y-3">
          <div className="mx-auto aspect-[4/3] max-w-xl">
            <Mapa2D regioes={regioes} regiaoAtiva={null} recentes={[]} />
          </div>
          <p className="text-monitor-muted text-sm">
            O mapa interativo precisa de JavaScript. As regiões, as reproduções e as respostas estão
            logo abaixo, em texto.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3]">
              {modo === "3d" ? (
                <div
                  ref={palco}
                  aria-hidden="true"
                  data-testid="palco-3d"
                  className="absolute inset-0"
                />
              ) : null}
              {modo !== "3d" || !cenaPronta ? (
                <div className="absolute inset-0">
                  <Mapa2D
                    regioes={regioes}
                    regiaoAtiva={regiaoAtiva}
                    recentes={recentes}
                    aoSelecionar={setRegiaoAtiva}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <p id="reproducoes-titulo" className="text-monitor-muted font-mono text-xs">
                Reproduções
              </p>
              <ul aria-labelledby="reproducoes-titulo" className="flex flex-wrap gap-2">
                {reproducoes.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-pressed={item.id === reproducao.id}
                      onClick={() => escolherReproducao(item.id)}
                      className={botao}
                    >
                      {item.nome}
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-monitor-muted text-sm leading-relaxed">
                {reproducao.descricao} Origem:{" "}
                {reproducao.fonte.href ? (
                  <LinkDoMonitor href={reproducao.fonte.href}>
                    {reproducao.fonte.rotulo}
                  </LinkDoMonitor>
                ) : (
                  reproducao.fonte.rotulo
                )}
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-xs" data-testid="situacao">
                {situacao}
              </p>
              {!animado ? (
                <>
                  <button
                    type="button"
                    onClick={proximoPasso}
                    disabled={passos >= total}
                    className={botao}
                  >
                    Próximo passo
                  </button>
                  <button
                    type="button"
                    onClick={recomecar}
                    disabled={passos === 0}
                    className={botao}
                  >
                    Recomeçar
                  </button>
                </>
              ) : !tocando && !automatico ? (
                <button type="button" onClick={() => iniciar(reproducao.id)} className={botao}>
                  Repetir
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p id="regioes-titulo" className="text-monitor-muted font-mono text-xs">
                Regiões
              </p>
              <ul aria-labelledby="regioes-titulo" className="flex flex-wrap gap-2">
                {regioes.map((item) => {
                  const ativa = item.id === regiaoAtiva;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={ativa}
                        aria-controls="cartao-da-regiao"
                        onClick={() => setRegiaoAtiva(ativa ? null : item.id)}
                        className={`${botao} inline-flex items-center gap-2`}
                      >
                        <span
                          aria-hidden="true"
                          className={`size-2 shrink-0 rounded-full ${fundoDaRegiao[item.id]}`}
                        />
                        {item.nome}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div
                id="cartao-da-regiao"
                className="border-monitor-border min-h-32 rounded-md border p-4"
              >
                {regiao ? (
                  <CartaoDaRegiao regiao={regiao} />
                ) : (
                  <p className="text-monitor-muted text-sm leading-relaxed">
                    Escolha uma região no mapa ou na lista para ver o que ela é, a stack, o estado e
                    os links.
                  </p>
                )}
              </div>
            </div>

            <Registro reproducao={reproducao} passos={passos} />
          </div>
        </div>
      )}

      {modo === "estatico" ? null : (
        <AssistenteUi
          respostas={respostas}
          sugestoes={sugestoes}
          pausado={pausado}
          animado={animado}
          aoResponder={responder}
        />
      )}
    </section>
  );
}
