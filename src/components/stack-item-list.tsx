import type { StackItem } from "@/content/stack";
import { ExternalLink } from "./external-link";

export function StackItemList({ items }: { items: readonly StackItem[] }) {
  return (
    <ul className="divide-border border-border divide-y rounded-lg border">
      {items.map((item) => (
        <li
          key={item.name}
          className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 py-3"
        >
          <span className="font-medium">{item.name}</span>
          {item.evidence ? (
            <ExternalLink
              href={item.evidence.href}
              className="text-accent text-sm underline underline-offset-4"
            >
              {item.evidence.label}
            </ExternalLink>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
