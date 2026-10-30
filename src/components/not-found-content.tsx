import Link from "next/link";
import { PageHeader } from "./page-header";

/**
 * Conteúdo da página 404, em português, com um atalho para quem veio da versão em inglês. Serve ao
 * `notFound()` das páginas e ao `global-not-found.tsx`, que atende URLs sem rota nenhuma.
 */
export function NotFoundContent() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Página não encontrada" eyebrow="Erro 404">
        <p>O endereço pode ter mudado ou nunca ter existido.</p>
      </PageHeader>
      <ul className="flex flex-wrap gap-6">
        <li>
          <Link href="/" className="font-medium underline underline-offset-4">
            Ir para a página inicial
          </Link>
        </li>
        <li>
          <Link href="/diario" className="font-medium underline underline-offset-4">
            Ver o diário de bordo
          </Link>
        </li>
        <li lang="en">
          <a href="/en" hrefLang="en" className="font-medium underline underline-offset-4">
            Go to the English home page
          </a>
        </li>
      </ul>
    </div>
  );
}
