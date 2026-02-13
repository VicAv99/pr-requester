import { cn } from "@/lib/utils";
import {
  GitPullRequestIcon,
  InboxIcon,
  UsersIcon,
} from "lucide-react";

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ElementType;
  accentColor: string;
  delay: number;
};

function StatCard({ label, value, icon: Icon, accentColor, delay }: StatCardProps) {
  return (
    <div
      className={cn(
        "animate-count-up rounded-xl border border-border/50 bg-card p-5"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <p
          className="font-display text-4xl italic tracking-tight"
          style={{ color: accentColor }}
        >
          {value}
        </p>
        <Icon
          className="size-5"
          style={{ color: accentColor, opacity: 0.4 }}
        />
      </div>
      <p className="mt-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

type StatsBarProps = {
  assignedCount: number;
  teamPrsCount: number;
};

export function StatsBar({
  assignedCount,
  teamPrsCount,
}: StatsBarProps) {
  const total = assignedCount + teamPrsCount;

  const stats = [
    {
      label: "Total in Scope",
      value: total,
      icon: GitPullRequestIcon,
      accentColor: "oklch(0.75 0.12 250)",
    },
    {
      label: "Assigned to You",
      value: assignedCount,
      icon: InboxIcon,
      accentColor: "oklch(0.80 0.15 85)",
    },
    {
      label: "Team Pull Requests",
      value: teamPrsCount,
      icon: UsersIcon,
      accentColor: "oklch(0.75 0.18 155)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} delay={i * 100} />
      ))}
    </div>
  );
}
