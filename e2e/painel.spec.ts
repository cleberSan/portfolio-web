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

  test("mostra as triagens com o que saiu para o modelo e a decisão do profissional", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel#triagem");

    // Act
    await page.getByText("Ver o trace da primeira triagem").click();

    // Assert
    await expect(
      page.getByRole("heading", { level: 2, name: /Triagem com IA e o profissional/ }),
    ).toBeVisible();
    await expect(page.getByTestId("enviado-ao-modelo").first()).toContainText("[nome]");
    await expect(page.getByTestId("decisao")).toHaveCount(4);
    await expect(page.getByText(/Confirmou|Corrigiu para/).first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Trace da triagem", exact: true })).toBeVisible();
  });

  test("abre os traces e logs gravados e mostra a fase 8 como em breve", async ({ page }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel");

    // Act
    await page.getByText(/Logs do mesmo trace/).click();
    await page.getByText("Ver o trace da revogação").click();

    // Assert
    await expect(page.getByRole("region", { name: "Logs do trace da reserva" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Trace da revogação" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Em breve" })).toBeVisible();
    await expect(page.getByText("Fase 8: direitos do titular")).toBeVisible();
  });
});
