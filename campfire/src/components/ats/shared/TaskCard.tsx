"use client";

import { useState } from "react";
import { Task, getDifficultyConfig } from "@/data/ats/mockData";
import { motion, AnimatePresence } from "motion/react";
import { Clock } from "lucide-react";
import { cn } from "@/components/ats/ui/utils";
import { Badge } from "@/components/ats/ui/badge";
import { Button } from "@/components/ats/ui/button";
import { retro, chevronVariants } from "@/lib/animations";

interface TaskCardProps {
  task: Task;
  completed?: boolean;
  completedDate?: string;
  onComplete?: (task: Task) => void;
  compact?: boolean;
}

const difficultyStars: Record<string, string> = {
  easy: "★",
  medium: "★★",
  hard: "★★★",
};

const typeLabels: Record<string, { label: string; color: string }> = {
  general: { label: "Universal", color: "var(--color-gold)" },
  company: { label: "Company", color: "#f472b6" },
  role: { label: "Role", color: "var(--color-orange)" },
};

export function TaskCard({
  task,
  completed = false,
  completedDate,
  onComplete,
  compact = false,
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const diff = getDifficultyConfig(task.difficulty);
  const typeStyle = typeLabels[task.type];

  if (compact) {
    return (
      <div
        className={cn(
          "p-3 transition-all",
          completed ? "pixel-border-success opacity-80" : "pixel-border"
        )}
        style={{ background: "var(--surface)" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 text-[10px] px-1.5 py-0.5"
            style={{
              background: `${diff.bg}`,
              color: diff.color,
              border: `1px solid ${diff.color}`,
            }}
          >
            {difficultyStars[task.difficulty]} {diff.label.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                "text-xs",
                completed && "line-through text-[var(--muted-foreground)]"
              )}
              style={{ color: completed ? undefined : "var(--foreground)" }}
            >
              {task.name}
            </div>
          </div>
          <Badge variant="xp" className="shrink-0">
            +{task.points} XP
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "overflow-hidden transition-all",
        completed ? "pixel-border-success" : "pixel-border"
      )}
      style={{ background: "var(--surface)" }}
      whileHover={!completed ? { y: -2 } : undefined}
      transition={{ duration: 0.15 }}
    >
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="shrink-0 text-[10px] px-2 py-1"
          style={{
            background: diff.bg,
            color: diff.color,
            border: `1px solid ${diff.color}`,
          }}
        >
          {difficultyStars[task.difficulty]} {diff.label.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {task.questLabel && (
            <div
              className="text-[10px] uppercase tracking-widest mb-1"
              style={{ color: "var(--color-orange)" }}
            >
              ★ {task.questLabel}
            </div>
          )}
          <div
            className={cn(
              "text-sm mb-1",
              completed && "line-through text-[var(--muted-foreground)]"
            )}
            style={{ color: completed ? undefined : "var(--foreground)" }}
          >
            {task.name}
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-[10px] uppercase tracking-wider px-2 py-0.5"
              style={{
                background: `${typeStyle.color}15`,
                color: typeStyle.color,
                border: `1px solid ${typeStyle.color}40`,
              }}
            >
              {typeStyle.label}
            </span>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              <Clock size={10} />
              {task.estimatedTime}
            </div>
            {completedDate && (
              <span className="text-[10px]" style={{ color: "#4caf50" }}>
                ✓ {completedDate}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge variant="xp">+{task.points} XP</Badge>
          <motion.span
            className="text-sm"
            style={{ color: "var(--color-gold)" }}
            variants={chevronVariants}
            animate={expanded ? "open" : "closed"}
            transition={retro.snap}
          >
            ▶
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={retro.snap}
            className="overflow-hidden"
          >
            <div
              className="px-4 pb-4 pt-3 border-t-2"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="text-xs mb-3" style={{ color: "var(--foreground)" }}>
                <span style={{ color: "var(--color-orange)" }}>► Why this matters: </span>
                {task.why}
              </div>

              {task.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {task.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-[10px] px-2 py-0.5"
                      style={{
                        background: "rgba(252,191,73,0.1)",
                        color: "var(--color-gold)",
                        border: "1px solid rgba(252,191,73,0.3)",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {!completed && onComplete && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete(task);
                  }}
                  className="w-full"
                >
                  Accept Challenge +{task.points} XP
                </Button>
              )}

              {completed && (
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#4caf50" }}
                >
                  ✓ Challenge Complete! +{task.points} XP earned
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
