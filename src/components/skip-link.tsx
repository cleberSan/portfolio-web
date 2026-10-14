export const mainContentId = "conteudo";

/** Primeiro item focável da página: pula o cabeçalho para quem navega por teclado. */
export function SkipLink() {
  return (
    <a
      href={`#${mainContentId}`}
      className="bg-foreground text-background sr-only z-50 rounded px-4 py-2 font-medium focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
    >
      Pular para o conteúdo
    </a>
  );
}
