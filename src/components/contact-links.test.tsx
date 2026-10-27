import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
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
    render(<ContactLinks />);

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
    render(<ContactLinks />);

    // Assert
    expect(screen.getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("link", { name: /^Telefone/ })).not.toHaveAttribute("target");
  });

  it("no currículo mostra o telefone uma vez só, valendo para o WhatsApp", () => {
    // Act
    render(<ContactLinks layout="inline" />);

    // Assert
    expect(screen.getAllByText(site.contact.phone)).toHaveLength(1);
    expect(screen.getByRole("link", { name: /^Telefone e WhatsApp/ })).toHaveAttribute(
      "href",
      site.contact.phoneHref,
    );
  });

  it("nunca oferece e-mail", () => {
    // Act
    const { container } = render(<ContactLinks />);

    // Assert
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});
