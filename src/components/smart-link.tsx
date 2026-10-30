import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import type { Locale } from "@/i18n/locales";
import { ExternalLink } from "./external-link";

type SmartLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href?: string;
  /** Idioma da página onde o link aparece, para o aviso de nova aba. */
  locale?: Locale;
};

/**
 * Escolhe o link certo pelo destino: rotas internas usam `next/link` (com prefetch),
 * âncoras ficam na mesma página e o resto passa pelas regras do `ExternalLink`,
 * que recusa qualquer coisa que não seja https. Usado no conteúdo MDX.
 */
export function SmartLink({ href = "", children, locale, ...props }: SmartLinkProps) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <ExternalLink href={href} locale={locale} {...props}>
      {children}
    </ExternalLink>
  );
}
