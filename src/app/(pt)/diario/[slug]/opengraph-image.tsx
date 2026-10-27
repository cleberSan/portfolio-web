import { ImageResponse } from "next/og";
import { OgCard, ogSize } from "@/components/og-card";
import { getAllPosts, getPostBySlug } from "@/content/posts";

export const alt = "Post do diário de bordo do CareFlow";
export const size = ogSize;
export const contentType = "image/png";

// Gera as imagens no build, como as páginas dos posts.
export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPostBySlug((await params).slug);
  if (!post) {
    return new Response(null, { status: 404 });
  }

  return new ImageResponse(
    <OgCard
      eyebrow={`Diário de bordo · Fase ${post.phase}`}
      title={post.title}
      subtitle="CareFlow"
    />,
    size,
  );
}
