"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { prDiffQueries } from "../queries";
import { PRDiffHeader } from "./pr-diff-header";
import { FileTree } from "./file-tree";
import { DiffViewer } from "./diff-viewer";
import {
  Loader2Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ColumnsIcon,
  RowsIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PRDiffPageContentProps = {
  owner: string;
  repo: string;
  number: number;
};

export function PRDiffPageContent({
  owner,
  repo,
  number,
}: PRDiffPageContentProps) {
  const { data, isLoading, error } = useQuery(
    prDiffQueries.detail(owner, repo, number),
  );
  const [activeFile, setActiveFile] = useState<string>();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [outputFormat, setOutputFormat] = useState<
    "line-by-line" | "side-by-side"
  >("line-by-line");

  const handleFileClick = useCallback((filename: string) => {
    setActiveFile(filename);
    const wrappers = document.querySelectorAll(".d2h-file-wrapper");
    for (const wrapper of wrappers) {
      const nameEl = wrapper.querySelector(".d2h-file-name");
      const text = nameEl?.textContent?.trim() ?? "";
      if (text === filename || text.endsWith(filename)) {
        wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading diff...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">
            Failed to load PR diff
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PRDiffHeader pr={data.pr} />

      <div className="flex flex-1">
        {/* File sidebar */}
        <aside
          className={cn(
            "sticky top-0 h-[calc(100vh-theme(spacing.24))] shrink-0 overflow-y-auto border-r border-border bg-card/50 transition-all duration-200",
            sidebarOpen ? "w-72 p-3" : "w-0 overflow-hidden p-0",
          )}
        >
          {sidebarOpen && (
            <>
              <h2 className="mb-3 text-xs font-medium text-muted-foreground">
                Files ({data.files.length})
              </h2>
              <FileTree
                files={data.files}
                activeFile={activeFile}
                onFileClick={handleFileClick}
              />
            </>
          )}
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {sidebarOpen ? (
                <PanelLeftCloseIcon className="size-4" />
              ) : (
                <PanelLeftOpenIcon className="size-4" />
              )}
            </button>

            <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                onClick={() => setOutputFormat("line-by-line")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  outputFormat === "line-by-line"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <RowsIcon className="size-3.5" />
                Unified
              </button>
              <button
                type="button"
                onClick={() => setOutputFormat("side-by-side")}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  outputFormat === "side-by-side"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <ColumnsIcon className="size-3.5" />
                Split
              </button>
            </div>
          </div>

          <div className="p-4">
            <DiffViewer diff={data.diff} outputFormat={outputFormat} />
          </div>
        </main>
      </div>
    </div>
  );
}
