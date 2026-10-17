import { test as base, expect, type Page, type Route } from "@playwright/test";

/**
 * Backend da demonstração que o build dos testes conhece (`NEXT_PUBLIC_CAREFLOW_DEMO_URL` no CI). Ele não existe:
 * toda chamada para ele é respondida pelo próprio teste, e o padrão é o interruptor desligado, para as páginas
 * caírem no replay sem erro de rede.
 */
export const demoBackend = "https://demo.careflow.test";

type DemoReply = { status?: number; body?: unknown };

/** Responde as rotas do backend da demonstração como o Demo faria, com CORS só para o site. */
export async function mockDemoBackend(
  page: Page,
  handler: (method: string, path: string) => DemoReply | undefined,
): Promise<void> {
  await page.route(`${demoBackend}/**`, async (route: Route) => {
    const request = route.request();
    const origin = request.headers()["origin"] ?? "";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, content-type, x-careflow-demo",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
      Vary: "Origin",
    };
    if (request.method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: cors });
      return;
    }

    const path = new URL(request.url()).pathname;
    const reply = handler(request.method(), path) ?? {
      status: 404,
      body: { title: "não encontrado" },
    };
    await route.fulfill({
      status: reply.status ?? 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: reply.body === undefined ? "" : JSON.stringify(reply.body),
    });
  });
}

type Options = {
  /** Erros esperados pelo teste, como o 404 do documento numa página inexistente. */
  allowedBrowserErrors: RegExp[];
};

type Fixtures = {
  /** Erros de console e de página (inclusive violações de CSP) coletados durante o teste. */
  browserErrors: string[];
  /** Backend da demonstração desligado, salvo quando o teste registra outra resposta. */
  demoSwitchedOff: void;
};

/**
 * Todo teste falha se o navegador registrar erro: uma violação de CSP aparece como erro
 * de console, então um script bloqueado não passa despercebido.
 */
export const test = base.extend<Options & Fixtures>({
  allowedBrowserErrors: [[], { option: true }],
  demoSwitchedOff: [
    async ({ page }, provide) => {
      await mockDemoBackend(page, (method, path) =>
        method === "GET" && path === "/demo/v1/status"
          ? { body: { available: false, state: "desligado" } }
          : { status: 503, body: { title: "desligado" } },
      );
      await provide();
    },
    { auto: true },
  ],
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
