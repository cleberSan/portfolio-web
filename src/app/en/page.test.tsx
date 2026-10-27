import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getSiteText, site, whatsappUrl } from "@/config/site";
import { getCases } from "@/content/cases";
import { getEngineering } from "@/content/engineering";
import { careerYears, getProfile } from "@/content/profile";
import { getLatestPosts } from "@/content/posts";
import { portugueseLeftovers, textOutsidePortuguese } from "@/test-utils/portuguese";
import EnglishHome, { metadata } from "./page";

describe("EnglishHome", () => {
  it("apresenta nome, papel e cidade em inglês", () => {
    // Act
    render(<EnglishHome />);

    // Assert
    expect(screen.getByRole("heading", { level: 1, name: site.name })).toBeInTheDocument();
    expect(screen.getByText(`${getSiteText("en").role}.`)).toBeInTheDocument();
    expect(screen.getByText("Portfolio · São Paulo, Brazil")).toBeInTheDocument();
    expect(screen.getByText(`${careerYears()} years`)).toBeInTheDocument();
  });

  it("não deixa nenhum texto em português fora dos trechos marcados com lang", () => {
    // Act
    const { container } = render(<EnglishHome />);

    // Assert
    expect(portugueseLeftovers(textOutsidePortuguese(container))).toEqual([]);
  });

  it("marca os posts do diário, que existem só em português, com lang pt-BR", () => {
    // Act
    render(<EnglishHome />);

    // Assert
    const section = screen.getByRole("region", { name: "Build log" });
    for (const post of getLatestPosts(2)) {
      const title = within(section).getByRole("heading", { level: 3, name: post.title });
      expect(title.closest('[lang="pt-BR"]')).not.toBeNull();
    }
    expect(
      within(section).getByRole("link", { name: "All posts (in Portuguese)" }),
    ).toHaveAttribute("hreflang", "pt-BR");
  });

  it("organiza a página nas seções do menu em inglês", () => {
    // Act
    const { container } = render(<EnglishHome />);

    // Assert
    const ids = [...container.querySelectorAll("section[id]")].map((section) => section.id);
    expect(ids).toEqual([
      "cases",
      "expertise",
      "about",
      "skills",
      "experience",
      "build-log",
      "contact",
    ]);
  });

  it("mostra os cases, a atuação e os princípios em inglês", () => {
    // Act
    render(<EnglishHome />);

    // Assert
    const casesSection = screen.getByRole("region", { name: "Real problems I've solved" });
    expect(within(casesSection).getAllByRole("article")).toHaveLength(getCases("en").length);
    expect(within(casesSection).getAllByText("Problem")).toHaveLength(getCases("en").length);
    const { services, principles } = getEngineering("en");
    const expertise = screen.getByRole("region", { name: "What I work with" });
    expect(within(expertise).getAllByRole("heading", { level: 3 })).toHaveLength(services.length);
    const about = screen.getByRole("region", { name: "Who I am" });
    expect(
      within(within(about).getByRole("list", { name: "Principles" })).getAllByRole("listitem"),
    ).toHaveLength(principles.length);
    expect(within(about).getByRole("list", { name: "CI gates" })).toBeInTheDocument();
  });

  it("conta a trajetória em inglês, com destaques que abrem sem JavaScript", () => {
    // Act
    render(<EnglishHome />);

    // Assert
    const section = screen.getByRole("region", { name: "Experience and education" });
    const profile = getProfile("en");
    expect(section.querySelectorAll("details")).toHaveLength(profile.experiences.length);
    expect(within(section).getAllByText(profile.experiences[0].role).length).toBeGreaterThan(0);
    expect(within(section).getByText(/^Oct 2019 – Oct 2026 · 7 years and 1 month/)).toBeVisible();
    expect(within(section).getByText(profile.education[0].course)).toBeInTheDocument();
  });

  it("leva o Sobre para a versão em inglês e o contato para o WhatsApp em inglês", () => {
    // Act
    render(<EnglishHome />);

    // Assert
    expect(screen.getByRole("link", { name: "Read more about me" })).toHaveAttribute(
      "href",
      "/en/about",
    );
    expect(screen.getByRole("link", { name: "See the cases" })).toHaveAttribute("href", "#cases");
    expect(screen.getByRole("link", { name: "How I work" })).toHaveAttribute("href", "#about");
    const contact = screen.getByRole("region", { name: "Let's talk" });
    expect(within(contact).getByRole("link", { name: /^WhatsApp/ })).toHaveAttribute(
      "href",
      whatsappUrl("en"),
    );
  });

  it("não fala em busca de vaga e não publica e-mail", () => {
    // Act
    const { container } = render(<EnglishHome />);

    // Assert
    expect(container.textContent).not.toMatch(/job|hiring|open to work|available|resume|@gmail/i);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("declara /en como canônica e liga as duas versões", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/en");
    expect(metadata.alternates?.languages).toMatchObject({ "pt-BR": "/", en: "/en" });
  });
});
