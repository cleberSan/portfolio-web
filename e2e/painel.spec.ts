import { expect, test } from "./fixtures";

test.describe("Painel de Privacidade e Resiliência", () => {
  test("reproduz a queda do WhatsApp: fallback para SMS, circuito abre e fecha", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel#whatsapp");
    const next = page.getByRole("button", { name: "Próximo passo" });
    const channel = page.getByTestId("canal");
    const circuit = page.getByTestId("circuito");
    const seen: { channel: string; circuit: string }[] = [];

    // Act: percorre a gravação passo a passo, como o visitante.
    await expect(page.getByText(/Passo 1 de \d+/)).toBeVisible();
    while (await next.isEnabled()) {
      await next.click();
      seen.push({
        channel: (await channel.textContent()) ?? "",
        circuit: (await circuit.textContent()) ?? "",
      });
    }

    // Assert
    expect(seen.some((s) => s.channel === "Enviado por SMS")).toBe(true);
    expect(seen.some((s) => s.circuit === "Aberto")).toBe(true);
    expect(seen.at(-1)).toEqual({ channel: "Enviado por WhatsApp", circuit: "Fechado" });
    await expect(page.getByText(/WhatsApp derrubado/).first()).toBeVisible();
  });

  test("os controles da reprodução funcionam pelo teclado", async ({ page }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel");
    const next = page.getByRole("button", { name: "Próximo passo" });

    // Act
    await next.focus();
    await page.keyboard.press("Enter");

    // Assert
    await expect(page.getByText(/Passo 2 de \d+/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Recomeçar" })).toBeEnabled();
  });

  test("abre os traces e logs gravados e mostra as fases 7 e 8 como em breve", async ({ page }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel");

    // Act
    await page.getByText(/Logs do mesmo trace/).click();
    await page.getByText("Ver o trace da revogação").click();

    // Assert
    await expect(page.getByRole("region", { name: "Logs do trace da reserva" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Trace da revogação" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Em breve" })).toBeVisible();
    await expect(page.getByText("Fase 7: triagem com IA")).toBeVisible();
  });
});
