import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/content/posts";
import { pageMetadata } from "@/lib/metadata";

const description =
  "Registro de cada fase do CareFlow: o que foi construído, as decisões, os trade-offs e o que os testes ensinaram.";

export const metadata: Metadata = pageMetadata({
  title: "Diário de bordo",
  description,
  path: "/diario",
});

export default function DiarioPage() {
  return (
    <div className="max-w-3xl space-y-12">
      <PageHeader title="Diário de bordo" eyebrow="CareFlow em público">
        <p>{description}</p>
      </PageHeader>
      <PostList posts={getAllPosts()} />
    </div>
  );
}
