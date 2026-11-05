"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Trash2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HOLD_DURATION = 1500;
const PROGRESS_R = 9;
const PROGRESS_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_R;

type HoldToDeleteButtonProps = {
  onDelete: () => void;
  label?: string;
  className?: string;
};

export function HoldToDeleteButton({
  onDelete,
  label = "Hold to delete",
  className,
}: HoldToDeleteButtonProps) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startHold = useCallback(() => {
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      onDeleteRef.current();
    }, HOLD_DURATION);
  }, []);

  const cancelHold = useCallback(() => {
    setHolding(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive",
            className,
          )}
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
        >
          <svg
            className="absolute inset-1 -rotate-90"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r={PROGRESS_R}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={PROGRESS_CIRCUMFERENCE}
              strokeDashoffset={holding ? 0 : PROGRESS_CIRCUMFERENCE}
              className="text-destructive"
              style={{
                transition: holding
                  ? `stroke-dashoffset ${HOLD_DURATION}ms linear`
                  : "stroke-dashoffset 150ms ease-out",
              }}
            />
          </svg>
          <Trash2Icon className="relative size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
