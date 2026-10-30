import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getSiteText, site } from "@/config/site";
import { getProfile } from "@/content/profile";
import { portugueseLeftovers, textOutsidePortuguese } from "@/test-utils/portuguese";
import EnglishAboutPage, { metadata } from "./page";

describe("EnglishAboutPage", () => {
  it("tem um único h1, em inglês", () => {
    // Act
    render(<EnglishAboutPage />);

    // Assert
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "About" })).toBeInTheDocument();
  });

  it("não deixa nenhum texto em português fora dos nomes próprios", () => {
    // Act
    const { container } = render(<EnglishAboutPage />);

    // Assert
    expect(portugueseLeftovers(textOutsidePortuguese(container))).toEqual([]);
  });

  it("publica dados estruturados de pessoa em inglês", () => {
    // Act
    const { container } = render(<EnglishAboutPage />);

    // Assert
    const script = container.querySelector('script[type="application/ld+json"]');
    const data = JSON.parse(script?.textContent ?? "{}");
    expect(data).toMatchObject({
      "@type": "Person",
      name: site.name,
      jobTitle: getSiteText("en").role,
      homeLocation: { name: "São Paulo, Brazil" },
    });
    expect(data.url).toMatch(/\/en\/about$/);
    expect(data).not.toHaveProperty("worksFor");
  });

  it("conta a trajetória e a formação em inglês", () => {
    // Act
    render(<EnglishAboutPage />);

    // Assert
    const experience = screen.getByRole("region", { name: "Experience" });
    expect(within(experience).getAllByRole("heading", { level: 3 })).toHaveLength(
      getProfile("en").experiences.length,
    );
    const education = screen.getByRole("region", { name: "Education and certifications" });
    expect(within(education).getByText("Limited working proficiency")).toBeInTheDocument();
  });

  it("avisa que CareFlow e diário estão em português", () => {
    // Act
    render(<EnglishAboutPage />);

    // Assert
    const section = screen.getByRole("region", { name: "Work in the open" });
    expect(within(section).getByRole("link", { name: "CareFlow" })).toHaveAttribute(
      "hreflang",
      "pt-BR",
    );
    expect(within(section).getByRole("link", { name: "build log" })).toHaveAttribute(
      "href",
      "/diario",
    );
    expect(section).toHaveTextContent("Both are written in Portuguese.");
  });

  it("aponta WhatsApp, telefone, LinkedIn e GitHub como contato", () => {
    // Act
    render(<EnglishAboutPage />);

    // Assert
    const section = screen.getByRole("region", { name: "Contact" });
    expect(within(section).getByRole("link", { name: /^Phone/ })).toHaveAttribute(
      "href",
      site.contact.phoneHref,
    );
    expect(within(section).getByRole("link", { name: /^LinkedIn/ })).toHaveAttribute(
      "href",
      site.links.linkedin,
    );
  });

  it("declara /en/about como canônica e o Sobre como alternativa", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/en/about");
    expect(metadata.alternates?.languages).toMatchObject({ "pt-BR": "/sobre" });
  });
});
