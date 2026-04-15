'use client';

import { useState } from 'react';
import { useAts } from '@/context/AtsContext';
import { TaskCard } from '@/components/ats/shared/TaskCard';
import { NewQuestApplyModal } from '@/components/ats/shared/NewQuestApplyModal';
import { allTasks, Task, getDifficultyConfig, getCompanyById, type Job } from '@/data/ats/mockData';
import { Swords, Trophy, Sparkles, Filter, CheckCircle2, Plus } from 'lucide-react';
import { motion } from 'motion/react';

type FilterType = 'all' | 'general' | 'company' | 'role' | 'completed';
type DiffFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function TasksHub() {
  const { currentApplicant, completeTask, allJobs } = useAts();
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [diffFilter, setDiffFilter] = useState<DiffFilter>('all');
  const [taskComplete, setTaskComplete] = useState<Task | null>(null);
  const [applyModal, setApplyModal] = useState(false);
  const [applyModalJobId, setApplyModalJobId] = useState<string | null>(null);

  const completedTaskIds = new Set(currentApplicant.completedTasks.map((ct) => ct.taskId));

  const handleComplete = async (task: Task) => {
    try {
      await completeTask(task.id, task.points);
      setTaskComplete(task);
    } catch {
      /* toast could go here */
    }
  };

  const filtered = allTasks.filter((t) => {
    if (typeFilter === 'completed') return completedTaskIds.has(t.id);
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (diffFilter !== 'all' && t.difficulty !== diffFilter) return false;
    return true;
  });

  const totalXP = currentApplicant.completedTasks.reduce((s, ct) => s + ct.pointsEarned, 0);
  const totalPossible = allTasks.reduce((s, t) => s + t.points, 0);

  const byType = {
    general: allTasks.filter((t) => t.type === 'general'),
    company: allTasks.filter((t) => t.type === 'company'),
    role: allTasks.filter((t) => t.type === 'role'),
  };

  const completedByType = {
    general: byType.general.filter((t) => completedTaskIds.has(t.id)).length,
    company: byType.company.filter((t) => completedTaskIds.has(t.id)).length,
    role: byType.role.filter((t) => completedTaskIds.has(t.id)).length,
  };

  const openApplyModal = (jobId?: string) => {
    setApplyModalJobId(jobId ?? null);
    setApplyModal(true);
  };

  const closeApplyModal = () => {
    setApplyModal(false);
    setApplyModalJobId(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Swords size={16} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>CHALLENGES</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Quest Board</h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              Complete challenges to prove your skills and advance through your journeys
            </p>
          </div>
          <button
            type="button"
            onClick={() => openApplyModal()}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 13, fontWeight: 600, boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
          >
            <Plus size={16} />
            New Quest
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Universal', count: completedByType.general, total: byType.general.length, color: '#818cf8', bg: 'rgba(99,102,241,0.08)' },
            { label: 'Company', count: completedByType.company, total: byType.company.length, color: '#f472b6', bg: 'rgba(236,72,153,0.08)' },
            { label: 'Role-Specific', count: completedByType.role, total: byType.role.length, color: '#fbbf24', bg: 'rgba(245,158,11,0.08)' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 11, color: s.color, fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
                {s.count}<span style={{ fontSize: 13, color: '#64748b', fontWeight: 400 }}>/{s.total}</span>
              </div>
              <div className="rounded-full overflow-hidden mt-2" style={{ height: 3, background: `${s.color}20` }}>
                <div style={{ width: `${(s.count / s.total) * 100}%`, height: '100%', background: s.color, borderRadius: '9999px' }} />
              </div>
            </div>
          ))}
        </div>

        {/* XP summary */}
        <div className="flex items-center gap-3 mt-4 rounded-xl p-3" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <Sparkles size={16} style={{ color: '#f59e0b' }} />
          <div style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
            {totalXP.toLocaleString()} XP earned
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>of {totalPossible.toLocaleString()} possible XP</div>
          <div className="flex-1 rounded-full overflow-hidden ml-2" style={{ height: 6, background: 'rgba(245,158,11,0.1)' }}>
            <div style={{ width: `${(totalXP / totalPossible) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: '9999px' }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex flex-wrap gap-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
        <div className="flex items-center gap-2">
          <Filter size={13} style={{ color: '#64748b' }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Type:</span>
        </div>
        {(['all', 'general', 'company', 'role', 'completed'] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setTypeFilter(f)}
            className="rounded-full px-3 py-1 transition-all"
            style={{
              fontSize: 12,
              fontWeight: typeFilter === f ? 700 : 400,
              background: typeFilter === f ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',
              color: typeFilter === f ? '#a78bfa' : '#94a3b8',
              border: `1px solid ${typeFilter === f ? '#7c3aed' : 'rgba(124,58,237,0.1)'}`,
            }}
          >
            {f === 'general' ? 'Universal' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}

        <div className="flex items-center gap-2 ml-2">
          <span style={{ fontSize: 12, color: '#64748b' }}>Difficulty:</span>
        </div>
        {(['all', 'easy', 'medium', 'hard'] as DiffFilter[]).map((d) => {
          const cfg = d !== 'all' ? getDifficultyConfig(d) : null;
          return (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className="rounded-full px-3 py-1 transition-all"
              style={{
                fontSize: 12,
                fontWeight: diffFilter === d ? 700 : 400,
                background: diffFilter === d ? (cfg ? cfg.bg : 'rgba(124,58,237,0.2)') : 'rgba(255,255,255,0.03)',
                color: diffFilter === d ? (cfg ? cfg.color : '#a78bfa') : '#94a3b8',
                border: `1px solid ${diffFilter === d ? (cfg ? cfg.color : '#7c3aed') : 'rgba(124,58,237,0.1)'}`,
              }}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>All challenges complete!</p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>You&apos;ve conquered every quest in this category.</p>
          </div>
        ) : (
          <>
            {/* Group by type if showing all */}
            {typeFilter === 'all' ? (
              <div className="space-y-8">
                <TaskGroup
                  title="Universal Challenges"
                  subtitle="Complete once — transfers to every company & role"
                  tasks={filtered.filter((t) => t.type === 'general')}
                  completedIds={completedTaskIds}
                  onComplete={handleComplete}
                  color="#818cf8"
                  allJobs={allJobs}
                />
                <TaskGroup
                  title="Company Challenges"
                  subtitle="Show genuine interest in specific companies"
                  tasks={filtered.filter((t) => t.type === 'company')}
                  completedIds={completedTaskIds}
                  onComplete={handleComplete}
                  color="#f472b6"
                  showCompany
                  allJobs={allJobs}
                />
                <TaskGroup
                  title="Role Challenges"
                  subtitle="Prove role-specific skills that matter most"
                  tasks={filtered.filter((t) => t.type === 'role')}
                  completedIds={completedTaskIds}
                  onComplete={handleComplete}
                  color="#fbbf24"
                  showRole
                  allJobs={allJobs}
                />
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((task) => {
                  const completed = completedTaskIds.has(task.id);
                  const ct = currentApplicant.completedTasks.find((x) => x.taskId === task.id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      completed={completed}
                      completedDate={ct?.dateCompleted}
                      onComplete={!completed ? handleComplete : undefined}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Completion Toast */}
      <NewQuestApplyModal open={applyModal} onClose={closeApplyModal} initialJobId={applyModalJobId} />

      {taskComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xs rounded-2xl border text-center p-8"
            style={{ background: '#0f0f1e', borderColor: 'rgba(245,158,11,0.3)', boxShadow: '0 0 60px rgba(245,158,11,0.2)' }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 40px rgba(245,158,11,0.5)' }}
            >
              <Trophy size={32} color="white" />
            </div>
            <p style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 8 }}>CHALLENGE COMPLETE</p>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{taskComplete.name}</h3>
            <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 16, fontStyle: 'italic' }}>{taskComplete.questLabel}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={18} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 32, fontWeight: 800, color: '#f59e0b' }}>+{taskComplete.points}</span>
              <span style={{ fontSize: 14, color: '#d97706' }}>XP</span>
            </div>
            <button
              onClick={() => setTaskComplete(null)}
              className="w-full rounded-xl py-3 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontSize: 14, fontWeight: 700 }}
            >
              Claim Reward
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function TaskGroup({
  title, subtitle, tasks, completedIds, onComplete, color, showCompany = false, showRole = false, allJobs,
}: {
  title: string;
  subtitle: string;
  tasks: Task[];
  completedIds: Set<string>;
  onComplete: (t: Task) => void;
  color: string;
  showCompany?: boolean;
  showRole?: boolean;
  allJobs: Job[];
}) {
  const { currentApplicant } = useAts();
  if (tasks.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{title}</h3>
          <p style={{ fontSize: 11, color: '#64748b' }}>{subtitle}</p>
        </div>
        <div className="ml-auto" style={{ fontSize: 12, color }}>
          {tasks.filter((t) => completedIds.has(t.id)).length}/{tasks.length}
        </div>
      </div>
      <div className="space-y-2">
        {tasks.map((task) => {
          const completed = completedIds.has(task.id);
          const ct = currentApplicant.completedTasks.find((x) => x.taskId === task.id);
          const company = showCompany && task.companyId ? getCompanyById(task.companyId) : null;
          const job = showRole && task.jobId ? allJobs.find((j) => j.id === task.jobId) : null;
          return (
            <div key={task.id}>
              {(company || job) && (
                <div className="flex items-center gap-2 mb-1 ml-1">
                  {company && <span style={{ fontSize: 10, color: company.color, fontWeight: 600 }}>{company.name}</span>}
                  {job && <span style={{ fontSize: 10, color: '#64748b' }}>· {job.title}</span>}
                </div>
              )}
              <TaskCard
                task={task}
                completed={completed}
                completedDate={ct?.dateCompleted}
                onComplete={!completed ? onComplete : undefined}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
