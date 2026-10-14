import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExternalLink } from "./external-link";

describe("ExternalLink", () => {
  it("abre em nova aba sem expor window.opener", () => {
    // Arrange
    render(<ExternalLink href="https://github.com/cleberSan">GitHub</ExternalLink>);

    // Act
    const link = screen.getByRole("link", { name: /^GitHub/ });

    // Assert
    expect(link).toHaveAttribute("href", "https://github.com/cleberSan");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("avisa leitores de tela que abre em nova aba", () => {
    // Arrange
    render(<ExternalLink href="https://github.com/cleberSan">GitHub</ExternalLink>);

    // Act
    const link = screen.getByRole("link");

    // Assert
    expect(link).toHaveAccessibleName("GitHub, abre em nova aba");
  });

  it.each(["javascript:alert(1)", "http://example.com", "/interno", "//example.com", ""])(
    "rejeita a URL %j",
    (href) => {
      // Act
      const act = () => render(<ExternalLink href={href}>x</ExternalLink>);

      // Assert
      expect(act).toThrow("ExternalLink aceita apenas URLs https.");
    },
  );

  it("repassa atributos extras como className", () => {
    // Arrange
    render(
      <ExternalLink href="https://example.com" className="underline">
        Exemplo
      </ExternalLink>,
    );

    // Act
    const link = screen.getByRole("link", { name: /^Exemplo/ });

    // Assert
    expect(link).toHaveClass("underline");
  });
});
