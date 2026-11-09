import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

// Testes da spec 0001 (docs/specs/0001-ecossistema-em-3d). Por padrão usam movimento reduzido, que
// mostra o mapa 2D; só os da cena 3D ligam a animação, para não pesar o CI com WebGL por software.
test.describe("Ecossistema em 3D", () => {
  test.use({ reducedMotion: "reduce" });

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

  test.describe("com WebGL e movimento permitido", () => {
    test.use({ reducedMotion: "no-preference" });

    async function abrirCena(page: Page) {
      await page.goto("/ecossistema");
      const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
      await expect(mapa).toHaveAttribute("data-modo", "3d");
      const canvas = mapa.getByTestId("palco-3d").locator("canvas");
      await expect(canvas).toBeVisible();
      // Com a cena pronta, o mapa 2D sai da tela.
      await expect(mapa.getByTestId("mapa-2d")).toHaveCount(0);
      return { mapa, canvas };
    }

    // spec 0001 CA-04, CA-07
    test("carrega a cena, anima e para na pausa", async ({ page }) => {
      // Arrange
      const { mapa, canvas } = await abrirCena(page);
      await expect(mapa).toHaveAttribute("data-estado", "animando");

      // Act + Assert: o cérebro gira sozinho.
      const primeiro = await canvas.screenshot();
      await page.waitForTimeout(600);
      expect(Buffer.compare(primeiro, await canvas.screenshot())).not.toBe(0);

      // Act
      await mapa.getByRole("button", { name: "Pausar" }).click();

      // Assert: parado, nenhum quadro novo.
      await expect(mapa).toHaveAttribute("data-estado", "pausado");
      await page.waitForTimeout(300);
      const parado = await canvas.screenshot();
      await page.waitForTimeout(600);
      expect(Buffer.compare(parado, await canvas.screenshot())).toBe(0);
    });

    // spec 0001 CA-05
    test("clicar numa região da cena abre o cartão dela", async ({ page }) => {
      // Arrange: pausada logo de início, a cena quase não girou.
      const { mapa, canvas } = await abrirCena(page);
      await mapa.getByRole("button", { name: "Pausar" }).click();
      const caixa = await canvas.boundingBox();
      if (!caixa) {
        throw new Error("canvas sem caixa");
      }

      // Act: o hemisfério esquerdo é o CareFlow.
      await canvas.click({ position: { x: caixa.width * 0.34, y: caixa.height * 0.5 } });

      // Assert
      await expect(mapa.getByRole("button", { name: "CareFlow", exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(mapa.getByRole("article", { name: "CareFlow", exact: true })).toBeVisible();
    });

    // spec 0001 CA-09
    test("se o WebGL cair, troca para o mapa 2D sem erro no console", async ({ page }) => {
      // Arrange
      const { mapa } = await abrirCena(page);

      // Act
      await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('[data-testid="palco-3d"] canvas');
        const contexto = canvas?.getContext("webgl2") ?? canvas?.getContext("webgl");
        contexto?.getExtension("WEBGL_lose_context")?.loseContext();
      });

      // Assert (o fixture falha o teste se houver erro de console)
      await expect(mapa).toHaveAttribute("data-modo", "2d");
      await expect(mapa.getByTestId("mapa-2d")).toBeVisible();
      await expect(mapa.getByTestId("palco-3d")).toHaveCount(0);
    });

    // spec 0001 CA-11
    test("a biblioteca 3D só carrega em /ecossistema", async ({ page }) => {
      for (const rota of ["/", "/projetos"]) {
        // Act
        await page.goto(rota);
        await page.waitForLoadState("networkidle");

        // Assert
        expect(await page.evaluate(() => "__THREE__" in window), rota).toBe(false);
      }

      // Act
      await abrirCena(page);

      // Assert
      expect(
        await page.evaluate(() => (window as Window & { __THREE__?: string }).__THREE__),
      ).toMatch(/^\d+$/);
    });
  });

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

  // spec 0001 CA-12, CA-14, CA-17
  test("enviar uma pergunta responde sem requisição nem gravação no navegador", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/ecossistema");
    const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
    await expect(mapa).not.toHaveAttribute("data-modo", "estatico");
    const campo = mapa.getByLabel("Sua pergunta");
    await campo.scrollIntoViewIfNeeded();
    await page.waitForLoadState("networkidle");
    const requisicoes: string[] = [];
    page.on("request", (requisicao) => requisicoes.push(requisicao.url()));
    await page.evaluate(() => {
      const janela = window as unknown as { __gravacoes: number };
      janela.__gravacoes = 0;
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (this: Storage, chave: string, valor: string) {
        janela.__gravacoes += 1;
        return original.call(this, chave, valor);
      };
    });

    // Act
    await campo.fill("Como vocês seguem a LGPD?");
    await campo.press("Enter");

    // Assert
    await expect(mapa.getByTestId("anuncio")).toContainText("cofre do paciente");
    await expect(
      mapa.getByTestId("resposta").getByRole("link", { name: /ADR-0004/ }),
    ).toBeVisible();
    await expect(mapa.getByRole("button", { name: "CareFlow", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(requisicoes).toEqual([]);
    expect(
      await page.evaluate(() => (window as unknown as { __gravacoes: number }).__gravacoes),
    ).toBe(0);
    expect(page.url()).not.toContain("?");
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`com cartão e resposta abertos, segue WCAG 2.2 AA no tema ${colorScheme}`, async ({
      page,
    }) => {
      // Arrange
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      await page.goto("/ecossistema");
      const mapa = page.getByRole("region", { name: "Mapa do ecossistema" });
      await mapa.getByRole("button", { name: "Lojinha Da Lua", exact: true }).click();
      await mapa.getByRole("button", { name: "O que é o CareFlow?" }).click();
      await mapa.getByRole("button", { name: "Próximo passo" }).click();
      await expect(mapa.getByTestId("anuncio")).toContainText("projeto vitrine");

      // Act
      const resultado = await new AxeBuilder({ page })
        .include('[data-modo="2d"]')
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      // Assert
      expect(resultado.violations).toEqual([]);
    });
  }

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
    test.use({ reducedMotion: "no-preference" });

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

  // spec 0001 CA-20
  test.fixme("toda requisição da página é da própria origem", () => {});
});
