import { describe, expect, it } from "vitest";
import { staticRoutes } from "@/config/site";
import { careflowPhases } from "@/content/careflow";
import { regiaoIds, type RegiaoId } from "./modelo";
import { getRegiao, regioes } from "./regioes";

describe("regiões do ecossistema", () => {
  it("tem as cinco regiões, na ordem do modelo", () => {
    expect(regioes.map((regiao) => regiao.id)).toEqual([...regiaoIds]);
  });

  it("conta as fases do CareFlow a partir do conteúdo, sem número copiado", () => {
    const concluidas = careflowPhases.filter((phase) => phase.status === "concluida").length;

    expect(getRegiao("careflow").estado).toBe(
      `${concluidas} de ${careflowPhases.length} fases concluídas`,
    );
  });

  it("só aponta para rota existente do site ou para endereço https", () => {
    const rotas = new Set<string>(staticRoutes);
    for (const link of regioes.flatMap((regiao) => regiao.links)) {
      if (link.href.startsWith("/")) {
        expect(rotas.has(link.href), link.href).toBe(true);
      } else {
        expect(link.href).toMatch(/^https:\/\//);
      }
    }
  });

  // spec 0001 CA-03
  it("não diz ao vivo, tempo real nem Clean Architecture", () => {
    const texto = JSON.stringify(regioes);

    expect(texto).not.toMatch(/ao vivo|tempo real|clean architecture/i);
  });

  it("recusa região desconhecida", () => {
    expect(() => getRegiao("outra" as RegiaoId)).toThrow("Região desconhecida: outra");
  });
});
