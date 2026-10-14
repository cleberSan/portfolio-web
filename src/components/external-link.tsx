import type { AnchorHTMLAttributes } from "react";

type ExternalLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target" | "rel"
> & { href: string };

/**
 * Link para fora do site. Sempre abre em nova aba sem expor `window.opener`
 * nem o referrer completo, e só aceita URLs https para evitar `javascript:`.
 * Leitores de tela são avisados de que uma nova aba vai abrir.
 */
export function ExternalLink({ href, children, ...props }: ExternalLinkProps) {
  if (!href.startsWith("https://")) {
    throw new Error("ExternalLink aceita apenas URLs https.");
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <span className="sr-only">, abre em nova aba</span>
    </a>
  );
}
