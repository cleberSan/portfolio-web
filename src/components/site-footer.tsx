import Link from "next/link";
import { getSiteText, site } from "@/config/site";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { ExternalLink } from "./external-link";

const linkClass = "hover:text-foreground underline";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="border-border text-muted border-t print:hidden">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
        <p className="font-mono">
          {site.name} · {getSiteText(locale).role}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {/* A página Stack existe só em português. */}
          {locale === "pt-BR" ? (
            <li>
              <Link href="/stack" className={linkClass}>
                Stack
              </Link>
            </li>
          ) : null}
          <li>
            <ExternalLink href={site.links.linkedin} locale={locale} className={linkClass}>
              LinkedIn
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={site.links.github} locale={locale} className={linkClass}>
              GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={site.links.source} locale={locale} className={linkClass}>
              {dictionaries[locale].footer.source}
            </ExternalLink>
          </li>
        </ul>
      </div>
    </footer>
  );
}
