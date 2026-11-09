import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { buildRespostas } from "@/content/ecossistema/assistente";
import { regioes } from "@/content/ecossistema/regioes";
import { buildReproducoes, resumoDaGravacao } from "@/content/ecossistema/reproducoes";
import EcossistemaPage, { metadata } from "./page";

const respostas = buildRespostas({ gravacao: resumoDaGravacao() });

describe("EcossistemaPage", () => {
  it("tem um único h1 e URL canônica própria", () => {
    // Act
    render(<EcossistemaPage />);

    // Assert
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(metadata.alternates?.canonical).toBe("/ecossistema");
  });

  // spec 0001 CA-01
  it("traz as cinco regiões com resumo, estado e links já no HTML", () => {
    // Act
    render(<EcossistemaPage />);

    // Assert
    const secao = screen.getByRole("region", { name: "As cinco regiões" });
    const cartoes = within(secao).getAllByRole("article");
    expect(cartoes).toHaveLength(5);
    regioes.forEach((regiao, index) => {
      const cartao = cartoes[index];
      expect(within(cartao).getByRole("heading", { level: 3 })).toHaveTextContent(regiao.nome);
      expect(cartao).toHaveTextContent(regiao.resumo);
      expect(cartao).toHaveTextContent(regiao.estado);
      for (const link of regiao.links) {
        expect(
          within(cartao).getByRole("link", { name: new RegExp(`^${link.rotulo}`) }),
        ).toHaveAttribute("href", link.href);
      }
    });
  });

  // spec 0001 CA-01
  it("traz todas as perguntas do assistente com a resposta em lista expansível", () => {
    // Act
    render(<EcossistemaPage />);

    // Assert
    const secao = screen.getByRole("region", { name: "Pergunte ao Sinapse" });
    const itens = secao.querySelectorAll("details");
    expect(itens).toHaveLength(respostas.length);
    respostas.forEach((resposta, index) => {
      const item = itens[index];
      expect(item.querySelector("summary")).toHaveTextContent(resposta.pergunta);
      expect(item).toHaveTextContent(resposta.texto);
      expect(item.querySelectorAll("a")).toHaveLength(resposta.fontes.length);
    });
  });

  // spec 0001 CA-03
  it("diz a origem de cada reprodução: gravação do CI com data e commit, ou roteiro", () => {
    // Arrange
    const gravacao = resumoDaGravacao();

    // Act
    render(<EcossistemaPage />);

    // Assert
    const aviso = screen.getByRole("note");
    expect(aviso).toHaveTextContent(`gravação do CI de ${gravacao.data}`);
    expect(within(aviso).getByRole("link", { name: new RegExp(gravacao.commit) })).toHaveAttribute(
      "href",
      gravacao.href,
    );
    expect(within(aviso).getByRole("link", { name: /agents\/fluxo-fase\.md/ })).toHaveAttribute(
      "href",
      "https://github.com/cleberSan/claude-works/blob/main/agents/fluxo-fase.md",
    );

    const secao = screen.getByRole("region", { name: "Reproduções" });
    for (const reproducao of buildReproducoes()) {
      const cartao = within(secao).getByRole("article", { name: reproducao.nome });
      expect(cartao).toHaveTextContent(`Origem: ${reproducao.fonte.rotulo}`);
      expect(cartao.querySelectorAll("details li")).toHaveLength(reproducao.eventos.length);
    }
  });

  // spec 0001 CA-03, CA-16
  it("não diz ao vivo nem tempo real e segue as regras de texto do site", () => {
    // Act
    const { container } = render(<EcossistemaPage />);

    // Assert
    const texto = container.textContent ?? "";
    expect(texto).not.toMatch(/ao vivo|tempo real/i);
    expect(texto).not.toMatch(/\bvaga|oportunidade|busco|disponível|currículo/i);
    expect(texto).not.toMatch(/@gmail|\bRua |clean architecture/i);
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("mostra o portão do Cleber nos passos do roteiro dos agentes", () => {
    // Act
    render(<EcossistemaPage />);

    // Assert
    const fase = screen.getByRole("article", { name: "Uma fase com agentes" });
    expect(within(fase).getAllByText(/espera o OK do Cleber/)).toHaveLength(2);
  });

  it("indica quando o sinal passa pelo RabbitMQ", () => {
    // Act
    render(<EcossistemaPage />);

    // Assert
    const revogacao = screen.getByRole("article", { name: "Revogação do consentimento" });
    expect(within(revogacao).getAllByText(/→ RabbitMQ →/).length).toBeGreaterThan(0);
  });

  // spec 0001 CA-02
  it("consta do sitemap", () => {
    // Act
    const urls = sitemap().map((entrada) => new URL(entrada.url).pathname);

    // Assert
    expect(urls).toContain("/ecossistema");
  });
});
