"use client";

import { getXPLevelThreshold } from "@/data/ats/mockData";
import { motion } from "motion/react";
import { retro } from "@/lib/animations";

interface XPBarProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
  compact?: boolean;
}

const rankNames = [
  "",
  "Wanderer",
  "Seeker",
  "Apprentice",
  "Challenger",
  "Contender",
  "Artisan",
  "Pathfinder",
  "Champion",
  "Elite",
  "Master",
  "Grandmaster",
  "Legendary",
  "Mythic",
  "Transcendent",
  "Apex",
];

export function XPBar({
  level,
  xp,
  xpToNextLevel,
  compact = false,
}: XPBarProps) {
  const levelStart = getXPLevelThreshold(level - 1);
  const levelEnd = xpToNextLevel;
  const progress = Math.min(
    ((xp - levelStart) / (levelEnd - levelStart)) * 100,
    100
  );
  const rankName = rankNames[Math.min(level, rankNames.length - 1)];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center shrink-0 text-xs"
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
            border: "2px solid var(--color-gold)",
            boxShadow: "2px 2px 0 rgba(0,0,0,0.4)",
            color: "var(--primary-foreground)",
            fontWeight: 700,
          }}
        >
          {level}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-[10px] uppercase tracking-wider"
              style={{ color: "var(--color-orange)" }}
            >
              {rankName}
            </span>
            <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
              {xp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
            </span>
          </div>
          <div
            className="overflow-hidden"
            style={{
              height: 6,
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(252,191,73,0.2)",
            }}
          >
            <motion.div
              className="h-full xp-fill-segmented"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={retro.xpFill}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pixel-border p-4"
      style={{ background: "var(--surface)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center"
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, var(--color-gold), var(--color-orange))",
              border: "2px solid var(--color-gold)",
              boxShadow: "3px 3px 0 rgba(0,0,0,0.4), 0 0 20px rgba(252,191,73,0.3)",
            }}
          >
            <span
              className="text-xl"
              style={{ color: "var(--primary-foreground)", fontWeight: 700 }}
            >
              {level}
            </span>
          </div>
          <div>
            <div
              className="text-[10px] uppercase tracking-widest"
              style={{ color: "var(--muted-foreground)" }}
            >
              Career Level
            </div>
            <div
              className="text-xs uppercase tracking-wider"
              style={{ color: "var(--color-orange)" }}
            >
              {rankName}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-[10px] uppercase tracking-widest"
            style={{ color: "var(--muted-foreground)" }}
          >
            Total XP
          </div>
          <div className="flex items-center gap-1 justify-end">
            <span className="text-[10px]" style={{ color: "var(--color-gold)" }}>
              ★
            </span>
            <span
              className="text-lg"
              style={{ color: "var(--color-gold)", fontWeight: 700 }}
            >
              {xp.toLocaleString()}
            </span>
          </div>
          <div className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
            {(xpToNextLevel - xp).toLocaleString()} XP to Level {level + 1}
          </div>
        </div>
      </div>

      <div
        className="overflow-hidden mb-2"
        style={{
          height: 18,
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(252,191,73,0.2)",
        }}
      >
        <motion.div
          className="h-full xp-fill-segmented"
          style={{ boxShadow: "0 0 12px rgba(252,191,73,0.5)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={retro.xpFill}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          LVL {level}
        </span>
        <span
          className="text-[10px]"
          style={{ color: "var(--color-gold)" }}
        >
          {Math.round(progress)}%
        </span>
        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
          LVL {level + 1}
        </span>
      </div>
    </div>
  );
}
