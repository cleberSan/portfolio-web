import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "./fixtures";
import { allPages } from "./routes";

for (const path of allPages) {
  test.describe(`página ${path}`, () => {
    test("carrega com um único h1 e título do site", async ({ page }) => {
      // Act
      const response = await page.goto(path);

      // Assert
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page).toHaveTitle(/Cleber/);
    });

    test("não rola na horizontal", async ({ page }) => {
      // Act
      await page.goto(path);

      // Assert
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });

    test("não publica e-mail pessoal", async ({ page }) => {
      // Act
      await page.goto(path);

      // Assert
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      expect(await page.locator("body").innerText()).not.toMatch(/@gmail\.com/i);
    });

    for (const colorScheme of ["light", "dark"] as const) {
      test(`não tem violações de acessibilidade WCAG 2.2 AA no tema ${colorScheme}`, async ({
        page,
      }) => {
        // Arrange
        await page.emulateMedia({ colorScheme });
        await page.goto(path);

        // Act
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .analyze();

        // Assert
        expect(results.violations).toEqual([]);
      });
    }
  });
}
