import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { pageMetadata } from "./metadata";

describe("pageMetadata", () => {
  it("define título, descrição e URL canônica", () => {
    // Act
    const metadata = pageMetadata({ title: "Sobre", description: "Quem sou", path: "/sobre" });

    // Assert
    expect(metadata.title).toBe("Sobre");
    expect(metadata.description).toBe("Quem sou");
    expect(metadata.alternates?.canonical).toBe("/sobre");
  });

  it("repete os campos compartilhados do Open Graph em toda página", () => {
    // Act
    const metadata = pageMetadata({ title: "Stack", description: "Ferramentas", path: "/stack" });

    // Assert
    expect(metadata.openGraph).toMatchObject({
      type: "website",
      url: "/stack",
      siteName: site.name,
      locale: "pt_BR",
      title: "Stack",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("usa título absoluto quando pedido", () => {
    // Act
    const metadata = pageMetadata({
      title: "Cleber",
      description: "Home",
      path: "/",
      absoluteTitle: true,
    });

    // Assert
    expect(metadata.title).toEqual({ absolute: "Cleber" });
  });

  it("descreve posts como artigos com data e tags", () => {
    // Act
    const metadata = pageMetadata({
      title: "Post",
      description: "Resumo",
      path: "/diario/post",
      article: { publishedTime: "2026-10-14", tags: ["PostgreSQL"] },
    });

    // Assert
    expect(metadata.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-10-14",
      authors: [site.name],
      tags: ["PostgreSQL"],
    });
  });
});
