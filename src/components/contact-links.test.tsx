import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site, whatsappUrl } from "@/config/site";
import { ContactLinks, displayUrl } from "./contact-links";

describe("displayUrl", () => {
  it.each([
    ["https://www.linkedin.com/in/cleber-costa-santos/", "linkedin.com/in/cleber-costa-santos"],
    ["https://github.com/cleberSan", "github.com/cleberSan"],
  ])("mostra %s como %s", (href, text) => {
    // Assert
    expect(displayUrl(href)).toBe(text);
  });
});

describe("ContactLinks", () => {
  it("lista WhatsApp, telefone, LinkedIn e GitHub em cartões", () => {
    // Act
    render(<ContactLinks locale="pt-BR" />);

    // Assert
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      site.contact.whatsapp,
      site.contact.phoneHref,
      site.links.linkedin,
      site.links.github,
    ]);
  });

  it("abre o WhatsApp em nova aba, mas liga direto pelo telefone", () => {
    // Act
    render(<ContactLinks locale="pt-BR" />);

    // Assert
    expect(screen.getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /^Telefone/ })).not.toHaveAttribute("target");
  });

  it("nunca oferece e-mail", () => {
    // Act
    const { container } = render(<ContactLinks locale="pt-BR" />);

    // Assert
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});

describe("ContactLinks em inglês", () => {
  it("rotula o telefone em inglês e abre o WhatsApp com a saudação em inglês", () => {
    // Act
    render(<ContactLinks locale="en" />);

    // Assert
    expect(screen.getByRole("list", { name: "Contact" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Phone/ })).toHaveAttribute(
      "href",
      site.contact.phoneHref,
    );
    expect(screen.getByRole("link", { name: /^WhatsApp.*opens in a new tab$/ })).toHaveAttribute(
      "href",
      whatsappUrl("en"),
    );
  });
});
