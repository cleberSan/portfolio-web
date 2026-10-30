import type { Metadata } from "next";
import { NotFoundContent } from "@/components/not-found-content";
import { RootDocument } from "@/components/root-document";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `Página não encontrada | ${site.name}`,
};

/**
 * 404 de URLs sem rota nenhuma. Com dois layouts raiz, um por idioma (ADR-0006), não há um layout
 * único para o `not-found.tsx` de sempre; este arquivo monta o documento inteiro, em português.
 */
export default function GlobalNotFound() {
  return (
    <RootDocument locale="pt-BR">
      <NotFoundContent />
    </RootDocument>
  );
}
