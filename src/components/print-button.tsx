"use client";

/** Abre a impressão do navegador, que também salva em PDF. Some da própria impressão. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-accent text-background rounded-md px-4 py-2 text-sm font-medium hover:opacity-90 print:hidden"
    >
      Imprimir ou salvar em PDF
    </button>
  );
}
