import { render, screen } from "@testing-library/react";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
// Fora de componente o "hook" é só uma função que devolve o mapa; o alias evita o falso positivo do lint.
import { useMDXComponents as getMDXComponents } from "./mdx-components";

const components = getMDXComponents() as Record<string, ComponentType<Record<string, unknown>>>;

describe("useMDXComponents", () => {
  it.each(["h2", "h3", "p", "ul", "ol", "blockquote", "code", "pre"])(
    "estiliza <%s> sem perder o conteúdo",
    (tag) => {
      // Arrange
      const Component = components[tag];

      // Act
      const { container } = render(<Component>conteúdo</Component>);

      // Assert
      const element = container.querySelector(tag);
      expect(element).toHaveTextContent("conteúdo");
      expect(element?.className).not.toBe("");
    },
  );

  it("torna blocos de código focáveis para rolagem por teclado", () => {
    // Arrange
    const Pre = components.pre;

    // Act
    const { container } = render(<Pre>código</Pre>);

    // Assert
    expect(container.querySelector("pre")).toHaveAttribute("tabindex", "0");
  });

  it("renderiza a linha horizontal", () => {
    // Arrange
    const Hr = components.hr;

    // Act
    const { container } = render(<Hr />);

    // Assert
    expect(container.querySelector("hr")).toBeInTheDocument();
  });

  it("mantém links internos na mesma aba", () => {
    // Arrange
    const A = components.a;

    // Act
    render(<A href="/diario">Diário</A>);

    // Assert
    expect(screen.getByRole("link", { name: "Diário" })).not.toHaveAttribute("target");
  });

  it("recusa links inseguros no conteúdo", () => {
    // Arrange
    const A = components.a;

    // Act
    const act = () => render(<A href="javascript:alert(1)">x</A>);

    // Assert
    expect(act).toThrow("ExternalLink aceita apenas URLs https.");
  });
});
