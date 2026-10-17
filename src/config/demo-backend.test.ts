import { describe, expect, it } from "vitest";
import { resolveDemoBackend } from "./demo-backend";

describe("resolveDemoBackend", () => {
  it.each([undefined, "", "   "])("sem valor (%j), não há backend ao vivo", (value) => {
    // Act
    const backend = resolveDemoBackend(value);

    // Assert
    expect(backend).toBeUndefined();
  });

  it("aceita a origem https, com ou sem barra no fim", () => {
    // Act
    const backend = resolveDemoBackend(" https://careflow-demo.duckdns.org/ ");

    // Assert
    expect(backend?.origin).toBe("https://careflow-demo.duckdns.org");
  });

  it.each([
    ["não é URL", "careflow-demo.duckdns.org", /URL válida/],
    ["http", "http://careflow-demo.duckdns.org", /https/],
    ["caminho", "https://careflow-demo.duckdns.org/demo/v1", /apenas a origem/],
    ["query", "https://careflow-demo.duckdns.org/?x=1", /apenas a origem/],
    ["credenciais", "https://user:senha@careflow-demo.duckdns.org", /apenas a origem/],
  ])("recusa %s sem repetir o valor", (_, value, message) => {
    // Act
    const resolve = () => resolveDemoBackend(value);

    // Assert
    expect(resolve).toThrow(message);
    expect(resolve).not.toThrow(/senha|duckdns/);
  });
});
