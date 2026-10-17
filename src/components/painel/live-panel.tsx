"use client";

import { useEffect, useMemo, useState } from "react";
import { TraceWaterfall } from "@/components/painel/trace-waterfall";
import type { Trace } from "@/content/painel";
import {
  createDemoClient,
  DemoError,
  maskDigits,
  type DemoBooking,
  type DemoClient,
  type DemoFailure,
  type DemoPatient,
  type DemoSession,
} from "@/lib/demo-client";

type LivePanelProps = {
  /** Origem do backend da demonstração; sem ela o Painel fica só no replay. */
  backendUrl?: string;
  /** Para os testes: cliente e espera entre as tentativas de ler o trace. */
  client?: DemoClient;
  traceRetryMs?: number;
};

type ReplayReason = "nao-configurado" | "desligado" | "lotado" | "falha";

type Mode =
  | { kind: "conferindo" }
  | { kind: "replay"; reason: ReplayReason }
  | { kind: "disponivel"; notice?: string }
  | { kind: "ao-vivo"; session: DemoSession };

type BookingResult = { booking: DemoBooking; trace?: Trace; traceMissing?: boolean };

const replayMessages: Readonly<Record<ReplayReason, string>> = {
  "nao-configurado": "O backend ao vivo ainda não está configurado neste site.",
  desligado: "O modo ao vivo está desligado agora.",
  lotado: "Todas as sessões ao vivo estão em uso agora. Tente de novo em alguns minutos.",
  falha: "O backend ao vivo não respondeu.",
};

const traceAttempts = 6;

function replayReason(failure: DemoFailure): ReplayReason {
  if (failure === "indisponivel") {
    return "desligado";
  }

  return failure === "lotado" ? "lotado" : "falha";
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Modo ao vivo do Painel: com o backend no ar, o visitante abre uma sessão numa clínica sintética só dele, marca
 * consultas e vê o trace e o paciente em cada serviço, tudo calculado agora. Se o backend estiver desligado,
 * lotado ou falhar, a seção diz por quê e o resto da página continua sendo o replay da gravação.
 */
export function LivePanel({ backendUrl, client: injected, traceRetryMs = 1_500 }: LivePanelProps) {
  const client = useMemo(
    () => injected ?? (backendUrl ? createDemoClient({ baseUrl: new URL(backendUrl) }) : undefined),
    [injected, backendUrl],
  );
  const [mode, setMode] = useState<Mode>(() =>
    client ? { kind: "conferindo" } : { kind: "replay", reason: "nao-configurado" },
  );
  const [busy, setBusy] = useState(false);
  const [booking, setBooking] = useState<BookingResult>();
  const [patient, setPatient] = useState<DemoPatient>();
  const [notice, setNotice] = useState<string>();

  useEffect(() => {
    if (!client) {
      return;
    }

    let active = true;
    client
      .status()
      .then((status) => {
        if (!active) {
          return;
        }

        if (status.state === "disponivel") {
          setMode({ kind: "disponivel" });
        } else {
          setMode({ kind: "replay", reason: status.state === "lotado" ? "lotado" : "desligado" });
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setMode({
            kind: "replay",
            reason: error instanceof DemoError ? replayReason(error.reason) : "falha",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [client]);

  function fail(error: unknown) {
    const failure = error instanceof DemoError ? error.reason : "falha";
    if (failure === "limite") {
      setNotice(error instanceof Error ? error.message : undefined);
      return;
    }

    setBooking(undefined);
    setPatient(undefined);
    setNotice(undefined);
    if (failure === "expirada") {
      setMode({ kind: "disponivel", notice: "A sessão terminou. Abra outra para continuar." });
      return;
    }

    setMode({ kind: "replay", reason: replayReason(failure) });
  }

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setNotice(undefined);
    try {
      await action();
    } catch (error) {
      fail(error);
    } finally {
      setBusy(false);
    }
  }

  if (!client || mode.kind === "conferindo" || mode.kind === "replay") {
    const message =
      mode.kind === "replay" ? replayMessages[mode.reason] : "Conferindo se o backend está no ar…";

    return (
      <LiveSection modeLabel={mode.kind === "conferindo" ? "conferindo" : "replay"}>
        <p role="status" className="leading-relaxed" data-testid="estado-ao-vivo">
          {message}
          {mode.kind === "replay" ? " Os cenários abaixo são a gravação do CI." : null}
        </p>
      </LiveSection>
    );
  }

  if (mode.kind === "disponivel") {
    return (
      <LiveSection modeLabel="disponível">
        <p role="status" className="leading-relaxed" data-testid="estado-ao-vivo">
          {mode.notice ??
            "O backend está no ar. Abra uma sessão para usar o CareFlow de verdade numa clínica sintética só sua, com 15 minutos de duração."}
        </p>
        <button
          type="button"
          className="bg-accent text-background rounded-md px-4 py-2 font-medium disabled:opacity-60"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const session = await client.openSession();
              setMode({ kind: "ao-vivo", session });
            })
          }
        >
          Abrir uma sessão ao vivo
        </button>
      </LiveSection>
    );
  }

  const { session } = mode;

  return (
    <LiveSection modeLabel="ao vivo">
      <p role="status" className="leading-relaxed" data-testid="estado-ao-vivo">
        {notice ??
          `Sessão aberta na clínica sintética ${session.partition}, até ${formatTime(session.expiresAt)}. Tudo abaixo desta seção continua sendo a gravação.`}
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="bg-accent text-background rounded-md px-4 py-2 font-medium disabled:opacity-60"
          disabled={busy}
          onClick={() =>
            run(async () => {
              const booked = await client.book(session.token);
              setBooking({ booking: booked });
              for (let attempt = 1; attempt <= traceAttempts; attempt++) {
                await wait(traceRetryMs);
                const trace = await client.trace(session.token, booked.traceId);
                if (trace) {
                  setBooking({ booking: booked, trace });
                  return;
                }
              }

              setBooking({ booking: booked, traceMissing: true });
            })
          }
        >
          Marcar uma consulta
        </button>
        <button
          type="button"
          className="border-border rounded-md border px-4 py-2 font-medium disabled:opacity-60"
          disabled={busy}
          onClick={() => run(async () => setPatient(await client.patient(session.token)))}
        >
          Ver o paciente em cada serviço
        </button>
        <button
          type="button"
          className="border-border rounded-md border px-4 py-2 font-medium disabled:opacity-60"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await client.endSession(session.token);
              setBooking(undefined);
              setPatient(undefined);
              setMode({
                kind: "disponivel",
                notice: "Sessão encerrada. A clínica sintética será apagada.",
              });
            })
          }
        >
          Encerrar a sessão
        </button>
      </div>

      {booking ? (
        <div className="space-y-3" data-testid="reserva-ao-vivo">
          <p>
            Consulta marcada para {formatDateTime(booking.booking.startsAt)}
            {booking.booking.attempts > 1
              ? `, na tentativa ${booking.booking.attempts}: a agenda ainda não conhecia o paciente, que chega por evento.`
              : "."}
          </p>
          {booking.trace ? (
            <TraceWaterfall trace={booking.trace} label="Trace da reserva ao vivo" />
          ) : (
            <p className="text-muted text-sm">
              {booking.traceMissing
                ? "O trace ainda não chegou ao Tempo. Marque outra consulta ou tente mais tarde."
                : "Esperando o trace chegar ao Tempo…"}
            </p>
          )}
        </div>
      ) : null}

      {patient ? <LivePatient patient={patient} /> : null}
    </LiveSection>
  );
}

function LiveSection({ modeLabel, children }: { modeLabel: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby="ao-vivo" className="border-border space-y-4 rounded-lg border p-4">
      <h2 id="ao-vivo" className="text-2xl font-semibold tracking-tight">
        Ao vivo
      </h2>
      <p className="text-muted text-sm">
        Modo: <strong data-testid="modo-do-painel">{modeLabel}</strong>
      </p>
      {children}
    </section>
  );
}

function LivePatient({ patient }: { patient: DemoPatient }) {
  return (
    <div
      role="region"
      aria-label="O paciente ao vivo em cada serviço"
      tabIndex={0}
      className="border-border overflow-x-auto rounded-lg border"
    >
      <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
        <caption className="text-muted px-3 py-2 text-left">
          Lido agora de cada serviço. CPF e telefone sintéticos aparecem só com os dois últimos
          dígitos.
        </caption>
        <tbody>
          <tr className="border-border border-t align-top">
            <th scope="row" className="px-3 py-2 font-medium">
              Cofre do paciente
            </th>
            <td className="px-3 py-2">
              {patient.vault.fullName}, CPF {maskDigits(patient.vault.cpf)}
              {patient.vault.phone ? `, telefone ${maskDigits(patient.vault.phone)}` : null}
            </td>
          </tr>
          <tr className="border-border border-t align-top">
            <th scope="row" className="px-3 py-2 font-medium">
              Agenda
            </th>
            <td className="px-3 py-2">{patient.scheduling.length} consultas pelo pseudônimo</td>
          </tr>
          <tr className="border-border border-t align-top">
            <th scope="row" className="px-3 py-2 font-medium">
              Consentimento
            </th>
            <td className="px-3 py-2">
              {patient.consent
                .map((consent) => `${consent.purpose} (${consent.status})`)
                .join(", ")}
            </td>
          </tr>
          <tr className="border-border border-t align-top">
            <th scope="row" className="px-3 py-2 font-medium">
              Notificações
            </th>
            <td className="px-3 py-2">{patient.notifications.length} avisos, sem o contato</td>
          </tr>
          <tr className="border-border border-t align-top">
            <th scope="row" className="px-3 py-2 font-medium">
              Logs e traces
            </th>
            <td className="px-3 py-2">
              <code className="font-mono text-xs">{patient.logMask}</code>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
