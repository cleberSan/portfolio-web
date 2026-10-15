import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Trace } from "@/content/painel";
import { describeEvent, TraceWaterfall } from "./trace-waterfall";

const trace: Trace = {
  traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
  spans: [
    {
      spanId: "a",
      parentSpanId: null,
      service: "careflow-scheduling",
      name: "POST /v1/appointments",
      kind: "server",
      startedAt: "2026-10-15T12:00:00.000Z",
      durationMs: 40,
      status: "error",
      attributes: {},
      events: [],
    },
    {
      spanId: "b",
      parentSpanId: "a",
      service: "careflow-notifications",
      name: "deliver notification",
      kind: "internal",
      startedAt: "2026-10-15T12:00:00.010Z",
      durationMs: 20,
      status: "unset",
      attributes: {},
      events: [{ name: "fallback", attributes: { from: "whatsapp", to: "sms" } }],
    },
  ],
};

describe("TraceWaterfall", () => {
  it("mostra cada span com serviço, início, duração, erro e eventos, numa região rolável", () => {
    // Act
    render(<TraceWaterfall trace={trace} label="Trace de teste" />);

    // Assert
    const region = screen.getByRole("region", { name: "Trace de teste" });
    expect(region).toHaveAttribute("tabindex", "0");
    const rows = within(region).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(rows[1]).toHaveTextContent("Agenda");
    expect(rows[1]).toHaveTextContent("(erro)");
    expect(rows[2]).toHaveTextContent("Notificações");
    expect(rows[2]).toHaveTextContent("fallback: whatsapp → sms");
    expect(rows[2]).toHaveTextContent("10 ms");
    expect(screen.getByText(/2 spans em 2 serviços/)).toBeInTheDocument();
  });
});

describe("describeEvent", () => {
  it("descreve fallback e circuito, e repete o nome nos demais", () => {
    expect(describeEvent("circuit open", { channel: "whatsapp" })).toBe(
      "circuit breaker do whatsapp: open",
    );
    expect(describeEvent("circuit closed", {})).toBe("circuit breaker: closed");
    expect(describeEvent("fallback", {})).toBe("fallback");
    expect(describeEvent("confirmed-by-idempotency-key", {})).toBe("confirmed-by-idempotency-key");
  });
});
