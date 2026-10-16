import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DemoError, type DemoClient } from "@/lib/demo-client";
import { LivePanel } from "./live-panel";

const traceId = "0123456789abcdef0123456789abcdef";

const session = {
  token: "token-opaco",
  expiresAt: "2026-10-16T20:15:00Z",
  partition: "isolated-01",
  patientRef: "4b1a",
  bookings: 0,
  maxBookings: 5,
};

const trace = {
  traceId,
  spans: [
    {
      spanId: "a",
      parentSpanId: null,
      service: "careflow-demo",
      name: "demo book appointment",
      kind: "Internal",
      startedAt: "2026-10-16T20:00:00.000Z",
      durationMs: 120,
      status: "Unset",
      attributes: {},
      events: [],
    },
  ],
};

function fakeClient(overrides: Partial<DemoClient> = {}): DemoClient {
  return {
    status: vi.fn().mockResolvedValue({ available: true, state: "disponivel" }),
    openSession: vi.fn().mockResolvedValue(session),
    book: vi.fn().mockResolvedValue({
      appointmentId: "a1",
      startsAt: "2026-10-23T15:00:00Z",
      traceId,
      attempts: 2,
    }),
    patient: vi.fn().mockResolvedValue({
      vault: {
        fullName: "Ana Sintética",
        cpf: "123.456.789-09",
        birthDate: "1990-01-01",
        phone: "+55 11 98765-4321",
      },
      scheduling: [{ id: "a1", status: "Booked" }],
      consent: [
        {
          purpose: "scheduling",
          legalBasis: "consent",
          status: "granted",
          grantedAt: "",
          revokedAt: null,
        },
      ],
      notifications: [],
      logMask: "4b1a…",
    }),
    trace: vi.fn().mockResolvedValueOnce(undefined).mockResolvedValue(trace),
    endSession: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

const state = () => screen.getByTestId("estado-ao-vivo");
const mode = () => screen.getByTestId("modo-do-painel");

describe("LivePanel", () => {
  it("sem backend configurado, fica no replay sem chamar nada", () => {
    // Act
    render(<LivePanel />);

    // Assert
    expect(mode()).toHaveTextContent("replay");
    expect(state()).toHaveTextContent("ainda não está configurado");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([
    ["desligado", { available: false, state: "desligado" }, "desligado agora"],
    ["lotado", { available: true, state: "lotado" }, "em uso agora"],
  ] as const)("com o backend %s, cai no replay e diz por quê", async (_, status, message) => {
    // Arrange
    const client = fakeClient({ status: vi.fn().mockResolvedValue(status) });

    // Act
    render(<LivePanel client={client} />);

    // Assert
    expect(mode()).toHaveTextContent("conferindo");
    await waitFor(() => expect(mode()).toHaveTextContent("replay"));
    expect(state()).toHaveTextContent(message);
    expect(state()).toHaveTextContent("gravação do CI");
  });

  it("se o status falha, cai no replay", async () => {
    // Arrange
    const client = fakeClient({ status: vi.fn().mockRejectedValue(new TypeError("rede")) });

    // Act
    render(<LivePanel client={client} />);

    // Assert
    await waitFor(() => expect(state()).toHaveTextContent("não respondeu"));
  });

  it("abre a sessão, marca a consulta e mostra o trace quando ele chega", async () => {
    // Arrange
    const client = fakeClient();
    render(<LivePanel client={client} traceRetryMs={0} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Marcar uma consulta" }));

    // Assert
    expect(await screen.findByRole("region", { name: "Trace da reserva ao vivo" })).toBeVisible();
    expect(mode()).toHaveTextContent("ao vivo");
    expect(state()).toHaveTextContent("isolated-01");
    expect(screen.getByTestId("reserva-ao-vivo")).toHaveTextContent("na tentativa 2");
    expect(client.book).toHaveBeenCalledWith("token-opaco");
    expect(client.trace).toHaveBeenCalledTimes(2);
  });

  it("avisa quando o trace não chega a tempo", async () => {
    // Arrange
    const client = fakeClient({ trace: vi.fn().mockResolvedValue(undefined) });
    render(<LivePanel client={client} traceRetryMs={0} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Marcar uma consulta" }));

    // Assert
    expect(await screen.findByText(/O trace ainda não chegou/)).toBeVisible();
  });

  it("mostra o paciente em cada serviço com CPF e telefone mascarados", async () => {
    // Arrange
    render(<LivePanel client={fakeClient()} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ver o paciente em cada serviço" }));

    // Assert
    const region = await screen.findByRole("region", {
      name: "O paciente ao vivo em cada serviço",
    });
    expect(region).toHaveTextContent("Ana Sintética");
    expect(region).toHaveTextContent("•••••••••09");
    expect(region).not.toHaveTextContent("123.456.789-09");
    expect(region).not.toHaveTextContent("98765");
    expect(region).toHaveTextContent("scheduling (granted)");
  });

  it("encerra a sessão e volta a oferecer uma nova", async () => {
    // Arrange
    const client = fakeClient();
    render(<LivePanel client={client} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Encerrar a sessão" }));

    // Assert
    await waitFor(() => expect(state()).toHaveTextContent("Sessão encerrada"));
    expect(client.endSession).toHaveBeenCalledWith("token-opaco");
    expect(screen.getByRole("button", { name: "Abrir uma sessão ao vivo" })).toBeEnabled();
  });

  it("com a sessão expirada, oferece abrir outra", async () => {
    // Arrange
    const client = fakeClient({
      book: vi.fn().mockRejectedValue(new DemoError("expirada", "A sessão terminou.")),
    });
    render(<LivePanel client={client} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Marcar uma consulta" }));

    // Assert
    await waitFor(() => expect(state()).toHaveTextContent("A sessão terminou"));
    expect(mode()).toHaveTextContent("disponível");
  });

  it("no limite de ações, continua na sessão e avisa", async () => {
    // Arrange
    const client = fakeClient({
      book: vi.fn().mockRejectedValue(new DemoError("limite", "Esta sessão chegou ao limite.")),
    });
    render(<LivePanel client={client} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Marcar uma consulta" }));

    // Assert
    await waitFor(() => expect(state()).toHaveTextContent("chegou ao limite"));
    expect(mode()).toHaveTextContent("ao vivo");
  });

  it.each([
    ["desligado no meio da sessão", new DemoError("indisponivel", "503"), "desligado agora"],
    ["erro inesperado", new Error("x"), "não respondeu"],
  ])("com %s, cai no replay", async (_, error, message) => {
    // Arrange
    const client = fakeClient({ patient: vi.fn().mockRejectedValue(error) });
    render(<LivePanel client={client} />);

    // Act
    fireEvent.click(await screen.findByRole("button", { name: "Abrir uma sessão ao vivo" }));
    fireEvent.click(await screen.findByRole("button", { name: "Ver o paciente em cada serviço" }));

    // Assert
    await waitFor(() => expect(mode()).toHaveTextContent("replay"));
    expect(state()).toHaveTextContent(message);
  });

  it("com a URL do backend, cria o próprio cliente", async () => {
    // Arrange
    const fetch = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(JSON.stringify({ available: false, state: "desligado" })));

    // Act
    render(<LivePanel backendUrl="https://demo.careflow.test" />);

    // Assert
    await waitFor(() => expect(mode()).toHaveTextContent("replay"));
    expect(String(fetch.mock.calls[0][0])).toBe("https://demo.careflow.test/demo/v1/status");
    fetch.mockRestore();
  });
});
