import { describe, expect, it } from "vitest";
import { siteOgAlt } from "@/components/og-card";
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

  it("repete a imagem padrão do site, que o Open Graph da página descartaria", () => {
    // Arrange
    const expectedImage = {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: siteOgAlt("pt-BR"),
      type: "image/png",
    };

    // Act
    const metadata = pageMetadata({ title: "Sobre", description: "Quem sou", path: "/sobre" });

    // Assert
    expect(metadata.openGraph?.images).toEqual([expectedImage]);
    expect(metadata.twitter?.images).toEqual([expectedImage]);
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

  it("deixa a imagem dos posts para o arquivo opengraph-image do segmento", () => {
    // Act
    const metadata = pageMetadata({
      title: "Post",
      description: "Resumo",
      path: "/diario/post",
      article: { publishedTime: "2026-10-14", tags: [] },
    });

    // Assert
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });

  it("deixa a imagem para o segmento quando a página tem a sua", () => {
    // Act
    const metadata = pageMetadata({
      title: "CareFlow",
      description: "Projeto",
      path: "/projetos/careflow",
      ownImage: true,
    });

    // Assert
    expect(metadata.openGraph).toMatchObject({ type: "website", url: "/projetos/careflow" });
    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });
});

describe("pageMetadata com idiomas", () => {
  it("declara as versões da página traduzida e o idioma do Open Graph", () => {
    // Act
    const metadata = pageMetadata({
      title: "About",
      description: "Who I am",
      path: "/en/about",
      locale: "en",
    });

    // Assert
    expect(metadata.alternates?.languages).toEqual({
      "pt-BR": "/sobre",
      en: "/en/about",
      "x-default": "/sobre",
    });
    expect(metadata.openGraph).toMatchObject({ locale: "en_US", alternateLocale: ["pt_BR"] });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: "/en/opengraph-image",
        alt: "Cleber Costa Santos, Senior Full-Stack Software Engineer",
      }),
    ]);
  });

  it("página só em português não declara alternativa de idioma", () => {
    // Act
    const metadata = pageMetadata({ title: "Stack", description: "Ferramentas", path: "/stack" });

    // Assert
    expect(metadata.alternates?.languages).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("alternateLocale");
  });
});
