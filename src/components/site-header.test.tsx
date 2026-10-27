import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { site } from "@/config/site";
import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/diario" }));

describe("SiteHeader", () => {
  it("leva o nome do site para a home", () => {
    // Act
    render(<SiteHeader />);

    // Assert
    expect(screen.getByRole("link", { name: site.name })).toHaveAttribute("href", "/");
  });

  it("expõe a navegação principal com a seção atual marcada", () => {
    // Act
    render(<SiteHeader />);

    // Assert
    const nav = screen.getByRole("navigation", { name: "Principal" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cases" })).toHaveAttribute("href", "/#cases");
    expect(screen.getByRole("link", { name: "Diário" })).toHaveAttribute("aria-current", "page");
  });
});
