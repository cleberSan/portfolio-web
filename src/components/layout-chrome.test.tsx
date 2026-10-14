import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { SiteFooter } from "./site-footer";
import { mainContentId, SkipLink } from "./skip-link";

describe("SkipLink", () => {
  it("aponta para o conteúdo principal", () => {
    // Act
    render(<SkipLink />);

    // Assert
    expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
      "href",
      `#${mainContentId}`,
    );
  });
});

describe("SiteFooter", () => {
  it("aponta para o GitHub e para o código do site", () => {
    // Act
    render(<SiteFooter />);

    // Assert
    expect(screen.getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
      "href",
      site.links.github,
    );
    expect(screen.getByRole("link", { name: /^Código deste site/ })).toHaveAttribute(
      "href",
      site.links.source,
    );
  });
});
