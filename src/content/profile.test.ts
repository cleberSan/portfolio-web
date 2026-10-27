import { describe, expect, it } from "vitest";
import {
  careerYears,
  currentExperience,
  formatCareerPeriod,
  formatDuration,
  formatPeriod,
  formatYearMonth,
  getProfile,
  monthsBetween,
  profile,
  type YearMonth,
} from "./profile";
import { portugueseLeftovers } from "@/test-utils/portuguese";

describe("monthsBetween", () => {
  it.each([
    ["2025-04", "2025-09", 6],
    ["2024-06", "2025-05", 12],
    ["2020-11", "2024-06", 44],
    ["2025-10", "2025-10", 1],
  ] as const)("conta de %s a %s como %i meses, incluindo os dois", (start, end, months) => {
    // Assert
    expect(monthsBetween(start, end)).toBe(months);
  });
});

describe("formatDuration", () => {
  it.each([
    [1, "1 mês"],
    [4, "4 meses"],
    [12, "1 ano"],
    [13, "1 ano e 1 mês"],
    [44, "3 anos e 8 meses"],
  ])("escreve %i meses como '%s'", (months, text) => {
    // Assert
    expect(formatDuration(months)).toBe(text);
  });
});

describe("formatPeriod", () => {
  it("mostra início, fim e duração de um cargo encerrado", () => {
    // Assert
    expect(formatPeriod({ start: "2020-11", end: "2024-06" })).toBe(
      "nov 2020 – jun 2024 · 3 anos e 8 meses",
    );
  });

  it("mostra 'atual' no cargo em andamento, sem duração que envelhece", () => {
    // Assert
    expect(formatPeriod({ start: "2025-10" })).toBe("out 2025 – atual");
  });

  it("formata o mês abreviado em português", () => {
    // Assert
    expect(formatYearMonth("2019-01")).toBe("jan 2019");
    expect(formatYearMonth("2021-12")).toBe("dez 2021");
  });
});

describe("profile", () => {
  it("lista os cargos do mais recente para o mais antigo", () => {
    // Act
    const starts = profile.experiences.map((experience) => experience.start);

    // Assert
    expect(starts).toEqual([...starts].sort().reverse());
  });

  it("tem no máximo um cargo atual, e só no topo da lista", () => {
    // Act
    const current = profile.experiences.filter((experience) => !("end" in experience));

    // Assert
    expect(current.length).toBeLessThanOrEqual(1);
    if (currentExperience) {
      expect(currentExperience).toBe(profile.experiences[0]);
    }
  });

  it("registra a saída da Exactaworks", () => {
    // Assert
    expect(currentExperience).toBeUndefined();
    expect(profile.experiences[0]).toMatchObject({ company: "Exactaworks", end: "2026-10" });
  });

  it("não fala em disponibilidade nem em busca de vaga", () => {
    // Assert
    expect(profile).not.toHaveProperty("availability");
    expect(JSON.stringify(profile)).not.toMatch(/oportunidade|recoloca|OpenToWork/i);
  });

  it("não termina nenhum cargo depois da data em que o perfil foi conferido", () => {
    // Assert
    for (const experience of profile.experiences) {
      const end: YearMonth | undefined = "end" in experience ? experience.end : undefined;
      expect((end ?? profile.asOf) <= profile.asOf).toBe(true);
    }
  });

  it("nunca termina um cargo antes de começar", () => {
    // Assert
    for (const experience of profile.experiences) {
      const end: YearMonth | undefined = "end" in experience ? experience.end : undefined;
      if (end) {
        expect(monthsBetween(experience.start, end)).toBeGreaterThan(0);
      }
    }
  });

  it("começa a carreira no primeiro cargo e conta anos completos", () => {
    // Assert
    expect(profile.careerStart).toBe(profile.experiences.at(-1)?.start);
    expect(careerYears()).toBe(7);
  });

  it("resume a carreira do primeiro cargo até a data conferida", () => {
    // Assert
    expect(formatCareerPeriod()).toBe("out 2019 – out 2026 · 7 anos e 1 mês");
  });
});

describe("getProfile", () => {
  it("devolve o próprio perfil em português", () => {
    // Assert
    expect(getProfile("pt-BR")).toBe(profile);
  });

  it("em inglês, troca os textos e mantém empresas, datas e stack", () => {
    // Act
    const english = getProfile("en");

    // Assert
    expect(english.experiences).toHaveLength(profile.experiences.length);
    english.experiences.forEach((experience, index) => {
      const original = profile.experiences[index];
      expect(experience).toMatchObject({
        company: original.company,
        start: original.start,
        location: original.location,
        stack: original.stack,
      });
      expect("end" in original ? original.end : undefined).toBe(experience.end);
      expect(experience.summary).not.toBe(original.summary);
      expect(experience.highlights).toHaveLength(original.highlights.length);
    });
    expect(english.education.map((education) => education.institution)).toEqual(
      profile.education.map((education) => education.institution),
    );
    expect(english.bio).toHaveLength(profile.bio.length);
    expect(english.certifications).toHaveLength(profile.certifications.length);
  });

  it("não deixa português esquecido nos textos em inglês", () => {
    // Arrange
    const english = getProfile("en");
    const texts = [
      english.location,
      ...english.bio,
      ...english.experiences.flatMap((experience) => [
        experience.role,
        experience.segment,
        experience.summary,
        ...experience.highlights,
      ]),
      ...english.education.map((education) => education.course),
      ...english.certifications,
      ...english.languages.flatMap((language) => [language.name, language.level]),
    ];

    // Act
    const leftovers = texts.flatMap(portugueseLeftovers);

    // Assert
    expect(leftovers).toEqual([]);
  });

  it("declara o inglês com o mesmo nível do LinkedIn", () => {
    // Assert
    expect(getProfile("en").languages).toContainEqual({
      name: "English",
      level: "Limited working proficiency",
    });
  });
});

describe("datas e durações em inglês", () => {
  it.each([
    [1, "1 month"],
    [12, "1 year"],
    [13, "1 year and 1 month"],
    [44, "3 years and 8 months"],
  ])("%i meses viram %s", (months, text) => {
    // Assert
    expect(formatDuration(months, "en")).toBe(text);
  });

  it("formata o mês, o período e a carreira em inglês", () => {
    // Assert
    expect(formatYearMonth("2025-10", "en")).toBe("Oct 2025");
    expect(formatPeriod({ start: "2025-04", end: "2025-09" }, "en")).toBe(
      "Apr 2025 – Sep 2025 · 6 months",
    );
    expect(formatPeriod({ start: "2025-10" }, "en")).toBe("Oct 2025 – present");
    expect(formatCareerPeriod("en")).toBe("Oct 2019 – Oct 2026 · 7 years and 1 month");
  });
});
