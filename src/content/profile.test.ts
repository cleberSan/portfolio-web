import { describe, expect, it } from "vitest";
import {
  careerYears,
  currentExperience,
  formatDuration,
  formatPeriod,
  formatYearMonth,
  monthsBetween,
  profile,
  type YearMonth,
} from "./profile";

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

  it("tem exatamente um cargo atual, o primeiro da lista", () => {
    // Act
    const current = profile.experiences.filter((experience) => !("end" in experience));

    // Assert
    expect(current).toHaveLength(1);
    expect(currentExperience).toBe(profile.experiences[0]);
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
});
