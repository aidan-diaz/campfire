"use client";

import Link from "next/link";
import { motion, useAnimate } from "motion/react";
import { useEffect, useState } from "react";
import { retro } from "@/lib/animations";

const LETTERS = ["G", "A", "M", "E", " ", "O", "V", "E", "R"];

export default function NotFound() {
  const [scope, animate] = useAnimate();
  const [showStats, setShowStats] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    async function sequence() {
      // Brief darkness, then flash
      await animate(scope.current, { opacity: 1 }, { duration: 0.05 });
      await animate(scope.current, { backgroundColor: "#3a0000" }, { duration: 0.08 });
      await animate(scope.current, { backgroundColor: "#001824" }, { duration: 0.3 });

      // Letters crash in one by one
      await animate(".go-letter", { opacity: 1, y: 0, scale: 1 }, {
        duration: 0.12,
        delay: (i) => i * 0.07,
        ease: [0.25, 0, 0.5, 1],
      });

      // Screen shake
      await animate(scope.current, { x: [0, -8, 8, -5, 5, -2, 2, 0] }, { duration: 0.4 });

      setShowStats(true);
      await new Promise((r) => setTimeout(r, 800));
      setShowPrompt(true);
    }
    sequence();
  }, [animate, scope]);

  return (
    <motion.div
      ref={scope}
      className="pixel-grid scanlines min-h-screen flex flex-col items-center justify-center gap-10 p-8"
      initial={{ opacity: 0, backgroundColor: "#001824" }}
    >
      {/* GAME OVER text */}
      <div className="flex gap-[0.12em] items-end select-none" aria-label="GAME OVER">
        {LETTERS.map((letter, i) => (
          <motion.span
            key={i}
            className="go-letter text-[var(--color-flag)] font-mono uppercase block"
            style={{
              fontSize: "clamp(2.5rem, 9vw, 5.5rem)",
              lineHeight: 1,
              letterSpacing: "0.04em",
              textShadow:
                "3px 3px 0 rgba(100,0,0,0.8), 0 0 30px rgba(214,40,40,0.7), 0 0 60px rgba(214,40,40,0.3)",
              minWidth: letter === " " ? "0.5em" : undefined,
            }}
            initial={{ opacity: 0, y: -80, scale: 1.4 }}
            animate={undefined}
          >
            {letter}
          </motion.span>
        ))}
      </div>

      {/* Glow underline */}
      <motion.div
        className="h-[3px] bg-[var(--color-flag)] rounded-none"
        initial={{ width: 0, opacity: 0 }}
        animate={showStats ? { width: "min(480px, 90vw)", opacity: 0.7 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ boxShadow: "0 0 12px rgba(214,40,40,0.8)" }}
      />

      {/* Stats panel */}
      <motion.div
        className="pixel-border-red bg-[#0d0000] rounded-none px-8 py-5 flex flex-col gap-3 w-full max-w-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={showStats ? { opacity: 1, y: 0 } : {}}
        transition={retro.snap}
      >
        <StatRow label="HP" value="0 / 100" danger />
        <StatRow label="LIVES" value="0" danger />
        <StatRow label="ERROR CODE" value="404" />
        <StatRow label="CAUSE OF DEATH" value="PAGE NOT FOUND" />
      </motion.div>

      {/* INSERT COIN prompt */}
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0 }}
        animate={showPrompt ? { opacity: 1 } : {}}
        transition={{ duration: 0.2 }}
      >
        <motion.p
          className="text-[var(--color-vanilla)] font-mono text-xs uppercase tracking-widest"
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
        >
          ▼ INSERT COIN TO CONTINUE ▼
        </motion.p>

        <Link
          href="/"
          className="rpg-button pixel-border inline-block px-8 py-3 text-xs font-mono uppercase tracking-widest text-[var(--color-gold)] bg-[var(--surface)] hover:bg-[var(--surface-raised)] transition-colors"
        >
          ▶ Continue
        </Link>
      </motion.div>
    </motion.div>
  );
}

function StatRow({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="stat-label mb-0 shrink-0">{label}</span>
      <span
        className="font-mono text-xs uppercase tracking-wider"
        style={{ color: danger ? "var(--color-flag)" : "var(--color-vanilla)" }}
      >
        {value}
      </span>
    </div>
  );
}
