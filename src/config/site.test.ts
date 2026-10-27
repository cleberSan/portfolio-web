import { describe, expect, it } from "vitest";
import { navigation, site, staticRoutes } from "./site";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

describe("site.contact", () => {
  it("usa o mesmo número no texto, no link de telefone e no WhatsApp", () => {
    // Arrange
    const shown = digits(site.contact.phone);

    // Act
    const tel = digits(site.contact.phoneHref);
    const whatsapp = new URL(site.contact.whatsapp);

    // Assert
    expect(tel).toBe(shown);
    expect(whatsapp.host).toBe("wa.me");
    expect(whatsapp.pathname).toBe(`/${shown}`);
  });

  it("abre o WhatsApp com uma saudação pronta", () => {
    // Act
    const text = new URL(site.contact.whatsapp).searchParams.get("text");

    // Assert
    expect(text).toMatch(/^Olá, Cleber!/);
  });

  it("publica um celular brasileiro no formato internacional", () => {
    // Assert
    expect(site.contact.phone).toMatch(/^\+55 \d{2} 9\d{4}-\d{4}$/);
  });
});

describe("navigation", () => {
  it("aponta cada item para uma rota publicada ou para uma seção da home", () => {
    // Assert
    for (const item of navigation) {
      const [path, hash] = item.href.split("#");
      expect(staticRoutes).toContain(path);
      if (hash !== undefined) {
        expect(path).toBe("/");
      }
    }
  });
});
