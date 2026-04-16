"use client";

import { cn } from "@/components/ats/ui/utils";

interface QuestStepperProps {
  steps: string[];
  currentIndex: number;
  className?: string;
}

export function QuestStepper({
  steps,
  currentIndex,
  className,
}: QuestStepperProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isActive = index === currentIndex;
        const isFuture = index > currentIndex;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 text-xs transition-all",
                  isCompleted && "bg-[var(--color-gold)] text-[var(--primary-foreground)]",
                  isActive && "bg-[var(--color-orange)] text-[var(--primary-foreground)] pulse-orange",
                  isFuture && "bg-transparent border-2 border-[var(--border)] text-[var(--muted-foreground)]"
                )}
                style={{
                  boxShadow: isCompleted
                    ? "2px 2px 0 rgba(0,0,0,0.4), 0 0 12px rgba(252,191,73,0.3)"
                    : isActive
                      ? "2px 2px 0 rgba(0,0,0,0.4)"
                      : "none",
                }}
              >
                {isCompleted ? "✓" : isActive ? "◉" : "○"}
              </div>
              <span
                className={cn(
                  "mt-2 text-[10px] uppercase tracking-wider text-center max-w-[80px]",
                  isCompleted && "text-[var(--color-gold)]",
                  isActive && "text-[var(--color-orange)]",
                  isFuture && "text-[var(--muted-foreground)]"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-[3px] mx-2"
                style={{
                  background:
                    index < currentIndex
                      ? "repeating-linear-gradient(90deg, var(--color-gold) 0px, var(--color-gold) 6px, transparent 6px, transparent 10px)"
                      : "repeating-linear-gradient(90deg, rgba(234,226,183,0.2) 0px, rgba(234,226,183,0.2) 6px, transparent 6px, transparent 10px)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
