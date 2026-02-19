"use client";

import type { PRDiffInfo } from "../types/pr-diff";
import {
  ArrowLeftIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  FileIcon,
} from "lucide-react";
import Link from "next/link";

type PRDiffHeaderProps = {
  pr: PRDiffInfo;
};

export function PRDiffHeader({ pr }: PRDiffHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-4">
      <div className="mx-auto max-w-[90rem]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3" />
          Back to dashboard
        </Link>

        <div className="mt-2 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-snug">
              {pr.title}
              <span className="ml-2 font-mono text-muted-foreground">
                #{pr.number}
              </span>
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <GitBranchIcon className="size-3" />
                {pr.baseBranch}
                <span className="text-border">←</span>
                {pr.headBranch}
              </span>
              <span className="inline-flex items-center gap-1">
                <FileIcon className="size-3" />
                <span className="tabular-nums">{pr.changedFiles}</span> files
              </span>
              <span className="font-mono">
                <span className="text-status-approved">+{pr.additions}</span>{" "}
                <span className="text-status-changes-requested">
                  -{pr.deletions}
                </span>
              </span>
            </div>
          </div>
          <a
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            GitHub
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
