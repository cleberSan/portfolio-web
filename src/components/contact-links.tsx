import type { ReactNode } from "react";
import { site, whatsappUrl } from "@/config/site";
import { dictionaries } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/locales";
import { ExternalLink } from "./external-link";

type Channel = {
  id: "whatsapp" | "telefone" | "linkedin" | "github";
  label: string;
  value: string;
  href: string;
};

/** "https://www.linkedin.com/in/fulano/" vira "linkedin.com/in/fulano". */
export function displayUrl(href: string): string {
  return href.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Canais no idioma da página: muda o rótulo do telefone e a saudação pronta do WhatsApp. */
export function contactChannels(locale: Locale): readonly Channel[] {
  return [
    { id: "whatsapp", label: "WhatsApp", value: site.contact.phone, href: whatsappUrl(locale) },
    {
      id: "telefone",
      label: dictionaries[locale].contact.phone,
      value: site.contact.phone,
      href: site.contact.phoneHref,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      value: displayUrl(site.links.linkedin),
      href: site.links.linkedin,
    },
    {
      id: "github",
      label: "GitHub",
      value: displayUrl(site.links.github),
      href: site.links.github,
    },
  ];
}

/** Contatos públicos. E-mail e endereço ficam de fora por decisão do Cleber. */
export function ContactLinks({ locale }: { locale: Locale }) {
  return (
    <ul aria-label={dictionaries[locale].contact.label} className="grid gap-3 sm:grid-cols-2">
      {contactChannels(locale).map((channel) => (
        <li key={channel.id}>
          <ChannelLink
            channel={channel}
            locale={locale}
            className="border-border bg-background hover:border-accent group flex h-full flex-col gap-1 rounded-lg border p-4"
          >
            <span className="text-muted flex justify-between font-mono text-xs tracking-[0.12em] uppercase">
              {channel.label}
              {isExternal(channel) ? (
                <span aria-hidden="true" className="group-hover:text-accent">
                  ↗
                </span>
              ) : null}
            </span>
            <span className="font-medium [overflow-wrap:anywhere]">{channel.value}</span>
          </ChannelLink>
        </li>
      ))}
    </ul>
  );
}

type ChannelLinkProps = {
  channel: Channel;
  locale: Locale;
  className?: string;
  children: ReactNode;
};

function isExternal(channel: Channel): boolean {
  return channel.href.startsWith("https://");
}

/** Telefone liga direto, na mesma aba; o resto sai do site pelas regras do `ExternalLink`. */
function ChannelLink({ channel, locale, className, children }: ChannelLinkProps) {
  if (!isExternal(channel)) {
    return (
      <a href={channel.href} className={className}>
        {children}
      </a>
    );
  }

  return (
    <ExternalLink href={channel.href} locale={locale} className={className}>
      {children}
    </ExternalLink>
  );
}
