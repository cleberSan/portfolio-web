import { expect, test } from "./fixtures";
import { allPages } from "./routes";

test.describe("cabeçalhos de segurança", () => {
  test("a resposta HTML traz CSP, HSTS e demais proteções, sem X-Powered-By", async ({
    request,
  }) => {
    // Act
    const response = await request.get("/");
    const headers = response.headers();

    // Assert
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).not.toContain("unsafe-eval");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("páginas inexistentes", () => {
  // O navegador registra o 404 do próprio documento como erro de console.
  test.use({ allowedBrowserErrors: [/status of 404 \(Not Found\)/] });

  test("um post desconhecido responde 404 já na primeira requisição", async ({ page }) => {
    // Act
    const response = await page.goto(`/diario/nao-existe-${Date.now()}`);

    // Assert
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página não encontrada");
  });

  test("uma rota desconhecida responde 404 com a página do site", async ({ page }) => {
    // Act
    const response = await page.goto("/rota-que-nao-existe");

    // Assert
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Ir para a página inicial" })).toBeVisible();
  });
});

test.describe("SEO", () => {
  test("robots.txt bloqueia rastreamento fora da produção", async ({ request }) => {
    // Act
    const body = await (await request.get("/robots.txt")).text();

    // Assert
    expect(body).toContain("Disallow: /");
  });

  test("sitemap.xml lista os posts do diário", async ({ request }) => {
    // Act
    const response = await request.get("/sitemap.xml");
    const body = await response.text();

    // Assert
    expect(response.headers()["content-type"]).toContain("xml");
    expect(body).toContain("/diario/fase-0-fundacao</loc>");
    expect(body).toContain("/diario/fase-2-agenda-sem-dupla-reserva</loc>");
    expect(body).toContain("/diario/fase-3-cofre-do-paciente</loc>");
  });

  test("um post declara URL canônica, Open Graph de artigo e imagem gerada", async ({
    page,
    request,
  }) => {
    // Act
    await page.goto("/diario/fase-0-fundacao");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const image = await request.get(new URL(ogImage ?? "", page.url()).pathname);

    // Assert
    expect(canonical).toMatch(/\/diario\/fase-0-fundacao$/);
    expect(ogType).toBe("article");
    expect(image.status()).toBe(200);
    expect(image.headers()["content-type"]).toBe("image/png");
  });

  for (const path of allPages) {
    test(`${path} publica uma imagem Open Graph que existe`, async ({ page, request }) => {
      // Act
      await page.goto(path);
      const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
      const image = await request.get(new URL(ogImage ?? "", page.url()).pathname);

      // Assert
      expect(ogImage).toBeTruthy();
      expect(image.status()).toBe(200);
      expect(image.headers()["content-type"]).toBe("image/png");
    });
  }

  test("um post publica dados estruturados de BlogPosting", async ({ page }) => {
    // Act
    await page.goto("/diario/fase-2-agenda-sem-dupla-reserva");
    const json = await page.locator('script[type="application/ld+json"]').textContent();

    // Assert
    expect(JSON.parse(json ?? "{}")).toMatchObject({
      "@type": "BlogPosting",
      datePublished: "2026-10-14",
    });
  });
});
