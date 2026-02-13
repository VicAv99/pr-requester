import type { ReactNode } from "react";

/**
 * Highlights the first occurrence of `query` within `text` by wrapping
 * the matching segment in a <mark> element. Case-insensitive.
 */
export function HighlightMatch({
  text,
  query,
}: {
  text: string;
  query: string;
}): ReactNode {
  if (!query) return text;

  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-transparent font-semibold text-foreground">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </span>
  );
}
