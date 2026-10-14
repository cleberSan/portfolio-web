import { describe, expect, it } from "vitest";
import { careflow, careflowPhases } from "./careflow";
import { getPostBySlug } from "./posts";
import { careflowTooling, stackGroups } from "./stack";

const evidence = [...stackGroups.flatMap((group) => group.items), ...careflowTooling]
  .map((item) => item.evidence)
  .filter((item) => item !== undefined);

describe("stack", () => {
  it("não repete ids de grupo, usados como âncoras", () => {
    // Arrange
    const ids = stackGroups.map((group) => group.id);

    // Act
    const unique = new Set(ids);

    // Assert
    expect(unique.size).toBe(ids.length);
  });

  it.each(evidence)(
    "evidência '$label' aponta para um repositório público do autor",
    ({ href }) => {
      // Assert
      expect(href).toMatch(/^https:\/\/github\.com\/cleberSan\/(careflow|portfolio-web)(\/|$)/);
    },
  );
});

describe("careflow", () => {
  it("numera as fases em sequência a partir de zero", () => {
    // Act
    const numbers = careflowPhases.map((phase) => phase.number);

    // Assert
    expect(numbers).toEqual(numbers.map((_, index) => index));
  });

  it.each(careflowPhases.filter((phase) => phase.postSlug !== undefined))(
    "fase $number aponta para um post que existe",
    (phase) => {
      // Act
      const post = getPostBySlug(phase.postSlug ?? "");

      // Assert
      expect(post?.phase).toBe(phase.number);
    },
  );

  it("usa apenas links https", () => {
    // Assert
    expect(careflow.repository).toMatch(/^https:\/\//);
    expect(careflow.adrs).toMatch(/^https:\/\//);
  });
});
