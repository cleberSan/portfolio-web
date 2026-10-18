import { describe, expect, it } from "vitest";
import { formatList } from "./format-list";

describe("formatList", () => {
  it("junta os itens com vírgula e 'e', em minúsculas", () => {
    // Act
    const text = formatList(["Pagamentos digitais", "Saúde", "Educação"]);

    // Assert
    expect(text).toBe("pagamentos digitais, saúde e educação");
  });

  it("devolve o item sozinho e vazio para lista vazia", () => {
    // Assert
    expect(formatList(["Saúde"])).toBe("saúde");
    expect(formatList([])).toBe("");
  });
});
