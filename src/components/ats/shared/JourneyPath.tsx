"use client";

import { ApplicationStage, stageStoryLabels, stageLabels } from "@/data/ats/mockData";
import { cn } from "@/components/ats/ui/utils";

const mainStages: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "final_round",
  "offered",
  "hired",
];

interface JourneyPathProps {
  currentStage: ApplicationStage;
  compact?: boolean;
}

export function JourneyPath({ currentStage, compact = false }: JourneyPathProps) {
  const isRejected = currentStage === "rejected";

  const getStageStatus = (
    stage: ApplicationStage
  ): "completed" | "current" | "future" | "rejected" => {
    if (isRejected) return stage === currentStage ? "rejected" : "completed";
    const mainStageIndex = mainStages.indexOf(stage);
    const currentIndex = mainStages.indexOf(currentStage);
    if (mainStageIndex < currentIndex) return "completed";
    if (mainStageIndex === currentIndex) return "current";
    return "future";
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {mainStages.map((stage, i) => {
          const status = getStageStatus(stage);
          return (
            <div key={stage} className="flex items-center gap-1">
              <div
                className={cn(
                  "transition-all",
                  status === "current" && "pulse-orange"
                )}
                style={{
                  width: status === "current" ? 10 : 6,
                  height: status === "current" ? 10 : 6,
                  background:
                    status === "completed"
                      ? "var(--color-gold)"
                      : status === "current"
                        ? "var(--color-orange)"
                        : status === "rejected"
                          ? "var(--color-flag)"
                          : "var(--surface)",
                  border:
                    status === "future"
                      ? "1px solid var(--border)"
                      : "none",
                  boxShadow:
                    status === "current"
                      ? "0 0 8px rgba(247,127,0,0.6)"
                      : status === "completed"
                        ? "0 0 4px rgba(252,191,73,0.4)"
                        : "none",
                }}
              />
              {i < mainStages.length - 1 && (
                <div
                  style={{
                    width: 12,
                    height: 2,
                    background:
                      status === "completed"
                        ? "repeating-linear-gradient(90deg, var(--color-gold) 0px, var(--color-gold) 3px, transparent 3px, transparent 5px)"
                        : "var(--border)",
                  }}
                />
              )}
            </div>
          );
        })}
        <span
          className="ml-2 text-[10px] uppercase tracking-wider"
          style={{
            color: isRejected
              ? "var(--color-flag)"
              : currentStage === "hired"
                ? "#4caf50"
                : "var(--color-orange)",
          }}
        >
          {stageStoryLabels[currentStage]}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="absolute top-4 left-4 right-4"
        style={{
          height: 3,
          background:
            "repeating-linear-gradient(90deg, var(--border) 0px, var(--border) 6px, transparent 6px, transparent 10px)",
          zIndex: 0,
        }}
      />
      <div
        className="flex items-start justify-between relative"
        style={{ zIndex: 1 }}
      >
        {mainStages.map((stage) => {
          const status = getStageStatus(stage);
          return (
            <div
              key={stage}
              className="flex flex-col items-center gap-2"
              style={{ minWidth: 0, flex: 1 }}
            >
              <div
                className={cn(
                  "flex items-center justify-center transition-all text-xs",
                  status === "current" && "pulse-orange"
                )}
                style={{
                  width: 32,
                  height: 32,
                  background:
                    status === "completed"
                      ? "var(--color-gold)"
                      : status === "current"
                        ? "var(--color-orange)"
                        : status === "rejected"
                          ? "var(--color-flag)"
                          : "var(--surface)",
                  border:
                    status === "future"
                      ? "2px solid var(--border)"
                      : "2px solid transparent",
                  color:
                    status === "completed" || status === "current"
                      ? "var(--primary-foreground)"
                      : status === "rejected"
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                  boxShadow:
                    status === "completed"
                      ? "2px 2px 0 rgba(0,0,0,0.4), 0 0 12px rgba(252,191,73,0.3)"
                      : status === "current"
                        ? "2px 2px 0 rgba(0,0,0,0.4)"
                        : "none",
                }}
              >
                {status === "completed"
                  ? "✓"
                  : status === "current"
                    ? "◉"
                    : status === "rejected"
                      ? "✗"
                      : "○"}
              </div>
              <div className="text-center px-1">
                <div
                  className="text-[10px] uppercase tracking-wider"
                  style={{
                    color:
                      status === "completed"
                        ? "var(--color-gold)"
                        : status === "current"
                          ? "var(--color-orange)"
                          : status === "rejected"
                            ? "var(--color-flag)"
                            : "var(--muted-foreground)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {stageLabels[stage]}
                </div>
                {status === "current" && (
                  <div
                    className="text-[8px] uppercase tracking-wider mt-0.5"
                    style={{ color: "var(--color-orange)" }}
                  >
                    {stageStoryLabels[stage]}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
