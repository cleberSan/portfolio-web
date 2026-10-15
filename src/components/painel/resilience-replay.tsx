"use client";

import { useState } from "react";
import { circuitLabel, formatMs, stepLabel, whatsapp, type ResilienceStep } from "@/content/painel";

const channelNames: Readonly<Record<string, string>> = {
  WhatsApp: "WhatsApp",
  Sms: "SMS",
  Email: "e-mail",
};

const outcomeNames: Readonly<Record<string, string>> = {
  Delivered: "entregue",
  Failed: "falhou",
  CircuitOpen: "pulado, circuito aberto",
  Timeout: "tempo esgotado",
};

function channelName(channel: string): string {
  return channelNames[channel] ?? channel;
}

/**
 * Reprodução passo a passo da queda do WhatsApp gravada pelo CI. Cada passo mostra o estado
 * que o sistema devolveu naquele momento; o texto do passo atual é anunciado por uma região
 * `aria-live`, e a lista completa continua legível sem JavaScript.
 */
export function ResilienceReplay({ steps }: { steps: readonly ResilienceStep[] }) {
  const [index, setIndex] = useState(0);
  const step = steps[index];
  const channel = whatsapp(step);
  const last = steps.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="border-border rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          Passo anterior
        </button>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(last, i + 1))}
          disabled={index === last}
          className="bg-accent text-background rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          Próximo passo
        </button>
        <button
          type="button"
          onClick={() => setIndex(0)}
          disabled={index === 0}
          className="text-accent px-3 py-1.5 text-sm font-medium underline underline-offset-4 disabled:opacity-60"
        >
          Recomeçar
        </button>
      </div>

      <div aria-live="polite" className="border-border space-y-3 rounded-lg border p-4">
        <p className="font-medium">
          Passo {index + 1} de {steps.length}: {stepLabel(step.action)}
        </p>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted">Momento da gravação</dt>
            <dd className="font-mono">{formatMs(step.atMs)}</dd>
          </div>
          <div>
            <dt className="text-muted">WhatsApp</dt>
            <dd>{channel?.fault ? "Fora do ar (falha injetada)" : "No ar"}</dd>
          </div>
          <div>
            <dt className="text-muted">Circuit breaker do WhatsApp</dt>
            <dd data-testid="circuito">{circuitLabel(channel?.circuit ?? "Closed")}</dd>
          </div>
          <div>
            <dt className="text-muted">Aviso de confirmação</dt>
            <dd data-testid="canal">
              {step.notification?.sentVia
                ? `Enviado por ${channelName(step.notification.sentVia)}`
                : "Nenhum aviso neste passo"}
            </dd>
          </div>
        </dl>
        {step.notification ? (
          <p className="text-muted text-sm">
            Tentativas:{" "}
            {step.notification.attempts
              .map(
                (attempt) =>
                  `${channelName(attempt.channel)} (${outcomeNames[attempt.outcome] ?? attempt.outcome})`,
              )
              .join(", então ")}
            .
          </p>
        ) : null}
      </div>

      <ol className="text-muted space-y-1 text-sm">
        {steps.map((item, i) => (
          <li
            key={i}
            aria-current={i === index ? "step" : undefined}
            className={i === index ? "text-foreground font-medium" : undefined}
          >
            {i + 1}. {stepLabel(item.action)}
            {item.notification?.sentVia
              ? ` (aviso por ${channelName(item.notification.sentVia)})`
              : ""}
            {`, circuito ${circuitLabel(whatsapp(item)?.circuit ?? "Closed").toLowerCase()}`}
          </li>
        ))}
      </ol>
    </div>
  );
}
