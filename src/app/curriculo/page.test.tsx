import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { profile } from "@/content/profile";
import { stackGroups } from "@/content/stack";
import CurriculoPage, { metadata } from "./page";

describe("CurriculoPage", () => {
  it("tem um único h1 com o nome", () => {
    // Act
    render(<CurriculoPage />);

    // Assert
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: site.name })).toBeInTheDocument();
  });

  it("traz contato, disponibilidade e o botão de salvar em PDF", () => {
    // Act
    render(<CurriculoPage />);

    // Assert
    expect(screen.getByRole("link", { name: /^Telefone e WhatsApp/ })).toHaveAttribute(
      "href",
      site.contact.phoneHref,
    );
    expect(screen.getByText(new RegExp(profile.availability.seeking))).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Imprimir ou salvar em PDF" })).toBeInTheDocument();
  });

  it("lista toda a experiência com destaques, sem esconder nada atrás de cliques", () => {
    // Act
    const { container } = render(<CurriculoPage />);

    // Assert
    const section = screen.getByRole("region", { name: "Experiência" });
    expect(within(section).getAllByRole("heading", { level: 3 })).toHaveLength(
      profile.experiences.length,
    );
    expect(container.querySelector("details")).toBeNull();
  });

  it("resume as competências por grupo e mostra formação e idiomas", () => {
    // Act
    render(<CurriculoPage />);

    // Assert
    const competencias = screen.getByRole("region", { name: "Competências" });
    expect(within(competencias).getAllByRole("term")).toHaveLength(stackGroups.length);
    const formacao = screen.getByRole("region", { name: "Formação, certificações e idiomas" });
    expect(within(formacao).getByText(profile.education[0].course)).toBeInTheDocument();
  });

  it("não publica e-mail nem endereço pessoal", () => {
    // Act
    const { container } = render(<CurriculoPage />);

    // Assert
    expect(container.textContent).not.toMatch(/@gmail|Rua /);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("usa /curriculo como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/curriculo");
  });
});
