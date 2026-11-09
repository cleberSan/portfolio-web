"use client";

import { useEffect, useRef } from "react";
import type { Reproducao } from "@/content/ecossistema/modelo";
import { caminhoDoEvento, detalheDoEvento } from "./linha-do-tempo";

type RegistroProps = {
  reproducao: Reproducao;
  /** Quantos passos já aconteceram. */
  passos: number;
};

/**
 * Registro textual da reprodução (spec 0001, CA-06): cada sub-rotina com serviço, operação e
 * duração, na ordem em que aconteceu. Não é região viva, para o leitor de tela não narrar dezenas
 * de passos; quem quiser lê no ritmo próprio. Rola sozinho até o passo mais novo.
 */
export function Registro({ reproducao, passos }: RegistroProps) {
  const lista = useRef<HTMLOListElement>(null);
  const eventos = reproducao.eventos.slice(0, passos);

  useEffect(() => {
    const elemento = lista.current;
    if (elemento) {
      elemento.scrollTop = elemento.scrollHeight;
    }
  }, [passos, reproducao.id]);

  return (
    <div className="space-y-2">
      <p id="registro-titulo" className="text-monitor-muted font-mono text-xs">
        Registro · {passos} de {reproducao.eventos.length} passos
      </p>
      <ol
        ref={lista}
        aria-labelledby="registro-titulo"
        tabIndex={0}
        className="border-monitor-border h-44 space-y-1.5 overflow-y-auto rounded-md border p-3 font-mono text-xs leading-snug"
      >
        {eventos.length === 0 ? (
          <li className="text-monitor-muted">Nenhum passo ainda.</li>
        ) : (
          eventos.map((evento, index) => (
            <li key={index} className="grid gap-x-3 sm:grid-cols-[5.5rem_1fr]">
              <span className="text-monitor-muted">{evento.marca}</span>
              <span className="break-words">
                {caminhoDoEvento(evento)}: {detalheDoEvento(evento)}
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
