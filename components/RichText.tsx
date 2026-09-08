import { toRichHtml } from "@/lib/richtext";

export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const safe = toRichHtml(html);
  if (!safe) return null;

  return (
    <div
      className={`rich-text ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
