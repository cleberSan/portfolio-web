import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { lojinha, lojinhaAdrUrl } from "@/content/lojinha";
import LojinhaPage, { metadata } from "./page";

describe("LojinhaPage", () => {
  it("deixa claro que a marca e o conteúdo são da loja", () => {
    // Act
    render(<LojinhaPage />);

    // Assert
    expect(screen.getByRole("note")).toHaveTextContent(/pertencem a ela/);
  });

  it("leva ao site publicado e ao código, em nova aba", () => {
    // Act
    render(<LojinhaPage />);

    // Assert
    const site = screen.getByRole("link", { name: /^Ver o site/ });
    const code = screen.getByRole("link", { name: /^Ver código/ });
    expect(site).toHaveAttribute("href", lojinha.site);
    expect(code).toHaveAttribute("href", lojinha.repository);
    for (const link of [site, code]) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("liga cada decisão ao seu ADR", () => {
    // Act
    render(<LojinhaPage />);

    // Assert
    const section = screen.getByRole("region", { name: "Decisões" });
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(lojinha.decisions.length);
    lojinha.decisions.forEach((decision, index) => {
      const item = items[index]!;
      expect(within(item).getByRole("heading", { level: 3 })).toHaveTextContent(decision.title);
      expect(
        within(item).getByRole("link", { name: new RegExp(`^ADR-${decision.adr.slice(0, 4)}`) }),
      ).toHaveAttribute("href", lojinhaAdrUrl(decision.adr));
    });
    expect(screen.getByRole("link", { name: /^Todas as decisões/ })).toHaveAttribute(
      "href",
      lojinha.adrs,
    );
  });

  it("mostra o que o site faz e os números do projeto", () => {
    // Act
    render(<LojinhaPage />);

    // Assert
    for (const feature of lojinha.features) {
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    }
    const numbers = screen.getByRole("region", { name: "Em números" });
    for (const indicator of lojinha.indicators) {
      expect(within(numbers).getByText(indicator.value)).toBeInTheDocument();
    }
  });

  it("usa /projetos/lojinha-da-lua como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/projetos/lojinha-da-lua");
  });
});
