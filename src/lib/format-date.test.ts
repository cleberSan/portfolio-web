import { describe, expect, it } from "vitest";
import { formatLongDate, parseIsoDate } from "./format-date";

describe("parseIsoDate", () => {
  it("interpreta a data como meia-noite UTC", () => {
    // Act
    const date = parseIsoDate("2026-10-14");

    // Assert
    expect(date.toISOString()).toBe("2026-10-14T00:00:00.000Z");
  });

  it.each(["14/10/2026", "2026-10-14T10:00:00Z", "2026-1-4", ""])(
    "recusa formato diferente de AAAA-MM-DD: %j",
    (value) => {
      // Act
      const act = () => parseIsoDate(value);

      // Assert
      expect(act).toThrow(/formato/);
    },
  );

  it.each(["2026-02-30", "2026-13-01", "2026-00-10"])("recusa data inexistente: %s", (value) => {
    // Act
    const act = () => parseIsoDate(value);

    // Assert
    expect(act).toThrow(/inexistente/);
  });

  it("aceita 29 de fevereiro em ano bissexto", () => {
    // Act
    const date = parseIsoDate("2028-02-29");

    // Assert
    expect(date.getUTCDate()).toBe(29);
  });
});

describe("formatLongDate", () => {
  it("formata por extenso em português", () => {
    // Act
    const formatted = formatLongDate("2026-10-14");

    // Assert
    expect(formatted).toBe("14 de outubro de 2026");
  });

  it("não muda o dia na virada do ano", () => {
    // Act
    const formatted = formatLongDate("2027-01-01");

    // Assert
    expect(formatted).toBe("1 de janeiro de 2027");
  });
});
