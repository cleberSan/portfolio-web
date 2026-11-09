"use client";

import { useEffect, useId, useState, useSyncExternalStore, type FormEvent } from "react";
import {
  avisoDePrivacidade,
  nomeDoAssistente,
  semResposta,
} from "@/content/ecossistema/assistente";
import type { RespostaGravada } from "@/content/ecossistema/modelo";
import { buscar, tamanhoMaximoDaPergunta } from "@/lib/assistente/buscar";
import { intervaloDaDigitacaoMs, proximoCorte } from "@/lib/assistente/digitar";
import { falar, observarVozes, parar, podeFalar } from "@/lib/voz";
import { LinkDoMonitor } from "./link-do-monitor";

type Consulta = { pergunta: string; resposta: RespostaGravada | null };

type AssistenteUiProps = {
  respostas: readonly RespostaGravada[];
  /** Ids das respostas oferecidas como perguntas prontas, na ordem. */
  sugestoes: readonly string[];
  /** Pausa da página: a digitação e a voz param junto com o resto. */
  pausado: boolean;
  /** Com movimento reduzido, a resposta aparece inteira de uma vez. */
  animado: boolean;
  /** Avisa a experiência para destacar a região e tocar a reprodução da resposta. */
  aoResponder: (resposta: RespostaGravada) => void;
};

const botao =
  "border-monitor-border hover:border-monitor-fg rounded-md border px-3 py-1.5 text-left text-sm";

/**
 * O Sinapse na tela (spec 0001, CA-12 a CA-17). A pergunta é buscada neste navegador entre as
 * respostas gravadas: nada é enviado nem guardado, e o texto do visitante só aparece como texto.
 * A resposta é digitada palavra por palavra (parada na pausa, inteira com movimento reduzido) e
 * anunciada uma vez, completa, aos leitores de tela quando termina. A voz (CA-18 e CA-19) começa
 * desligada, só aparece se o navegador fala português e lê só as respostas gravadas.
 */
export function AssistenteUi({
  respostas,
  sugestoes,
  pausado,
  animado,
  aoResponder,
}: AssistenteUiProps) {
  const id = useId();
  const [pergunta, setPergunta] = useState("");
  const [consulta, setConsulta] = useState<Consulta | null>(null);
  const [mostrados, setMostrados] = useState(0);
  const vozDisponivel = useSyncExternalStore(observarVozes, podeFalar, () => false);
  const [vozLigada, setVozLigada] = useState(false);
  const lendo = vozDisponivel && vozLigada;

  const alvo = consulta ? (consulta.resposta?.texto ?? semResposta) : "";
  const terminou = !animado || mostrados >= alvo.length;
  const visivel = terminou ? alvo : alvo.slice(0, mostrados);

  useEffect(() => {
    if (!consulta || terminou || pausado) {
      return;
    }
    const espera = setTimeout(
      () => setMostrados((atual) => proximoCorte(alvo, atual)),
      intervaloDaDigitacaoMs,
    );
    return () => clearTimeout(espera);
  }, [consulta, terminou, pausado, alvo, mostrados]);

  // A pausa da página cala a voz; sair da página também.
  useEffect(() => {
    if (pausado) {
      parar();
    }
  }, [pausado]);
  useEffect(() => parar, []);

  /** Só texto gravado vai para a voz: a resposta ou o aviso de que não há resposta. */
  const ler = (resposta: RespostaGravada | null) => {
    if (lendo && !pausado) {
      falar(resposta?.texto ?? semResposta);
    }
  };

  const alternarVoz = () => {
    if (vozLigada) {
      parar();
    } else if (consulta && !pausado) {
      falar(alvo);
    }
    setVozLigada(!vozLigada);
  };

  const consultar = (texto: string, resposta: RespostaGravada | null) => {
    setConsulta({ pergunta: texto, resposta });
    setMostrados(0);
    ler(resposta);
    if (resposta) {
      aoResponder(resposta);
    }
  };

  const enviar = (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const texto = pergunta.trim().slice(0, tamanhoMaximoDaPergunta);
    if (!texto) {
      return;
    }
    consultar(texto, buscar(texto, respostas));
    setPergunta("");
  };

  const prontas = sugestoes
    .map((idDaResposta) => respostas.find((resposta) => resposta.id === idDaResposta))
    .filter((resposta): resposta is RespostaGravada => resposta !== undefined);

  return (
    <div
      role="group"
      aria-labelledby={`${id}-titulo`}
      className="border-monitor-border grid gap-5 rounded-md border p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
    >
      <div className="space-y-3">
        <h3 id={`${id}-titulo`} className="font-mono text-sm font-medium">
          {nomeDoAssistente}
        </h3>
        <p className="text-monitor-muted text-xs leading-relaxed">{avisoDePrivacidade}</p>
        {vozDisponivel ? (
          <button
            type="button"
            aria-pressed={vozLigada}
            onClick={alternarVoz}
            className={`${botao} aria-pressed:bg-monitor-fg aria-pressed:text-monitor aria-pressed:border-monitor-fg`}
          >
            Ler respostas em voz alta
          </button>
        ) : null}
        <ul aria-label="Perguntas sugeridas" className="flex flex-wrap gap-2">
          {prontas.map((resposta) => (
            <li key={resposta.id}>
              <button
                type="button"
                onClick={() => consultar(resposta.pergunta, resposta)}
                className={botao}
              >
                {resposta.pergunta}
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={enviar} className="space-y-2">
          <label htmlFor={`${id}-pergunta`} className="block text-sm">
            Sua pergunta
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-pergunta`}
              type="text"
              value={pergunta}
              onChange={(evento) => setPergunta(evento.target.value)}
              maxLength={tamanhoMaximoDaPergunta}
              autoComplete="off"
              enterKeyHint="send"
              className="border-monitor-border bg-monitor min-w-0 flex-1 rounded-md border px-3 py-1.5 text-sm"
            />
            <button type="submit" className={botao}>
              Perguntar
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-3" data-testid="resposta">
        {consulta ? (
          <>
            <p className="text-monitor-muted font-mono text-xs break-words">
              Você perguntou: {consulta.pergunta}
            </p>
            {/* O leitor de tela ouve a resposta pela região viva abaixo, inteira e uma vez só. */}
            <p className="leading-relaxed" aria-hidden="true">
              {visivel}
              {terminou ? null : (
                <span aria-hidden="true" className="text-monitor-muted">
                  {" "}
                  ▍
                </span>
              )}
            </p>
            {terminou && consulta.resposta ? (
              <p className="text-sm">
                <span className="text-monitor-muted">Fontes: </span>
                {consulta.resposta.fontes.map((fonte, index) => (
                  <span key={`${index}-${fonte.href}`}>
                    {index > 0 ? " · " : null}
                    <LinkDoMonitor href={fonte.href}>{fonte.rotulo}</LinkDoMonitor>
                  </span>
                ))}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-monitor-muted text-sm leading-relaxed">
            Escolha uma pergunta ou escreva a sua. A resposta mostra a parte do mapa de que fala.
          </p>
        )}
        <p aria-live="polite" className="sr-only" data-testid="anuncio">
          {consulta && terminou ? alvo : ""}
        </p>
      </div>
    </div>
  );
}
