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
  test("por teclado, escolhe uma região e abre o cartão dela", async ({ page }) => {
    // Arrange
    await page.goto("/ecossistema");
    const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
    await expect(mapa).not.toHaveAttribute("data-modo", "estatico");
    const agentes = mapa.getByRole("button", { name: "Agentes", exact: true });

    // Act
    await agentes.focus();
    await page.keyboard.press("Enter");

    // Assert
    await expect(agentes).toHaveAttribute("aria-pressed", "true");
    const cartao = mapa.getByRole("article", { name: "Agentes", exact: true });
    await expect(cartao).toBeVisible();
    await expect(cartao.getByRole("link", { name: /^Fluxo de uma fase/ })).toBeVisible();
  });

  test.describe("com movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" });

    // spec 0001 CA-08
    test("nada anima e a reprodução anda passo a passo", async ({ page }) => {
      // Arrange
      await page.goto("/ecossistema");
      const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
      await expect(mapa).toHaveAttribute("data-modo", "2d");

      // Act: nada anda sozinho.
      await page.waitForTimeout(1500);

      // Assert
      await expect(mapa).toHaveAttribute("data-estado", "pausado");
      await expect(mapa.getByRole("button", { name: "Pausar" })).toHaveCount(0);
      await expect(mapa.getByTestId("situacao")).toHaveText(/^Passo 0 de \d+$/);

      // Act
      await mapa.getByRole("button", { name: "Próximo passo" }).click();

      // Assert
      await expect(mapa.getByTestId("situacao")).toHaveText(/^Passo 1 de \d+$/);
      await expect(mapa.getByRole("list", { name: /^Registro/ })).toContainText(
        "Demo (BFF do Painel)",
      );
    });
  });

  test.describe("sem WebGL", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (
          this: HTMLCanvasElement,
          tipo: string,
          ...resto: unknown[]
        ) {
          return /webgl/.test(tipo)
            ? null
            : (original as (...args: unknown[]) => unknown).call(this, tipo, ...resto);
        } as typeof original;
      });
    });

    // spec 0001 CA-09
    test("mostra o mapa 2D sem erro no console", async ({ page }) => {
      // Act
      await page.goto("/ecossistema");

      // Assert (o fixture falha o teste se houver erro de console)
      const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
      await expect(mapa).toHaveAttribute("data-modo", "2d");
      await expect(mapa.getByTestId("mapa-2d")).toBeVisible();
      await expect(mapa).toContainText("mapa em 2D neste navegador");
      await mapa.getByRole("button", { name: "CareFlow", exact: true }).click();
      await expect(mapa.getByRole("article", { name: "CareFlow", exact: true })).toBeVisible();
    });
  });

  // spec 0001 CA-11
  test.fixme("a biblioteca 3D só carrega em /ecossistema (window.__THREE__)", () => {});

  // spec 0001 CA-20
  test.fixme("toda requisição da página é da própria origem", () => {});
});
