import Link from "next/link";
import type { ReactNode } from "react";
import { ExternalLink } from "@/components/external-link";

const classe = "underline underline-offset-4 hover:text-monitor-fg";

/**
 * Link dentro do monitor de /ecossistema. Rota interna vai sem prefetch automático: escolher uma
 * região ou receber uma resposta do Sinapse não pode gerar requisição (spec 0001, CA-14). O
 * prefetch ainda acontece quando o visitante passa o mouse, que é intenção dele.
 */
export function LinkDoMonitor({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} prefetch={false} className={classe}>
        {children}
      </Link>
    );
  }
  return (
    <ExternalLink href={href} className={classe}>
      {children}
    </ExternalLink>
  );
}
