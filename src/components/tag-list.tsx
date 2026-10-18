export function TagList({ tags, label = "Tags" }: { tags: readonly string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <li
          key={tag}
          className="border-border text-muted rounded-md border px-2 py-0.5 font-mono text-xs"
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
