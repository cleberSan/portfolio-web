import { expect, test } from "./fixtures";

test("o link de pular conteúdo é o primeiro foco e leva ao conteúdo principal", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "Navegação por teclado é testada no desktop.");
  test.skip(browserName !== "chromium");

  // Arrange
  await page.goto("/");

  // Act
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");

  // Assert
  await expect(page.locator("main")).toBeFocused();
});

test("a navegação marca a seção atual, inclusive dentro de um post", async ({ page }) => {
  // Arrange
  await page.goto("/diario");
  const nav = page.getByRole("navigation", { name: "Principal" });

  // Act
  await page
    .getByRole("link", { name: /Fase 2/ })
    .first()
    .click();

  // Assert
  await expect(page).toHaveURL(/\/diario\/fase-2-agenda-sem-dupla-reserva$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Fase 2");
  await expect(nav.getByRole("link", { name: "Diário" })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Sobre" })).not.toHaveAttribute("aria-current");
});

test("a home leva ao projeto CareFlow", async ({ page }) => {
  // Arrange
  await page.goto("/");

  // Act
  await page.getByRole("link", { name: "Ver arquitetura e roadmap" }).click();

  // Assert
  await expect(page).toHaveURL(/\/projetos\/careflow$/);
  await expect(page.getByRole("note")).toContainText("dados sintéticos");
});

test("o menu leva às seções da home a partir de outra página", async ({ page }) => {
  // Arrange
  await page.goto("/sobre");
  const nav = page.getByRole("navigation", { name: "Principal" });

  // Act
  await nav.getByRole("link", { name: "Cases" }).click();

  // Assert
  await expect(page).toHaveURL(/\/#cases$/);
  await expect(
    page.getByRole("heading", { level: 2, name: "Problemas reais que resolvi" }),
  ).toBeInViewport();
});

test.describe("sem JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("os destaques de cada cargo abrem na home", async ({ page }) => {
    // Arrange
    await page.goto("/#trajetoria");
    const stack = page.getByRole("list", { name: "Stack na Exactaworks" });
    await expect(stack).toBeHidden();

    // Act
    await page.getByText("Destaques e stack").first().click();

    // Assert
    await expect(stack).toBeVisible();
  });
});

// O currículo saiu do site em 2026-10-27; quem tiver o link antigo cai no Sobre, que conta a trajetória.
test("o endereço antigo do currículo leva ao Sobre", async ({ page }) => {
  // Act
  const response = await page.goto("/curriculo");

  // Assert
  await expect(page).toHaveURL(/\/sobre$/);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1, name: "Sobre" })).toBeVisible();
});

test("a página do CareFlow leva à demonstração", async ({ page }) => {
  // Arrange
  await page.goto("/projetos/careflow");

  // Act
  await page.getByRole("link", { name: "Ver demonstração" }).click();

  // Assert
  await expect(page).toHaveURL(/\/projetos\/careflow\/painel$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("o vídeo do fluxo carrega da própria origem, sem esbarrar na CSP", async ({ page }) => {
  // Arrange
  const blocked: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy/i.test(message.text())) blocked.push(message.text());
  });
  await page.goto("/projetos/careflow");
  const video = page.locator("#video ~ div video");
  await expect(video).toBeVisible();

  // Act
  await video.evaluate((element: HTMLVideoElement) => {
    element.preload = "metadata";
    element.load();
  });

  // Assert
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState))
    .toBeGreaterThanOrEqual(1);
  const seconds = await video.evaluate((element: HTMLVideoElement) => element.duration);
  expect(seconds).toBeGreaterThan(50);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  expect(blocked).toEqual([]);
});

test("links externos abrem em nova aba sem window.opener", async ({ page }) => {
  // Arrange
  await page.goto("/sobre");

  // Act
  const external = page.locator('a[target="_blank"]');

  // Assert
  expect(await external.count()).toBeGreaterThan(0);
  for (const link of await external.all()) {
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveAttribute("href", /^https:\/\//);
  }
});
