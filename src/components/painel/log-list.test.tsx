import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LogList } from "./log-list";

describe("LogList", () => {
  it("lista cada linha com hora, serviço e severidade quando houver", () => {
    // Act
    render(
      <LogList
        label="Logs"
        logs={[
          {
            at: "2026-10-15T12:00:00.1234567Z",
            service: "careflow-audit",
            severity: "Information",
            message: "Entrada gravada",
          },
          {
            at: "2026-10-15T12:00:01.0000000Z",
            service: "careflow-x",
            severity: "",
            message: "Sem severidade",
          },
        ]}
      />,
    );

    // Assert
    const items = within(screen.getByRole("region", { name: "Logs" })).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("12:00:00.123 · Auditoria · Information");
    expect(items[0]).toHaveTextContent("Entrada gravada");
    expect(items[1]).toHaveTextContent("12:00:01.000 · careflow-x");
    expect(items[1]).not.toHaveTextContent("· ·");
  });
});
