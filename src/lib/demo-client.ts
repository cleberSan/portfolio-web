import type { Consent, Notice, Trace } from "@/content/painel";

/**
 * Cliente do Painel ao vivo para o backend da demonstração (ADR-0013 do CareFlow). O navegador fala só com as
 * rotas `/demo/v1/*`, sem cookie: a sessão é um token opaco que fica apenas na memória da página e vai em
 * `Authorization`. O cabeçalho `X-CareFlow-Demo` é a segunda barreira que o backend exige.
 */

/** `disponivel`, `lotado` (todas as sessões em uso) ou `desligado` (interruptor). */
export type DemoState = "disponivel" | "lotado" | "desligado";

export type DemoStatus = { available: boolean; state: DemoState };

export type DemoSession = {
  token: string;
  expiresAt: string;
  partition: string;
  patientRef: string;
  bookings: number;
  maxBookings: number;
};

export type DemoBooking = {
  appointmentId: string;
  startsAt: string;
  traceId: string;
  attempts: number;
};

export type DemoPatient = {
  vault: { fullName: string; cpf: string; birthDate: string; phone: string | null };
  scheduling: readonly { id: string; status: string }[];
  consent: readonly Consent[];
  notifications: readonly Notice[];
  logMask: string;
};

/**
 * Por que o modo ao vivo parou. `indisponivel` cobre o interruptor desligado e o 503 do backend; `expirada`,
 * a sessão que venceu ou foi encerrada do outro lado; `falha`, rede, tempo esgotado ou resposta inesperada.
 */
export type DemoFailure = "indisponivel" | "lotado" | "expirada" | "limite" | "falha";

export class DemoError extends Error {
  constructor(
    readonly reason: DemoFailure,
    message: string,
    /** O código HTTP, quando o backend chegou a responder. */
    readonly status?: number,
  ) {
    super(message);
    this.name = "DemoError";
  }
}

const demoHeader = "X-CareFlow-Demo";
const defaultTimeoutMs = 10_000;
/** A reserva espera o paciente chegar à agenda por eventos; o backend repete por alguns segundos. */
const bookingTimeoutMs = 25_000;
const states: readonly DemoState[] = ["disponivel", "lotado", "desligado"];

type FetchLike = typeof fetch;

export type DemoClientOptions = { baseUrl: URL; fetch?: FetchLike };

export function createDemoClient({ baseUrl, fetch: fetchImpl = fetch }: DemoClientOptions) {
  async function call(
    method: string,
    path: string,
    { token, timeoutMs = defaultTimeoutMs }: { token?: string; timeoutMs?: number } = {},
  ): Promise<Response> {
    const headers = new Headers({ [demoHeader]: "1", Accept: "application/json" });
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    let response: Response;
    try {
      response = await fetchImpl(new URL(path, baseUrl), {
        method,
        headers,
        // Nada do site vai junto: sem cookie, sem Referer, sem seguir redirecionamento para outro host.
        credentials: "omit",
        mode: "cors",
        redirect: "error",
        referrerPolicy: "no-referrer",
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch {
      throw new DemoError("falha", "O backend da demonstração não respondeu.");
    }

    if (response.ok) {
      return response;
    }

    switch (response.status) {
      case 401:
        throw new DemoError("expirada", "A sessão terminou.");
      case 409:
        throw new DemoError("limite", "Esta sessão chegou ao limite de ações.");
      case 429:
        throw new DemoError("lotado", "Muitas sessões a partir deste endereço. Tente mais tarde.");
      case 503:
        throw new DemoError("indisponivel", "O modo ao vivo está desligado agora.");
      default:
        throw new DemoError("falha", `O backend respondeu ${response.status}.`, response.status);
    }
  }

  async function json(response: Response): Promise<unknown> {
    try {
      return await response.json();
    } catch {
      throw new DemoError("falha", "O backend devolveu uma resposta ilegível.");
    }
  }

  return {
    async status(): Promise<DemoStatus> {
      const body = await json(await call("GET", "demo/v1/status"));
      if (!isRecord(body) || typeof body.available !== "boolean" || !isState(body.state)) {
        throw new DemoError("falha", "Status inesperado do backend.");
      }

      return { available: body.available, state: body.state };
    },

    async openSession(): Promise<DemoSession> {
      const body = await json(await call("POST", "demo/v1/sessions"));
      if (
        !isRecord(body) ||
        typeof body.token !== "string" ||
        body.token.length === 0 ||
        typeof body.expiresAt !== "string" ||
        typeof body.partition !== "string" ||
        typeof body.patientRef !== "string" ||
        typeof body.bookings !== "number" ||
        typeof body.maxBookings !== "number"
      ) {
        throw new DemoError("falha", "Sessão inesperada do backend.");
      }

      return {
        token: body.token,
        expiresAt: body.expiresAt,
        partition: body.partition,
        patientRef: body.patientRef,
        bookings: body.bookings,
        maxBookings: body.maxBookings,
      };
    },

    async book(token: string): Promise<DemoBooking> {
      const body = await json(
        await call("POST", "demo/v1/appointments", { token, timeoutMs: bookingTimeoutMs }),
      );
      if (
        !isRecord(body) ||
        typeof body.appointmentId !== "string" ||
        typeof body.startsAt !== "string" ||
        typeof body.traceId !== "string" ||
        typeof body.attempts !== "number"
      ) {
        throw new DemoError("falha", "Reserva inesperada do backend.");
      }

      return {
        appointmentId: body.appointmentId,
        startsAt: body.startsAt,
        traceId: body.traceId,
        attempts: body.attempts,
      };
    },

    async patient(token: string): Promise<DemoPatient> {
      const body = await json(await call("GET", "demo/v1/patient", { token }));
      if (
        !isRecord(body) ||
        !isRecord(body.vault) ||
        typeof body.vault.fullName !== "string" ||
        typeof body.vault.cpf !== "string" ||
        !Array.isArray(body.scheduling) ||
        !Array.isArray(body.consent) ||
        !Array.isArray(body.notifications) ||
        typeof body.logMask !== "string"
      ) {
        throw new DemoError("falha", "Paciente inesperado do backend.");
      }

      return body as unknown as DemoPatient;
    },

    /**
     * O trace da ação, ou nada enquanto ele ainda está chegando ao Tempo (o backend responde 404 até lá).
     * Só a própria sessão lê os traces que criou.
     */
    async trace(token: string, traceId: string): Promise<Trace | undefined> {
      if (!/^[0-9a-f]{32}$/.test(traceId)) {
        throw new DemoError("falha", "Identificador de trace inválido.");
      }

      try {
        const body = await json(await call("GET", `demo/v1/traces/${traceId}`, { token }));
        if (!isRecord(body) || body.traceId !== traceId || !Array.isArray(body.spans)) {
          throw new DemoError("falha", "Trace inesperado do backend.");
        }

        return body as unknown as Trace;
      } catch (error) {
        if (error instanceof DemoError && error.status === 404) {
          return undefined;
        }

        throw error;
      }
    },

    async endSession(token: string): Promise<void> {
      await call("DELETE", "demo/v1/session", { token });
    },
  };
}

export type DemoClient = ReturnType<typeof createDemoClient>;

/** CPF e telefone sintéticos aparecem só com os dois últimos dígitos, como na gravação publicada. */
export function maskDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  return digits.length <= 2 ? "••" : `${"•".repeat(digits.length - 2)}${digits.slice(-2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isState(value: unknown): value is DemoState {
  return typeof value === "string" && (states as readonly string[]).includes(value);
}
