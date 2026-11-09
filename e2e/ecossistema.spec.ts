import { expect, test } from "./fixtures";

// Esqueleto da spec 0001 (docs/specs/0001-ecossistema-em-3d): cada teste ganha corpo na tarefa que
// cobre o critério, depois do OK da spec. Por padrão os testes usam movimento reduzido; só o de
// CA-04 liga a animação, para não pesar o CI com WebGL por software.
test.describe("Ecossistema em 3D", () => {
  test.describe("sem JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    // spec 0001 CA-01
    test("mostra as cinco regiões, os links e as perguntas com respostas", async ({ page }) => {
      // Act
      const response = await page.goto("/ecossistema");

      // Assert
      expect(response?.status()).toBe(200);
      const regioes = page.getByRole("region", { name: "As cinco regiões" });
      await expect(regioes.getByRole("article")).toHaveCount(5);
      for (const nome of [
        "CareFlow",
        "Agentes",
        "portfolio-web",
        "Lojinha Da Lua",
        "claude-works",
      ]) {
        await expect(regioes.getByRole("heading", { level: 3, name: nome })).toBeVisible();
      }
      await expect(regioes.getByRole("link", { name: "Estudo de caso" }).first()).toHaveAttribute(
        "href",
        "/projetos/careflow",
      );

      const sinapse = page.getByRole("region", { name: "Pergunte ao Sinapse" });
      const pergunta = sinapse.locator("details").filter({ hasText: "O que é o CareFlow?" });
      await pergunta.locator("summary").click();
      await expect(pergunta.getByText(/projeto vitrine/)).toBeVisible();
      await expect(pergunta.getByRole("link", { name: "Estudo de caso" })).toBeVisible();

      // spec 0001 CA-03
      await expect(page.getByRole("note")).toContainText("gravação do CI de");
      expect(await page.locator("main").innerText()).not.toMatch(/ao vivo|tempo real/i);
    });
  });

  // spec 0001 CA-04
  test.fixme("com WebGL e movimento permitido, carrega a cena e anima", () => {});

  // spec 0001 CA-05
  test.fixme("por teclado, escolhe uma região e abre o cartão dela", () => {});

  // spec 0001 CA-08
  test.fixme("com movimento reduzido, nada anima e a reprodução anda passo a passo", () => {});

  // spec 0001 CA-09
  test.fixme("sem WebGL, mostra o mapa 2D sem erro no console", () => {});

  // spec 0001 CA-11
  test.fixme("a biblioteca 3D só carrega em /ecossistema (window.__THREE__)", () => {});

  // spec 0001 CA-20
  test.fixme("toda requisição da página é da própria origem", () => {});
});
