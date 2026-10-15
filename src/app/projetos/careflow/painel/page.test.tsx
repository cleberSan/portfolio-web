import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { recording } from "@/content/painel";
import PainelPage, { metadata } from "./page";

describe("PainelPage", () => {
  it("diz quando e de qual commit veio a gravação", () => {
    render(<PainelPage />);

    const note = screen.getByRole("note");
    expect(note).toHaveTextContent(recording.commit.slice(0, 7));
    expect(note).toHaveTextContent(/Nada nesta página é simulado/);
  });

  it("mostra os cinco cenários e só a fase 8 como em breve", () => {
    render(<PainelPage />);

    for (const name of [
      "1. Uma reserva, um trace",
      "2. O mesmo paciente em cada serviço",
      "3. Revogação do consentimento",
      "4. WhatsApp fora do ar",
      "5. Triagem com IA e o profissional no circuito",
      "Em breve",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.queryByText("Fase 7: triagem com IA")).not.toBeInTheDocument();
    expect(screen.getByText("Fase 8: direitos do titular")).toBeInTheDocument();
  });

  it("mostra cada triagem com o que saiu da clínica e a decisão do profissional", () => {
    render(<PainelPage />);

    const steps = recording.triage.steps;
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(steps.length);
    expect(screen.getAllByTestId("decisao")).toHaveLength(steps.length);
    expect(screen.getAllByText("Nada saiu da clínica.").length).toBe(
      steps.filter((step) => step.submitted.sentToModel === null).length,
    );
    expect(screen.getByText(steps[0].submitted.sentToModel!)).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Triagens na trilha de auditoria" }),
    ).toBeInTheDocument();
  });

  it("mostra o paciente completo só no cofre, com CPF mascarado, e a cadeia íntegra", () => {
    render(<PainelPage />);

    expect(screen.getAllByText(recording.patient.vault.fullName)).toHaveLength(1);
    expect(screen.getAllByText(/Resumo na auditoria: [0-9a-f]{12}…/).length).toBeGreaterThan(0);
    expect(screen.getByText(`CPF ${recording.patient.vault.cpf}`)).toBeInTheDocument();
    expect(screen.getAllByText(/íntegra, \d+ entradas verificadas/)).toHaveLength(2);
  });

  it("usa a URL canônica do painel", () => {
    expect(metadata.alternates?.canonical).toBe("/projetos/careflow/painel");
  });
});
