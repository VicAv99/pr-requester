import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PullRequest, ReviewStatus } from "../types/dashboard";
import { UserAvatar } from "./user-avatar";
import { ReviewStatusBadge } from "./review-status-badge";
import { getRelativeTime } from "../utils/relative-time";
import {
  CheckIcon,
  ClipboardCopyIcon,
  ExternalLinkIcon,
  GitPullRequestDraftIcon,
  UsersIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_BORDER: Record<ReviewStatus, string> = {
  approved: "border-l-status-approved",
  changes_requested: "border-l-status-changes-requested",
  pending: "border-l-status-pending",
  commented: "border-l-status-commented",
};

type PRCardProps = {
  pr: PullRequest;
  onAuthorClick?: (username: string) => void;
};

function CopyPromptButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigator.clipboard.writeText(`review this pr for me "${url}"`);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <ClipboardCopyIcon className="size-3.5" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Copied!" : "Copy review prompt"}
      </TooltipContent>
    </Tooltip>
  );
}

export function PRCard({ pr, onAuthorClick }: PRCardProps) {
  return (
    <a
      href={pr.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block rounded-xl border border-border bg-card p-4 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/20",
        "border-l-[3px]",
        pr.isDraft ? "border-l-status-draft" : STATUS_BORDER[pr.reviewStatus],
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium leading-snug text-card-foreground transition-colors group-hover:text-primary">
          {pr.title}
        </h3>
        <div className="flex items-center gap-1.5">
          <CopyPromptButton url={pr.url} />
          <ExternalLinkIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      {/* Meta row */}
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{pr.repo}</span>
        <span className="text-border">·</span>
        <span className="font-mono">#{pr.number}</span>
        <span className="text-border">·</span>
        <span>{getRelativeTime(pr.createdAt)}</span>
        {pr.isDraft && (
          <>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1 text-status-draft">
              <GitPullRequestDraftIcon className="size-3" />
              Draft
            </span>
          </>
        )}
      </div>

      {/* Labels + Status */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {pr.labels.map((label) => (
            <span
              key={label.name}
              className="rounded-full border px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: `${label.color}15`,
                color: label.color,
                borderColor: `${label.color}30`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {pr.requestedTeams.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <UsersIcon className="size-3" />
                  <span className="tabular-nums">
                    {pr.requestedTeams.length}
                  </span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="flex flex-col gap-1">
                <span className="text-xs font-medium">
                  Waiting on {pr.requestedTeams.length}{" "}
                  {pr.requestedTeams.length === 1 ? "team" : "teams"}
                </span>
                {pr.requestedTeams.map((team) => (
                  <a
                    key={team.slug}
                    href={`https://github.com/orgs/${pr.repo.split("/")[0]}/teams/${team.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-background/70 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {team.name}
                  </a>
                ))}
              </TooltipContent>
            </Tooltip>
          )}
          <ReviewStatusBadge status={pr.reviewStatus} />
        </div>
      </div>

      {/* Bottom row: Author + Diff + Reviewers */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-md px-1.5 py-0.5 -ml-1.5 transition-colors hover:bg-muted"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAuthorClick?.(pr.author);
          }}
        >
          <UserAvatar username={pr.author} className="size-5" />
          <span className="text-xs text-muted-foreground">{pr.author}</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px]">
            <span className="text-status-approved">+{pr.additions}</span>{" "}
            <span className="text-status-changes-requested">
              -{pr.deletions}
            </span>
          </span>

          {pr.reviewers.length > 0 && (
            <div className="flex -space-x-1.5">
              {pr.reviewers.map((reviewer) => (
                <Tooltip key={reviewer.username}>
                  <TooltipTrigger asChild>
                    <div className="transition-transform duration-200 hover:-translate-y-1 hover:z-10">
                      <UserAvatar
                        username={reviewer.username}
                        className="size-5 ring-2 ring-card"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {reviewer.username}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      </div>
    </a>
  );
}
