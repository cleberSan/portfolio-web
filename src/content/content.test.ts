import { describe, expect, it } from "vitest";
import { careflow, careflowPhases } from "./careflow";
import { lojinha, lojinhaAdrUrl } from "./lojinha";
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

describe("lojinha", () => {
  it("aponta site, código e ADRs para endereços https do projeto", () => {
    // Assert
    expect(lojinha.site).toMatch(/^https:\/\/[a-z0-9-]+\.clebersan\.workers\.dev$/);
    expect(lojinha.repository).toBe("https://github.com/cleberSan/lojinha-da-lua");
    expect(lojinha.adrs.startsWith(`${lojinha.repository}/`)).toBe(true);
  });

  it("não repete ADR e usa só nomes de arquivo numerados", () => {
    // Arrange
    const adrs = lojinha.decisions.map((decision) => decision.adr);

    // Assert
    expect(new Set(adrs).size).toBe(adrs.length);
    for (const adr of adrs) {
      expect(adr).toMatch(/^\d{4}-[a-z0-9-]+$/);
      expect(lojinhaAdrUrl(adr)).toBe(`${lojinha.repository}/blob/main/docs/adr/${adr}.md`);
    }
  });
});
