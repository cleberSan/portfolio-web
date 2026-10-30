import { describe, expect, it } from "vitest";
import { portugueseLeftovers } from "@/test-utils/portuguese";
import { getNavigation, getSiteText, navigation, site, staticRoutes, whatsappUrl } from "./site";

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

describe("versão em inglês", () => {
  it("abre o WhatsApp com a saudação em inglês e o mesmo número", () => {
    // Act
    const url = new URL(whatsappUrl("en"));

    // Assert
    expect(url.pathname).toBe(new URL(site.contact.whatsapp).pathname);
    expect(url.searchParams.get("text")).toMatch(/^Hi, Cleber!/);
  });

  it("traduz papel, descrição, focos e setores, com as mesmas quantidades", () => {
    // Act
    const english = getSiteText("en");

    // Assert
    expect(getSiteText("pt-BR").role).toBe(site.role);
    expect(english.role).toBe("Senior Full-Stack Software Engineer");
    expect(english.sectors).toHaveLength(site.sectors.length);
    expect(english.focusAreas).toHaveLength(site.focusAreas.length);
    expect(
      [english.role, english.description, ...english.sectors, ...english.focusAreas].flatMap(
        portugueseLeftovers,
      ),
    ).toEqual([]);
  });

  it("o menu em inglês só leva a páginas em inglês", () => {
    // Assert
    expect(getNavigation("pt-BR")).toBe(navigation);
    for (const item of getNavigation("en")) {
      const [path] = item.href.split("#");
      expect(staticRoutes).toContain(path);
      expect(path).toMatch(/^\/en(\/|$)/);
    }
  });
});
