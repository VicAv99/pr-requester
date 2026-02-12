import { cn } from "@/lib/utils";
import type { ReviewStatus } from "../types/dashboard";
import {
  CircleCheckIcon,
  CircleDotIcon,
  CircleXIcon,
  MessageCircleIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<
  ReviewStatus,
  { label: string; className: string; icon: typeof CircleCheckIcon }
> = {
  approved: {
    label: "Approved",
    className: "text-status-approved",
    icon: CircleCheckIcon,
  },
  changes_requested: {
    label: "Changes Requested",
    className: "text-status-changes-requested",
    icon: CircleXIcon,
  },
  pending: {
    label: "Pending Review",
    className: "text-status-pending",
    icon: CircleDotIcon,
  },
  commented: {
    label: "Commented",
    className: "text-status-commented",
    icon: MessageCircleIcon,
  },
};

type ReviewStatusBadgeProps = {
  status: ReviewStatus;
  className?: string;
};

export function ReviewStatusBadge({
  status,
  className,
}: ReviewStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  );
}
