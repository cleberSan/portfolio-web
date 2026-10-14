type JsonLdProps = { data: Record<string, unknown> };

/**
 * Escapa `<` para que nenhum valor feche a tag `<script>` e injete HTML,
 * como recomenda a documentação do Next.js para JSON-LD.
 */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Dados estruturados (schema.org) para buscadores; não é executado pelo navegador. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
