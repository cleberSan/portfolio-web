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

  it("mostra os quatro cenários e as fases 7 e 8 como em breve", () => {
    render(<PainelPage />);

    for (const name of [
      "1. Uma reserva, um trace",
      "2. O mesmo paciente em cada serviço",
      "3. Revogação do consentimento",
      "4. WhatsApp fora do ar",
      "Em breve",
    ]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(screen.getByText("Fase 7: triagem com IA")).toBeInTheDocument();
    expect(screen.getByText("Fase 8: direitos do titular")).toBeInTheDocument();
  });

  it("mostra o paciente completo só no cofre, com CPF mascarado, e a cadeia íntegra", () => {
    render(<PainelPage />);

    expect(screen.getAllByText(recording.patient.vault.fullName)).toHaveLength(1);
    expect(screen.getByText(`CPF ${recording.patient.vault.cpf}`)).toBeInTheDocument();
    expect(screen.getByText(/íntegra, \d+ entradas verificadas/)).toBeInTheDocument();
  });

  it("usa a URL canônica do painel", () => {
    expect(metadata.alternates?.canonical).toBe("/projetos/careflow/painel");
  });
});
