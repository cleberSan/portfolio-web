import Link from "next/link";
import { PageHeader } from "@/components/page-header";

export default function NotFound() {
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
      </ul>
    </div>
  );
}
