import { describe, expect, it, vi } from "vitest";
import { createDemoClient, DemoError, maskDigits } from "./demo-client";

const baseUrl = new URL("https://demo.careflow.test");
const traceId = "0123456789abcdef0123456789abcdef";

function respond(status: number, body?: unknown) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientWith(...responses: (Response | Error)[]) {
  const fetch = vi.fn<typeof globalThis.fetch>();
  for (const response of responses) {
    if (response instanceof Error) {
      fetch.mockRejectedValueOnce(response);
    } else {
      fetch.mockResolvedValueOnce(response);
    }
  }

  return { client: createDemoClient({ baseUrl, fetch }), fetch };
}

const session = {
  token: "token-opaco",
  expiresAt: "2026-10-16T20:15:00Z",
  partition: "isolated-01",
  patientRef: "4b1a",
  bookings: 0,
  maxBookings: 5,
};

describe("createDemoClient", () => {
  it("chama o status com o cabeçalho do Painel, sem cookie, Referer nem redirecionamento", async () => {
    // Arrange
    const { client, fetch } = clientWith(respond(200, { available: true, state: "disponivel" }));

    // Act
    const status = await client.status();

    // Assert
    expect(status).toEqual({ available: true, state: "disponivel" });
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://demo.careflow.test/demo/v1/status");
    expect(init).toMatchObject({
      method: "GET",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
    });
    const headers = new Headers(init?.headers);
    expect(headers.get("X-CareFlow-Demo")).toBe("1");
    expect(headers.has("Authorization")).toBe(false);
  });

  it("manda o token da sessão só em Authorization", async () => {
    // Arrange
    const { client, fetch } = clientWith(
      respond(201, session),
      respond(200, {
        appointmentId: "a1",
        startsAt: "2026-10-23T12:00:00Z",
        traceId,
        attempts: 2,
        refusals: ["Agenda.PacienteDesconhecido"],
      }),
    );

    // Act
    const opened = await client.openSession();
    const booking = await client.book(opened.token);

    // Assert
    expect(opened).toEqual(session);
    expect(booking).toEqual({
      appointmentId: "a1",
      startsAt: "2026-10-23T12:00:00Z",
      traceId,
      attempts: 2,
    });
    const [url, init] = fetch.mock.calls[1];
    expect(String(url)).toBe("https://demo.careflow.test/demo/v1/appointments");
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer token-opaco");
    expect(String(url)).not.toContain("token-opaco");
  });

  it.each([
    [401, "expirada"],
    [409, "limite"],
    [429, "lotado"],
    [503, "indisponivel"],
    [500, "falha"],
  ] as const)("traduz o HTTP %i em %s", async (status, reason) => {
    // Arrange
    const { client } = clientWith(respond(status, { title: "x" }));

    // Act
    const call = client.status();

    // Assert
    await expect(call).rejects.toMatchObject({ reason });
  });

  it("trata rede fora e tempo esgotado como falha", async () => {
    // Arrange
    const { client } = clientWith(
      new TypeError("Failed to fetch"),
      new DOMException("signal timed out", "TimeoutError"),
    );

    // Act
    const call = client.status();

    // Assert
    await expect(call).rejects.toBeInstanceOf(DemoError);
    await expect(client.status()).rejects.toMatchObject({ reason: "falha" });
  });

  it.each([
    ["estado desconhecido", { available: true, state: "talvez" }],
    ["sem available", { state: "disponivel" }],
    ["lista", []],
  ])("recusa um status com %s", async (_, body) => {
    // Arrange
    const { client } = clientWith(respond(200, body));

    // Act
    const call = client.status();

    // Assert
    await expect(call).rejects.toMatchObject({ reason: "falha" });
  });

  it("recusa corpo ilegível e respostas incompletas", async () => {
    // Arrange
    const { client } = clientWith(
      new Response("<html>", { status: 200 }),
      respond(201, { ...session, token: "" }),
      respond(200, { appointmentId: "a1" }),
      respond(200, { vault: { fullName: "x" } }),
    );

    // Act & Assert
    await expect(client.status()).rejects.toMatchObject({ reason: "falha" });
    await expect(client.openSession()).rejects.toMatchObject({ reason: "falha" });
    await expect(client.book("t")).rejects.toMatchObject({ reason: "falha" });
    await expect(client.patient("t")).rejects.toMatchObject({ reason: "falha" });
  });

  it("lê o paciente em cada serviço", async () => {
    // Arrange
    const patient = {
      vault: {
        fullName: "Ana Sintética",
        cpf: "123.456.789-09",
        birthDate: "1990-01-01",
        phone: null,
      },
      scheduling: [],
      consentPatientRef: "4b1a",
      consent: [],
      notifications: [],
      logMask: "4b1a…",
    };
    const { client } = clientWith(respond(200, patient));

    // Act
    const read = await client.patient("t");

    // Assert
    expect(read.vault.fullName).toBe("Ana Sintética");
  });

  it("devolve o trace quando chega e nada enquanto ele ainda não chegou", async () => {
    // Arrange
    const trace = { traceId, spans: [] };
    const { client, fetch } = clientWith(
      respond(404, { title: "ainda chegando" }),
      respond(200, trace),
    );

    // Act
    const missing = await client.trace("t", traceId);
    const found = await client.trace("t", traceId);

    // Assert
    expect(missing).toBeUndefined();
    expect(found).toEqual(trace);
    expect(String(fetch.mock.calls[1][0])).toBe(
      `https://demo.careflow.test/demo/v1/traces/${traceId}`,
    );
  });

  it("não monta URL com um id de trace que não é hexadecimal", async () => {
    // Arrange
    const { client, fetch } = clientWith();

    // Act
    const call = client.trace("t", "../session");

    // Assert
    await expect(call).rejects.toMatchObject({ reason: "falha" });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("recusa um trace de outro id e propaga outros erros", async () => {
    // Arrange
    const { client } = clientWith(
      respond(200, { traceId: "f".repeat(32), spans: [] }),
      respond(401),
    );

    // Act & Assert
    await expect(client.trace("t", traceId)).rejects.toMatchObject({ reason: "falha" });
    await expect(client.trace("t", traceId)).rejects.toMatchObject({ reason: "expirada" });
  });

  it("encerra a sessão com DELETE", async () => {
    // Arrange
    const { client, fetch } = clientWith(respond(204));

    // Act
    await client.endSession("t");

    // Assert
    expect(fetch.mock.calls[0][1]?.method).toBe("DELETE");
    expect(String(fetch.mock.calls[0][0])).toBe("https://demo.careflow.test/demo/v1/session");
  });
});

describe("maskDigits", () => {
  it.each([
    ["123.456.789-09", "•••••••••09"],
    ["+55 11 98765-4321", "•••••••••••21"],
    ["7", "••"],
  ])("mostra só os dois últimos dígitos de %s", (value, masked) => {
    expect(maskDigits(value)).toBe(masked);
  });
});
