import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageLinks } from "./language-links";

describe("LanguageLinks", () => {
  it("leva do Sobre ao About, com o idioma do destino declarado", () => {
    // Act
    render(<LanguageLinks locale="pt-BR" pathname="/sobre" />);

    // Assert
    const list = screen.getByRole("list", { name: "Idioma" });
    expect(list).toBeInTheDocument();
    const english = screen.getByRole("link", { name: "EN" });
    expect(english).toHaveAttribute("href", "/en/about");
    expect(english).toHaveAttribute("hreflang", "en");
    expect(english).toHaveAttribute("lang", "en");
  });

  it("marca o idioma atual como texto, sem link para a própria página", () => {
    // Act
    render(<LanguageLinks locale="en" pathname="/en/about" />);

    // Assert
    expect(screen.getByRole("list", { name: "Language" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "EN" })).not.toBeInTheDocument();
    expect(screen.getByText("EN")).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "PT-BR" })).toHaveAttribute("href", "/sobre");
  });

  it("de uma página só em português, leva à home em inglês", () => {
    // Act
    render(<LanguageLinks locale="pt-BR" pathname="/diario/fase-0-fundacao" />);

    // Assert
    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en");
  });

  it("sem a rota atual (fallback do prerender), leva à home do outro idioma", () => {
    // Act
    render(<LanguageLinks locale="en" />);

    // Assert
    expect(screen.getByRole("link", { name: "PT-BR" })).toHaveAttribute("href", "/");
  });
});
