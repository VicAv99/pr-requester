"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Diff2HtmlUI } from "diff2html/lib/ui/js/diff2html-ui-base";
import { ColorSchemeType } from "diff2html/lib/types";
import hljs from "highlight.js";
import "diff2html/bundles/css/diff2html.min.css";

type DiffViewerProps = {
  diff: string;
  outputFormat?: "line-by-line" | "side-by-side";
};

export function DiffViewer({
  diff,
  outputFormat = "line-by-line",
}: DiffViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  const colorScheme =
    resolvedTheme === "dark" ? ColorSchemeType.DARK : ColorSchemeType.LIGHT;

  useEffect(() => {
    if (!containerRef.current || !diff) return;

    const ui = new Diff2HtmlUI(
      containerRef.current,
      diff,
      {
        outputFormat,
        drawFileList: false,
        matching: "lines",
        colorScheme,
        highlight: true,
      },
      hljs,
    );
    ui.draw();
    ui.highlightCode();
  }, [diff, outputFormat, colorScheme]);

  if (!diff) {
    return (
      <div className="rounded-lg border border-border p-12 text-center text-sm text-muted-foreground">
        No diff available for this pull request.
      </div>
    );
  }

  return <div ref={containerRef} className="diff-viewer overflow-x-auto" />;
}
