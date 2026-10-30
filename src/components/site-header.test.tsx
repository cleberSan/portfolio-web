import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { site } from "@/config/site";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/diario" }));

describe("SiteHeader", () => {
  it("leva o nome do site para a home", () => {
    // Act
    render(<SiteHeader locale="pt-BR" />);

    // Assert
    expect(screen.getByRole("link", { name: site.name })).toHaveAttribute("href", "/");
  });

  it("expõe a navegação principal com a seção atual marcada", () => {
    // Act
    render(<SiteHeader locale="pt-BR" />);

    // Assert
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute("href", "/#cases");
    expect(screen.getByRole("link", { name: "Diário" })).toHaveAttribute("aria-current", "page");
  });
});

describe("SiteHeader em inglês", () => {
  it("leva o nome à home em inglês e usa o menu em inglês", () => {
    // Act
    render(<SiteHeader locale="en" />);

    // Assert
    expect(screen.getByRole("link", { name: site.name })).toHaveAttribute("href", "/en");
    const nav = screen.getByRole("navigation", { name: "Main" });
    expect(within(nav).getByRole("link", { name: "About" })).toHaveAttribute("href", "/en/about");
    expect(within(nav).queryByRole("link", { name: "Diário" })).not.toBeInTheDocument();
  });

  it("oferece a troca de idioma a partir da página atual", () => {
    // Act
    render(<SiteHeader locale="pt-BR" />);

    // Assert: a rota simulada é /diario, que só existe em português.
    const languages = screen.getByRole("list", { name: "Idioma" });
    expect(within(languages).getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en");
  });
});
