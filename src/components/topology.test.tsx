import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { careflow } from "@/content/careflow";
import { layoutNodes, Topology } from "./topology";

describe("layoutNodes", () => {
  it("começa no topo e não repete posições", () => {
    // Act
    const points = layoutNodes(7);

    // Assert
    expect(points).toHaveLength(7);
    expect(points[0]).toEqual({ x: 260, y: 50 });
    expect(new Set(points.map((point) => `${point.x},${point.y}`)).size).toBe(7);
  });

  it("mantém os serviços dentro do desenho", () => {
    // Act
    const points = layoutNodes(careflow.services.length);

    // Assert: o centro de cada caixa deixa meia caixa (75 x 22) de folga até a borda.
    for (const point of points) {
      expect(point.x).toBeGreaterThanOrEqual(75);
      expect(point.x).toBeLessThanOrEqual(520 - 75);
      expect(point.y).toBeGreaterThanOrEqual(22);
      expect(point.y).toBeLessThanOrEqual(420 - 22);
    }
  });
});

describe("Topology", () => {
  it("descreve a arquitetura para leitores de tela", () => {
    // Act
    render(<Topology id="teste" />);

    // Assert
    const image = screen.getByRole("img", { name: /Topologia do CareFlow/ });
    expect(image).toHaveAccessibleName(expect.stringContaining("RabbitMQ"));
    expect(image).toHaveAccessibleName(expect.stringContaining("Pedidos do titular"));
  });

  it("anima só algumas arestas, com o caminho em CSS", () => {
    // Act
    const { container } = render(<Topology id="teste" />);

    // Assert
    const pulses = container.querySelectorAll("circle.topology-pulse");
    expect(pulses).toHaveLength(4);
    expect((pulses[0] as SVGCircleElement).style.offsetPath).toContain("path(");
  });
});
