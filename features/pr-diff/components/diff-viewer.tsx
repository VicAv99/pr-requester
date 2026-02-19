"use client";

import { useMemo } from "react";
import { useTheme } from "next-themes";
import { html } from "diff2html";
import { ColorSchemeType } from "diff2html/lib/types";
import "diff2html/bundles/css/diff2html.min.css";

type DiffViewerProps = {
  diff: string;
  outputFormat?: "line-by-line" | "side-by-side";
};

export function DiffViewer({
  diff,
  outputFormat = "line-by-line",
}: DiffViewerProps) {
  const { resolvedTheme } = useTheme();

  const colorScheme =
    resolvedTheme === "dark" ? ColorSchemeType.DARK : ColorSchemeType.LIGHT;

  const diffHtml = useMemo(() => {
    if (!diff) return "";
    return html(diff, {
      outputFormat,
      drawFileList: false,
      matching: "lines",
      colorScheme,
    });
  }, [diff, outputFormat, colorScheme]);

  if (!diff) {
    return (
      <div className="rounded-lg border border-border p-12 text-center text-sm text-muted-foreground">
        No diff available for this pull request.
      </div>
    );
  }

  return (
    <div
      className="diff-viewer overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: diffHtml }}
    />
  );
}
