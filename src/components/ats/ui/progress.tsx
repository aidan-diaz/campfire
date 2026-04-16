"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { motion } from "motion/react";

import { cn } from "./utils";
import { retro } from "@/lib/animations";

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: "default" | "xp" | "segmented";
  animated?: boolean;
}

function Progress({
  className,
  value,
  variant = "default",
  animated = true,
  ...props
}: ProgressProps) {
  const fillClass =
    variant === "xp" || variant === "segmented"
      ? "xp-fill-segmented"
      : "bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-orange)]";

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative h-[18px] w-full overflow-hidden bg-[rgba(0,0,0,0.4)] border border-[rgba(252,191,73,0.2)]",
        className
      )}
      {...props}
    >
      {animated ? (
        <motion.div
          data-slot="progress-indicator"
          className={cn("h-full", fillClass)}
          initial={{ width: 0 }}
          animate={{ width: `${value || 0}%` }}
          transition={retro.xpFill}
        />
      ) : (
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className={cn("h-full transition-all", fillClass)}
          style={{ width: `${value || 0}%` }}
        />
      )}
    </ProgressPrimitive.Root>
  );
}

export { Progress };
