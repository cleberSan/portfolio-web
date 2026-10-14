import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SmartLink } from "./smart-link";

describe("SmartLink", () => {
  it("mantém rotas internas na mesma aba", () => {
    // Arrange
    render(<SmartLink href="/diario">Diário</SmartLink>);

    // Act
    const link = screen.getByRole("link", { name: "Diário" });

    // Assert
    expect(link).toHaveAttribute("href", "/diario");
    expect(link).not.toHaveAttribute("target");
  });

  it("mantém âncoras na mesma página", () => {
    // Arrange
    render(<SmartLink href="#detalhes">Detalhes</SmartLink>);

    // Act
    const link = screen.getByRole("link", { name: "Detalhes" });

    // Assert
    expect(link).toHaveAttribute("href", "#detalhes");
    expect(link).not.toHaveAttribute("target");
  });

  it("abre links https em nova aba", () => {
    // Arrange
    render(<SmartLink href="https://github.com/cleberSan">GitHub</SmartLink>);

    // Act
    const link = screen.getByRole("link", { name: /^GitHub/ });

    // Assert
    expect(link).toHaveAttribute("target", "_blank");
  });

  it.each(["//example.com", "http://example.com", "javascript:alert(1)", undefined])(
    "recusa destino inseguro: %j",
    (href) => {
      // Act
      const act = () => render(<SmartLink href={href}>x</SmartLink>);

      // Assert
      expect(act).toThrow("ExternalLink aceita apenas URLs https.");
    },
  );
});
