import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { careflowTooling, stackGroups } from "@/content/stack";
import StackPage, { metadata } from "./page";

describe("StackPage", () => {
  it.each(stackGroups)("mostra o grupo $title com todos os itens", (group) => {
    // Act
    render(<StackPage />);

    // Assert
    const section = screen.getByRole("region", { name: group.title });
    expect(within(section).getAllByRole("listitem")).toHaveLength(group.items.length);
  });

  it("separa as ferramentas do CareFlow da experiência profissional", () => {
    // Act
    render(<StackPage />);

    // Assert
    const section = screen.getByRole("region", { name: "Também no CareFlow" });
    expect(within(section).getAllByRole("link")).toHaveLength(careflowTooling.length);
  });

  it("liga cada evidência ao código público", () => {
    // Arrange
    const withEvidence = stackGroups
      .flatMap((group) => group.items)
      .filter((item) => item.evidence);

    // Act
    render(<StackPage />);

    // Assert
    for (const item of withEvidence) {
      const link = screen.getByRole("link", { name: new RegExp(`^${item.evidence?.label}`) });
      expect(link).toHaveAttribute("href", item.evidence?.href);
    }
  });

  it("usa /stack como URL canônica", () => {
    // Assert
    expect(metadata.alternates?.canonical).toBe("/stack");
  });
});
