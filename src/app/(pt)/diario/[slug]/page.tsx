import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { TagList } from "@/components/tag-list";
import { site } from "@/config/site";
import { siteUrl } from "@/config/site-url";
import { getAllPosts, getPostBySlug } from "@/content/posts";
import { formatLongDate } from "@/lib/format-date";
import { pageMetadata } from "@/lib/metadata";

// O post precisa ser 100% estático: o build falha se a página passar a depender de dados
// da requisição (cookies, headers ou fetch sem cache).
export const ensureStatic = "navigation";

// Com Cache Components, `dynamicParams = false` não é suportado. Slugs fora desta lista são
// barrados antes no `src/proxy.ts`, para responder 404 de verdade (ver ADR-0004); o
// notFound() abaixo continua como defesa caso o proxy não rode.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/diario/[slug]">): Promise<Metadata> {
  const post = getPostBySlug((await params).slug);
  if (!post) {
    notFound();
  }

  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/diario/${post.slug}`,
    article: { publishedTime: post.publishedAt, tags: post.tags },
  });
}

export default async function PostPage({ params }: PageProps<"/diario/[slug]">) {
  const post = getPostBySlug((await params).slug);
  if (!post) {
    notFound();
  }

  // O caminho vem do registro de posts, nunca direto da URL.
  const { default: Content } = await import(`@/content/diario/${post.slug}.mdx`);
  const url = new URL(`/diario/${post.slug}`, siteUrl.url).href;

  return (
    <article className="max-w-3xl space-y-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.publishedAt,
          inLanguage: "pt-BR",
          url,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", name: site.name, url: site.links.linkedin },
        }}
      />

      <header className="space-y-4">
        <p className="text-muted font-mono text-xs">
          <Link href="/diario" className="hover:text-foreground underline">
            Diário de bordo
          </Link>{" "}
          · Fase {post.phase} ·{" "}
          <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {post.title}
        </h1>
        <p className="text-muted text-lg leading-relaxed">{post.description}</p>
        <TagList tags={post.tags} />
      </header>

      <div className="max-w-none">
        <Content />
      </div>

      <footer className="border-border border-t pt-6">
        <Link href="/diario" className="font-medium underline underline-offset-4">
          Voltar para o diário de bordo
        </Link>
      </footer>
    </article>
  );
}
