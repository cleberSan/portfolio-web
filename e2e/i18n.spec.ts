import { expect, test } from "./fixtures";

test.describe("idioma das páginas", () => {
  for (const [path, lang] of [
    ["/", "pt-BR"],
    ["/sobre", "pt-BR"],
    ["/diario", "pt-BR"],
    ["/en", "en"],
    ["/en/about", "en"],
  ] as const) {
    test(`${path} declara lang="${lang}" no documento`, async ({ page }) => {
      // Act
      await page.goto(path);

      // Assert
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
    });
  }

  test("a página em inglês declara as duas versões para os buscadores", async ({ page }) => {
    // Act
    await page.goto("/en/about");

    // Assert
    await expect(page.locator('link[rel="alternate"][hreflang="pt-BR"]')).toHaveAttribute(
      "href",
      /\/sobre$/,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute(
      "href",
      /\/en\/about$/,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "en_US");
  });
});

test.describe("seletor de idioma", () => {
  test("troca o Sobre pelo About e volta", async ({ page }) => {
    // Arrange
    await page.goto("/sobre");

    // Act
    await page.getByRole("list", { name: "Idioma" }).getByRole("link", { name: "EN" }).click();

    // Assert
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.getByRole("heading", { level: 1, name: "About" })).toBeVisible();

    // Act
    await page.getByRole("list", { name: "Language" }).getByRole("link", { name: "PT-BR" }).click();

    // Assert
    await expect(page).toHaveURL(/\/sobre$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  });

  test("de uma página que só existe em português, leva à home em inglês", async ({ page }) => {
    // Arrange
    await page.goto("/diario");

    // Act
    await page.getByRole("list", { name: "Idioma" }).getByRole("link", { name: "EN" }).click();

    // Assert
    await expect(page).toHaveURL(/\/en$/);
    await expect(
      page.getByRole("heading", { level: 2, name: "Real problems I've solved" }),
    ).toBeVisible();
  });

  test.describe("sem JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("o seletor continua funcionando, porque é feito só de links", async ({ page }) => {
      // Arrange
      await page.goto("/en");

      // Act
      await page
        .getByRole("list", { name: "Language" })
        .getByRole("link", { name: "PT-BR" })
        .click();

      // Assert
      await expect(page).toHaveURL(/\/$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    });
  });
});

test.describe("404 em inglês", () => {
  test.use({ allowedBrowserErrors: [/status of 404 \(Not Found\)/] });

  test("uma rota inexistente abaixo de /en responde 404 com atalho para o inglês", async ({
    page,
  }) => {
    // Act
    const response = await page.goto(`/en/nao-existe-${Date.now()}`);

    // Assert
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
    await expect(page.getByRole("link", { name: "Go to the English home page" })).toHaveAttribute(
      "href",
      "/en",
    );
  });
});

test("o sitemap liga as versões em português e em inglês", async ({ request }) => {
  // Act
  const body = await (await request.get("/sitemap.xml")).text();

  // Assert
  expect(body).toContain("/en/about</loc>");
  expect(body).toMatch(/hreflang="en"\s+href="[^"]*\/en\/about"/);
  expect(body).toMatch(/hreflang="pt-BR"\s+href="[^"]*\/sobre"/);
});
