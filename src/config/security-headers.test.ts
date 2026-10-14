import { describe, expect, it } from "vitest";
import { securityHeaders } from "./security-headers";

const headerValue = (key: string) => securityHeaders.find((header) => header.key === key)?.value;

describe("securityHeaders", () => {
  it.each([
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "Cross-Origin-Opener-Policy",
  ])("define o cabeçalho %s", (key) => {
    // Act
    const value = headerValue(key);

    // Assert
    expect(value).toBeTruthy();
  });

  it("não declara o mesmo cabeçalho duas vezes", () => {
    // Arrange
    const keys = securityHeaders.map((header) => header.key.toLowerCase());

    // Act
    const unique = new Set(keys);

    // Assert
    expect(unique.size).toBe(keys.length);
  });

  it("impede que o site seja embutido em iframes de terceiros", () => {
    // Act
    const csp = headerValue("Content-Security-Policy");

    // Assert
    expect(csp).toContain("frame-ancestors 'none'");
    expect(headerValue("X-Frame-Options")).toBe("DENY");
  });

  it("exige HSTS de pelo menos um ano", () => {
    // Arrange
    const hsts = headerValue("Strict-Transport-Security") ?? "";

    // Act
    const maxAge = Number(/max-age=(\d+)/.exec(hsts)?.[1] ?? 0);

    // Assert
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000);
  });
});
