import Link from "next/link";
import type { Post } from "@/content/posts";
import { formatLongDate } from "@/lib/format-date";
import { TagList } from "./tag-list";

type PostListProps = {
  posts: readonly Post[];
  /** Nível do título de cada post, para manter a hierarquia da página onde a lista aparece. */
  headingLevel?: 2 | 3;
};

export function PostList({ posts, headingLevel = 2 }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-muted">Nenhum post publicado ainda.</p>;
  }

  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <ul className="space-y-10">
      {posts.map((post) => (
        <li key={post.slug}>
          <article className="space-y-3">
            <p className="text-muted text-sm">
              <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time> · Fase{" "}
              {post.phase}
            </p>
            <Heading className="text-xl font-semibold tracking-tight">
              <Link href={`/diario/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </Heading>
            <p className="text-muted leading-relaxed">{post.description}</p>
            <TagList tags={post.tags} label={`Tags de ${post.title}`} />
          </article>
        </li>
      ))}
    </ul>
  );
}
