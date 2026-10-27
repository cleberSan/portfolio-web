import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { navigation } from "@/config/site";
import { isActivePath, NavLinks } from "./nav-links";

describe("isActivePath", () => {
  it.each([
    ["/diario", "/diario", true],
    ["/diario/fase-0-fundacao", "/diario", true],
    ["/diario-antigo", "/diario", false],
    ["/", "/diario", false],
    [undefined, "/diario", false],
    ["", "/diario", false],
  ])("pathname %j em %s => %s", (pathname, href, expected) => {
    // Act
    const active = isActivePath(pathname, href);

    // Assert
    expect(active).toBe(expected);
  });
});

describe("NavLinks", () => {
  it("renderiza todos os itens de navegação", () => {
    // Act
    render(<NavLinks items={navigation} />);

    // Assert
    expect(screen.getAllByRole("link")).toHaveLength(navigation.length);
  });

  it("marca apenas a seção atual com aria-current", () => {
    // Act
    render(<NavLinks items={navigation} pathname="/diario/fase-0-fundacao" />);

    // Assert
    expect(screen.getByRole("link", { name: "Diário" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Sobre" })).not.toHaveAttribute("aria-current");
  });

  it("nunca marca as âncoras da home como página atual", () => {
    // Act
    render(<NavLinks items={navigation} pathname="/" />);

    // Assert
    for (const label of ["Cases", "Serviços", "Trajetória", "Contato"]) {
      expect(screen.getByRole("link", { name: label })).not.toHaveAttribute("aria-current");
    }
  });

  it("não marca nada sem pathname", () => {
    // Act
    render(<NavLinks items={navigation} />);

    // Assert
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});
