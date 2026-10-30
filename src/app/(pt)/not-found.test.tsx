import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound", () => {
  it("explica o erro e oferece caminhos de volta", () => {
    // Act
    render(<NotFound />);

    // Assert
    expect(
      screen.getByRole("heading", { level: 1, name: "Página não encontrada" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para a página inicial" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Ver o diário de bordo" })).toHaveAttribute(
      "href",
      "/diario",
    );
    const english = screen.getByRole("link", { name: "Go to the English home page" });
    expect(english).toHaveAttribute("href", "/en");
    expect(english.closest('[lang="en"]')).not.toBeNull();
  });
});
