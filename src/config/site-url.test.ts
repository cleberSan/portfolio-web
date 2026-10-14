import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it.each([undefined, "", "   "])("usa localhost sem marcar como configurada para %j", (raw) => {
    // Act
    const result = resolveSiteUrl(raw);

    // Assert
    expect(result.url.href).toBe("http://localhost:3000/");
    expect(result.configured).toBe(false);
  });

  it("aceita uma origem https", () => {
    // Act
    const result = resolveSiteUrl("https://cleber.dev");

    // Assert
    expect(result.url.origin).toBe("https://cleber.dev");
    expect(result.configured).toBe(true);
  });

  it("ignora espaços nas pontas", () => {
    // Act
    const result = resolveSiteUrl("  https://cleber.dev/  ");

    // Assert
    expect(result.url.origin).toBe("https://cleber.dev");
  });

  it.each(["http://localhost:3000", "http://127.0.0.1:3100"])(
    "aceita http apenas em loopback: %s",
    (raw) => {
      // Act
      const result = resolveSiteUrl(raw);

      // Assert
      expect(result.configured).toBe(true);
    },
  );

  it.each(["http://cleber.dev", "ftp://cleber.dev", "javascript:alert(1)"])(
    "recusa protocolo inseguro: %s",
    (raw) => {
      // Act
      const act = () => resolveSiteUrl(raw);

      // Assert
      expect(act).toThrow(/https/);
    },
  );

  it("recusa texto que não é URL", () => {
    // Act
    const act = () => resolveSiteUrl("cleber.dev");

    // Assert
    expect(act).toThrow("SITE_URL não é uma URL válida.");
  });

  it.each([
    "https://cleber.dev/blog",
    "https://cleber.dev/?utm=x",
    "https://cleber.dev/#topo",
    "https://admin:segredo@cleber.dev",
  ])("recusa valores além da origem: %s", (raw) => {
    // Act
    const act = () => resolveSiteUrl(raw);

    // Assert
    expect(act).toThrow(/apenas a origem/);
  });

  it("não repete o valor recebido na mensagem de erro", () => {
    // Act
    const act = () => resolveSiteUrl("https://admin:segredo@cleber.dev");

    // Assert
    expect(act).toThrow(
      expect.objectContaining({ message: expect.not.stringContaining("segredo") }),
    );
  });
});
