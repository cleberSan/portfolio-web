import { site } from "@/config/site";
import { ExternalLink } from "./external-link";

export function SiteFooter() {
  return (
    <footer className="border-border text-muted border-t">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm">
        <p>
          {site.name} · {site.role}
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <ExternalLink href={site.links.github} className="hover:text-foreground underline">
              GitHub
            </ExternalLink>
          </li>
          <li>
            <ExternalLink href={site.links.source} className="hover:text-foreground underline">
              Código deste site
            </ExternalLink>
          </li>
        </ul>
      </div>
    </footer>
  );
}
