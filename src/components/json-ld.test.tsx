import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonLd, serializeJsonLd } from "./json-ld";

describe("serializeJsonLd", () => {
  it("escapa < para impedir o fechamento da tag script", () => {
    // Act
    const json = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

    // Assert
    expect(json).not.toContain("<");
    expect(JSON.parse(json)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});

describe("JsonLd", () => {
  it("renderiza um script do tipo application/ld+json", () => {
    // Act
    const { container } = render(<JsonLd data={{ "@type": "Person", name: "Cleber" }} />);

    // Assert
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(JSON.parse(script?.textContent ?? "{}")).toEqual({ "@type": "Person", name: "Cleber" });
  });
});
