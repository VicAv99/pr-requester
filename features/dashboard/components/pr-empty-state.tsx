import { InboxIcon } from "lucide-react";

type PREmptyStateProps = {
  message?: string;
};

export function PREmptyState({
  message = "No reviews assigned to you",
}: PREmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4">
        <InboxIcon className="size-8 text-muted-foreground" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">
        {message}
      </p>
      <p className="mt-1 text-xs text-muted-foreground/60">
        When someone requests your review on a pull request, it will appear here.
      </p>
    </div>
  );
}
