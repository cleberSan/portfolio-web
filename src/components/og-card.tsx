import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

/** Texto alternativo da imagem Open Graph padrão do site (`src/app/opengraph-image.tsx`). */
export const siteOgAlt = `${site.name}, ${site.role}`;

type OgCardProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

/**
 * Layout das imagens Open Graph. Renderizado pelo `ImageResponse` (Satori), que só
 * entende estilos inline e exige `display: flex` em elementos com mais de um filho.
 */
export function OgCard({ eyebrow, title, subtitle }: OgCardProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        // Mesmo visual "Sala de controle" do site: fundo de painel com quadriculado discreto.
        background: "#0a111c",
        backgroundImage:
          "linear-gradient(rgba(103,232,249,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.07) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        color: "#dbe6f3",
        borderTop: "8px solid #67e8f9",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 28,
          color: "#67e8f9",
          letterSpacing: 4,
        }}
      >
        <div
          style={{ display: "flex", width: 14, height: 14, borderRadius: 7, background: "#67e8f9" }}
        />
        {eyebrow.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#94a3b8" }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#94a3b8" }}>
        {site.name} · {site.role}
      </div>
    </div>
  );
}
