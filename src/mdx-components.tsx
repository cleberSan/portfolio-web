import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { SmartLink } from "@/components/smart-link";

/**
 * Estilos do conteúdo dos posts. O título (h1) vem da página, então o MDX começa em h2.
 * Links passam pelo `SmartLink`, que recusa destinos que não sejam rotas internas ou https.
 */
const components = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-12 mb-4 text-2xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-8 mb-3 text-xl font-semibold tracking-tight" {...props} />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => <p className="my-5 leading-relaxed" {...props} />,
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-5 list-disc space-y-2 pl-6 leading-relaxed" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-5 list-decimal space-y-2 pl-6 leading-relaxed" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <SmartLink className="text-accent underline underline-offset-4" {...props} />
  ),
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote className="border-accent text-muted my-6 border-l-4 pl-4 italic" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code className="bg-surface rounded px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />
  ),
  // tabIndex permite rolar blocos de código largos pelo teclado (regra scrollable-region-focusable).
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      tabIndex={0}
      className="bg-surface border-border my-6 overflow-x-auto rounded-lg border p-4 text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0"
      {...props}
    />
  ),
  hr: () => <hr className="border-border my-10" />,
} satisfies MDXComponents;

export function useMDXComponents(): MDXComponents {
  return components;
}
