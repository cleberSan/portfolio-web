import { site } from "@/config/site";

export const ogSize = { width: 1200, height: 630 };

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
        background: "#0a0a0a",
        color: "#ededed",
      }}
    >
      <div style={{ display: "flex", fontSize: 28, color: "#5eead4", letterSpacing: 4 }}>
        {eyebrow.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#a3a3a3" }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#a3a3a3" }}>
        {site.name} · {site.role}
      </div>
    </div>
  );
}
