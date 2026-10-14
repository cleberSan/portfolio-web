import { test as base, expect } from "@playwright/test";

type Options = {
  /** Erros esperados pelo teste, como o 404 do documento numa página inexistente. */
  allowedBrowserErrors: RegExp[];
};

type Fixtures = {
  /** Erros de console e de página (inclusive violações de CSP) coletados durante o teste. */
  browserErrors: string[];
};

/**
 * Todo teste falha se o navegador registrar erro: uma violação de CSP aparece como erro
 * de console, então um script bloqueado não passa despercebido.
 */
export const test = base.extend<Options & Fixtures>({
  allowedBrowserErrors: [[], { option: true }],
  browserErrors: [
    async ({ page, allowedBrowserErrors }, provide) => {
      const errors: string[] = [];
      const record = (text: string) => {
        if (!allowedBrowserErrors.some((pattern) => pattern.test(text))) {
          errors.push(text);
        }
      };
      page.on("console", (message) => {
        if (message.type() === "error") {
          record(message.text());
        }
      });
      page.on("pageerror", (error) => record(error.message));

      await provide(errors);

      expect(errors, "o navegador não deve registrar erros").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
