import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ResilienceStep } from "@/content/painel";
import { ResilienceReplay } from "./resilience-replay";

function step(
  action: string,
  fault: string | null,
  circuit: string,
  sentVia?: string,
): ResilienceStep {
  return {
    atMs: 100,
    action,
    channels: {
      partition: "isolated-01",
      channels: [{ channel: "whatsapp", fault, faultExpiresAt: null, circuit }],
    },
    booking: null,
    notification: sentVia
      ? {
          appointmentId: "a",
          kind: "Confirmation",
          status: "Sent",
          sentVia,
          notSentReason: null,
          attempts: [
            { round: 1, channel: "WhatsApp", outcome: "CircuitOpen" },
            { round: 1, channel: sentVia, outcome: "Delivered" },
          ],
        }
      : null,
  };
}

const steps = [
  step("inicio", null, "Closed"),
  step("whatsapp-fora", "Unavailable", "Closed"),
  step("reserva", "Unavailable", "Open", "Sms"),
];

describe("ResilienceReplay", () => {
  it("começa no primeiro passo com os botões de voltar desabilitados", () => {
    render(<ResilienceReplay steps={steps} />);

    expect(screen.getByText(/Passo 1 de 3/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Passo anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Recomeçar" })).toBeDisabled();
    expect(screen.getByTestId("canal")).toHaveTextContent("Nenhum aviso neste passo");
  });

  it("avança até o fallback por SMS com o circuito aberto e volta ao início", () => {
    // Arrange
    render(<ResilienceReplay steps={steps} />);
    const next = screen.getByRole("button", { name: "Próximo passo" });

    // Act
    fireEvent.click(next);
    const fault = screen.getByText("Fora do ar (falha injetada)");
    fireEvent.click(next);

    // Assert
    expect(fault).toBeInTheDocument();
    expect(screen.getByTestId("circuito")).toHaveTextContent("Aberto");
    expect(screen.getByTestId("canal")).toHaveTextContent("Enviado por SMS");
    expect(
      screen.getByText(/WhatsApp \(pulado, circuito aberto\), então SMS \(entregue\)/),
    ).toBeInTheDocument();
    expect(next).toBeDisabled();
    expect(screen.getAllByRole("listitem")[2]).toHaveAttribute("aria-current", "step");

    fireEvent.click(screen.getByRole("button", { name: "Passo anterior" }));
    expect(screen.getByText(/Passo 2 de 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Recomeçar" }));
    expect(screen.getByText(/Passo 1 de 3/)).toBeInTheDocument();
  });
});
