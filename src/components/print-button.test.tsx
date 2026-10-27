import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrintButton } from "./print-button";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PrintButton", () => {
  it("abre a impressão do navegador", () => {
    // Arrange
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<PrintButton />);

    // Act
    fireEvent.click(screen.getByRole("button", { name: "Imprimir ou salvar em PDF" }));

    // Assert
    expect(print).toHaveBeenCalledOnce();
  });
});
