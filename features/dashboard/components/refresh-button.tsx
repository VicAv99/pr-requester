"use client";

import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function RefreshButton() {
  const queryClient = useQueryClient();
  const isFetching = useIsFetching();

  return (
    <Button
      variant="outline"
      size="icon-sm"
      title="Refresh"
      onClick={() => queryClient.invalidateQueries()}
    >
      <RefreshCwIcon
        className={cn("size-3.5", isFetching > 0 && "animate-spin")}
      />
    </Button>
  );
}
