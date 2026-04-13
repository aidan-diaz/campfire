'use client';

import { useState } from 'react';
import { Task, getDifficultyConfig } from '@/data/ats/mockData';
import { CheckCircle2, Clock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  completed?: boolean;
  completedDate?: string;
  onComplete?: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({ task, completed = false, completedDate, onComplete, compact = false }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const diff = getDifficultyConfig(task.difficulty);

  const typeColors: Record<string, { bg: string; color: string; label: string }> = {
    general: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Universal' },
    company: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', label: 'Company' },
    role: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', label: 'Role' },
  };

  const typeStyle = typeColors[task.type];

  return (
    <div
      className="rounded-xl border transition-all duration-200"
      style={{
        background: completed ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
        borderColor: completed ? 'rgba(16,185,129,0.2)' : 'rgba(124,58,237,0.12)',
        opacity: completed ? 0.85 : 1,
      }}
    >
      <div
        className="flex items-start gap-3 cursor-pointer"
        style={{ padding: compact ? '12px 14px' : '16px' }}
        onClick={() => !compact && setExpanded(!expanded)}
      >
        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {completed ? (
            <CheckCircle2 size={20} style={{ color: '#10b981' }} />
          ) : (
            <div
              className="rounded-full flex items-center justify-center text-xs"
              style={{ width: 20, height: 20, background: diff.bg, color: diff.color, fontWeight: 700 }}
            >
              {diff.icon}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {task.questLabel && !compact && (
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles size={10} style={{ color: '#f59e0b' }} />
                  <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600, letterSpacing: '0.06em' }}>
                    {task.questLabel.toUpperCase()}
                  </span>
                </div>
              )}
              <div style={{ fontSize: compact ? 13 : 14, fontWeight: 600, color: completed ? '#94a3b8' : '#f1f5f9', textDecoration: completed ? 'line-through' : 'none' }}>
                {task.name}
              </div>
              {!compact && (
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{task.description}</div>
              )}
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div
                className="rounded-full px-2 py-0.5 flex items-center gap-1"
                style={{ background: diff.bg }}
              >
                <span style={{ fontSize: 10, color: diff.color, fontWeight: 700 }}>{diff.label}</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles size={10} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>+{task.points} XP</span>
              </div>
            </div>
          </div>

          {!compact && (
            <div className="flex items-center gap-3 mt-2">
              <div
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: typeStyle.bg, color: typeStyle.color, fontSize: 10, fontWeight: 600 }}
              >
                {typeStyle.label}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={10} style={{ color: '#64748b' }} />
                <span style={{ fontSize: 10, color: '#64748b' }}>{task.estimatedTime}</span>
              </div>
              {completedDate && (
                <span style={{ fontSize: 10, color: '#10b981' }}>✓ {completedDate}</span>
              )}
            </div>
          )}
        </div>

        {!compact && (
          <button className="shrink-0 mt-1" style={{ color: '#475569' }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Expanded */}
      {!compact && expanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(124,58,237,0.08)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>Why this matters: </span>
            {task.why}
          </div>

          {task.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {task.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-full"
                  style={{ fontSize: 10, background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {!completed && onComplete && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(task); }}
              className="rounded-lg px-4 py-2 transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              Accept Challenge
            </button>
          )}
          {completed && (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} style={{ color: '#10b981' }} />
              <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Challenge Complete! +{task.points} XP earned</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
