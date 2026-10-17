import AxeBuilder from "@axe-core/playwright";
import { demoBackend, expect, mockDemoBackend, test } from "./fixtures";

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

  test("mostra os pedidos do titular, o pacote e a eliminação com a cadeia íntegra", async ({
    page,
  }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel#direitos");

    // Act
    await page.getByText("Ver o trace da eliminação").click();

    // Assert
    await expect(
      page.getByRole("heading", { level: 2, name: /Direitos do titular/ }),
    ).toBeVisible();
    await expect(page.getByTestId("situacao-do-pedido")).toHaveText(["Concluído", "Concluído"]);
    await expect(page.getByTestId("caixa-de-entrada").first()).toContainText(
      "seu código para confirmar",
    );
    await expect(page.getByTestId("recursos-fhir")).toContainText("Patient (1)");
    await expect(page.getByTestId("link-do-pacote")).toContainText("recusado na segunda vez");
    await expect(page.getByTestId("leitura-no-cofre")).toContainText("410");
    await expect(page.getByRole("region", { name: "Comprovante de eliminação" })).toBeVisible();
    await expect(
      page.getByRole("region", { name: "Trace da eliminação", exact: true }),
    ).toBeVisible();
  });

  test("abre os traces e logs gravados e mostra o que vem depois", async ({ page }) => {
    // Arrange
    await page.goto("/projetos/careflow/painel");

    // Act
    await page.getByText(/Logs do mesmo trace/).click();
    await page.getByText("Ver o trace da revogação").click();

    // Assert
    await expect(page.getByRole("region", { name: "Logs do trace da reserva" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Trace da revogação" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Em breve" })).toBeVisible();
    await expect(page.getByText("Carga e deploy gradual")).toBeVisible();
  });
});

test.describe("Painel ao vivo", () => {
  const traceId = "0123456789abcdef0123456789abcdef";

  function liveBackend(calls: string[]) {
    return (method: string, path: string) => {
      calls.push(`${method} ${path}`);
      switch (`${method} ${path}`) {
        case "GET /demo/v1/status":
          return { body: { available: true, state: "disponivel" } };
        case "POST /demo/v1/sessions":
          return {
            status: 201,
            body: {
              token: "token-de-teste",
              expiresAt: "2026-10-16T20:15:00Z",
              partition: "isolated-03",
              patientRef: "4b1a",
              bookings: 0,
              maxBookings: 5,
            },
          };
        case "POST /demo/v1/appointments":
          return {
            body: {
              appointmentId: "a1",
              startsAt: "2026-10-23T15:00:00Z",
              traceId,
              attempts: 1,
              refusals: [],
            },
          };
        case `GET /demo/v1/traces/${traceId}`:
          return {
            body: {
              traceId,
              spans: [
                {
                  spanId: "a",
                  parentSpanId: null,
                  service: "careflow-demo",
                  name: "demo book appointment",
                  kind: "Internal",
                  startedAt: "2026-10-16T20:00:00.000Z",
                  durationMs: 120,
                  status: "Unset",
                  attributes: {},
                  events: [],
                },
                {
                  spanId: "b",
                  parentSpanId: "a",
                  service: "careflow-scheduling",
                  name: "POST /v1/appointments",
                  kind: "Server",
                  startedAt: "2026-10-16T20:00:00.010Z",
                  durationMs: 80,
                  status: "Unset",
                  attributes: {},
                  events: [],
                },
              ],
            },
          };
        case "DELETE /demo/v1/session":
          return { status: 204 };
        default:
          return undefined;
      }
    };
  }

  test("com o backend desligado, diz que é replay e mantém os cenários gravados", async ({
    page,
  }) => {
    // Act
    await page.goto("/projetos/careflow/painel");

    // Assert
    await expect(page.getByTestId("modo-do-painel")).toHaveText("replay");
    await expect(page.getByTestId("estado-ao-vivo")).toContainText("desligado agora");
    await expect(page.getByText(/Passo 1 de \d+/)).toBeVisible();
  });

  test("abre uma sessão, marca uma consulta e mostra o trace ao vivo", async ({ page }) => {
    // Arrange
    const calls: string[] = [];
    await mockDemoBackend(page, liveBackend(calls));
    const authorization: (string | undefined)[] = [];
    page.on("request", (request) => {
      if (request.url().startsWith(`${demoBackend}/demo/v1/appointments`)) {
        authorization.push(request.headers()["authorization"]);
      }
    });
    await page.goto("/projetos/careflow/painel");

    // Act
    await page.getByRole("button", { name: "Abrir uma sessão ao vivo" }).click();
    await page.getByRole("button", { name: "Marcar uma consulta" }).click();

    // Assert
    await expect(page.getByTestId("modo-do-painel")).toHaveText("ao vivo");
    await expect(page.getByRole("region", { name: "Trace da reserva ao vivo" })).toBeVisible();
    expect(authorization).toContain("Bearer token-de-teste");

    // Act: encerra
    await page.getByRole("button", { name: "Encerrar a sessão" }).click();

    // Assert
    await expect(page.getByTestId("estado-ao-vivo")).toContainText("Sessão encerrada");
    expect(calls).toContain("DELETE /demo/v1/session");
  });

  test.describe("com o 503 do backend", () => {
    // O navegador registra o 503 no console; ele é o próprio cenário do teste.
    test.use({ allowedBrowserErrors: [/status of 503/] });

    test("se o backend é desligado no meio da sessão, volta para o replay", async ({ page }) => {
      // Arrange
      const calls: string[] = [];
      const live = liveBackend(calls);
      await mockDemoBackend(page, (method, path) =>
        method === "POST" && path === "/demo/v1/appointments"
          ? { status: 503, body: { title: "desligado" } }
          : live(method, path),
      );
      await page.goto("/projetos/careflow/painel");

      // Act
      await page.getByRole("button", { name: "Abrir uma sessão ao vivo" }).click();
      await page.getByRole("button", { name: "Marcar uma consulta" }).click();

      // Assert
      await expect(page.getByTestId("modo-do-painel")).toHaveText("replay");
      await expect(page.getByTestId("estado-ao-vivo")).toContainText("desligado agora");
    });
  });

  for (const colorScheme of ["light", "dark"] as const) {
    test(`não tem violações de acessibilidade no modo ao vivo, tema ${colorScheme}`, async ({
      page,
    }) => {
      // Arrange
      await mockDemoBackend(page, liveBackend([]));
      await page.emulateMedia({ colorScheme });
      await page.goto("/projetos/careflow/painel");
      await page.getByRole("button", { name: "Abrir uma sessão ao vivo" }).click();
      await page.getByRole("button", { name: "Marcar uma consulta" }).click();
      await expect(page.getByRole("region", { name: "Trace da reserva ao vivo" })).toBeVisible();

      // Act
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      // Assert
      expect(results.violations).toEqual([]);
    });
  }
});
