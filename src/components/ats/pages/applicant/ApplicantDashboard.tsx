'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { XPBar } from '@/components/ats/shared/XPBar';
import { JourneyPath } from '@/components/ats/shared/JourneyPath';
import { TaskCard } from '@/components/ats/shared/TaskCard';
import {
  getCompanyById, allTasks, Task,
  stageStoryLabels, stageLabels, Application,
  getTeamMemberById,
  type Job,
} from '@/data/ats/mockData';
import {
  Map, Plus, MessageSquare, Trophy, Sparkles, ChevronRight,
  Building2, Swords, Star, X, CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ApplicantDashboard() {
  const { currentApplicant, allJobs, applyToJob, completeTask } = useAts();
  const jobById = (id: string) => allJobs.find((j) => j.id === id);
  const router = useRouter();
  const [applyModal, setApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState(1);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [source, setSource] = useState('');
  const [taskCompleteModal, setTaskCompleteModal] = useState<Task | null>(null);

  const activeApplications = currentApplicant.applications.filter(
    (a) => a.stage !== 'hired' && a.stage !== 'rejected'
  );
  const completedApplications = currentApplicant.applications.filter(
    (a) => a.stage === 'hired' || a.stage === 'rejected'
  );

  const completedTaskIds = new Set(currentApplicant.completedTasks.map((ct) => ct.taskId));
  const suggestedTasks = allTasks.filter((t) => !completedTaskIds.has(t.id) && t.type === 'general').slice(0, 3);

  const openJobs = allJobs.filter(
    (j) => j.status === 'open' && !currentApplicant.applications.some((a) => a.jobId === j.id)
  );

  const handleCompleteTask = async (task: Task) => {
    try {
      await completeTask(task.id, task.points);
      setTaskCompleteModal(task);
    } catch {
      /* optional: surface error */
    }
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    const job = jobById(selectedJob);
    if (!job) return;
    try {
      await applyToJob(selectedJob, job.companyId, source || 'Direct');
    } catch {
      return;
    }
    setApplyModal(false);
    setApplyStep(1);
    setSelectedJob(null);
    setSource('');
  };

  const feedbackApps = currentApplicant.applications.filter((a) => a.feedbackForApplicant);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Map size={16} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>YOUR JOURNEY</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Welcome back, {currentApplicant.firstName}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {activeApplications.length} active quest{activeApplications.length !== 1 ? 's' : ''} · {currentApplicant.completedTasks.length} challenges completed
            </p>
          </div>
          <button
            onClick={() => setApplyModal(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90 shrink-0"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 13, fontWeight: 600, boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
          >
            <Plus size={16} />
            New Quest
          </button>
        </div>
        <XPBar level={currentApplicant.level} xp={currentApplicant.xp} xpToNextLevel={currentApplicant.xpToNextLevel} />
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Quests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Active Quests</h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>{activeApplications.length} journeys in progress</span>
          </div>

          {activeApplications.length === 0 ? (
            <div className="rounded-xl border text-center py-12" style={{ borderColor: 'rgba(124,58,237,0.1)', background: 'rgba(255,255,255,0.01)' }}>
              <Map size={32} style={{ color: '#334155', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: '#475569' }}>No active quests yet.</p>
              <button onClick={() => setApplyModal(true)} style={{ fontSize: 13, color: '#a78bfa', marginTop: 8 }}>Start your first journey →</button>
            </div>
          ) : (
            activeApplications.map((app) => (
              <ApplicationCard key={app.id} app={app} onCompleteTask={handleCompleteTask} completedTaskIds={completedTaskIds} jobById={jobById} />
            ))
          )}

          {/* Completed/Closed */}
          {completedApplications.length > 0 && (
            <>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginTop: 8 }}>Past Quests</h2>
              {completedApplications.map((app) => (
                <ApplicationCard key={app.id} app={app} onCompleteTask={handleCompleteTask} completedTaskIds={completedTaskIds} jobById={jobById} />
              ))}
            </>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Feedback Inbox */}
          {feedbackApps.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(99,102,241,0.1)' }}>
                <MessageSquare size={14} style={{ color: '#818cf8' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Guide Feedback</span>
                <span className="ml-auto rounded-full px-2 py-0.5" style={{ fontSize: 10, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 700 }}>
                  {feedbackApps.length}
                </span>
              </div>
              <div className="divide-y divide-[rgba(99,102,241,0.08)]">
                {feedbackApps.slice(0, 2).map((app) => {
                  const job = jobById(app.jobId);
                  const company = getCompanyById(app.companyId);
                  return (
                    <div key={app.id} className="px-4 py-3">
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6 }}>
                        {job?.title} · <span style={{ color: company?.color }}>{company?.name}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, fontStyle: 'italic' }}>
                        "{app.feedbackForApplicant}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Tasks */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <Sparkles size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>Suggested Challenges</span>
            </div>
            <div className="p-3 space-y-2">
              {suggestedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={handleCompleteTask} />
              ))}
              {suggestedTasks.length === 0 && (
                <div className="py-6 text-center">
                  <Trophy size={24} style={{ color: '#f59e0b', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#64748b' }}>All general challenges complete!</p>
                </div>
              )}
              <button
                onClick={() => router.push('/applicant/tasks')}
                className="w-full rounded-lg py-2 mt-1 flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ background: 'rgba(124,58,237,0.1)', color: '#a78bfa', fontSize: 13, fontWeight: 600 }}
              >
                <Swords size={14} />
                View All Challenges
              </button>
            </div>
          </div>

          {/* Open Roles */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <Building2 size={14} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>New Quests Available</span>
            </div>
            <div className="divide-y divide-[rgba(124,58,237,0.06)]">
              {openJobs.slice(0, 3).map((job) => {
                const company = getCompanyById(job.companyId);
                return (
                  <div key={job.id} className="px-4 py-3 flex items-center justify-between gap-2">
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{job.title}</div>
                      <div style={{ fontSize: 11, color: company?.color }}>{company?.name}</div>
                    </div>
                    <button
                      onClick={() => { setSelectedJob(job.id); setApplyModal(true); }}
                      className="shrink-0 rounded-lg px-3 py-1.5 transition-all hover:opacity-80"
                      style={{ background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontSize: 11, fontWeight: 600 }}
                    >
                      Apply
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ background: '#0f0f1e', borderColor: 'rgba(124,58,237,0.2)' }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
              <div>
                <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>NEW QUEST</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
                  {applyStep === 1 ? 'Choose Your Quest' : applyStep === 2 ? 'Share Your Path' : 'Begin the Journey'}
                </h3>
              </div>
              <button onClick={() => { setApplyModal(false); setApplyStep(1); setSelectedJob(null); }}><X size={20} style={{ color: '#64748b' }} /></button>
            </div>

            <div className="px-6 py-5">
              {applyStep === 1 && (
                <div className="space-y-3">
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Select a role to begin your journey</p>
                  {openJobs.map((job) => {
                    const company = getCompanyById(job.companyId);
                    return (
                      <button
                        key={job.id}
                        onClick={() => setSelectedJob(job.id)}
                        className="w-full flex items-center gap-3 rounded-xl border text-left transition-all p-4"
                        style={{
                          borderColor: selectedJob === job.id ? company?.color || '#7c3aed' : 'rgba(124,58,237,0.1)',
                          background: selectedJob === job.id ? `${company?.color}15` : 'rgba(255,255,255,0.01)',
                        }}
                      >
                        <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: `${company?.color}20`, fontSize: 16 }}>
                          {company?.logo}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{job.title}</div>
                          <div style={{ fontSize: 12, color: company?.color }}>{company?.name} · {job.team}</div>
                        </div>
                        {selectedJob === job.id && <CheckCircle2 size={16} style={{ color: company?.color, marginLeft: 'auto' }} />}
                      </button>
                    );
                  })}
                  {openJobs.length === 0 && <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: '24px 0' }}>You've applied to all open roles!</p>}
                </div>
              )}

              {applyStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 8 }}>How did you hear about this role?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['LinkedIn', 'Referral', 'Company Website', 'Indeed', 'Twitter/X', 'Other'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSource(s)}
                          className="rounded-lg py-2 px-3 text-left transition-all"
                          style={{
                            fontSize: 13,
                            background: source === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.02)',
                            color: source === s ? '#a78bfa' : '#94a3b8',
                            border: `1px solid ${source === s ? '#7c3aed' : 'rgba(124,58,237,0.1)'}`,
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedJob && (
                    <div className="rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                      <p style={{ fontSize: 12, color: '#94a3b8' }}>
                        <span style={{ color: '#a78bfa', fontWeight: 600 }}>Required on apply: </span>
                        Complete the role's required challenge after applying to stand out.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {applyStep === 3 && (
                <div className="text-center py-4">
                  <div
                    className="flex items-center justify-center rounded-full mx-auto mb-4"
                    style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
                  >
                    <Map size={28} color="white" />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Quest Begun! ⚔️</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                    Your application is in. Complete challenges to boost your ranking and move faster through the journey.
                  </p>
                  <div className="flex items-center gap-2 justify-center mt-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    <Star size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: 12, color: '#f59e0b' }}>Complete challenges to earn XP and level up your journey!</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
              {applyStep < 3 && (
                <>
                  {applyStep > 1 && (
                    <button onClick={() => setApplyStep(applyStep - 1)} className="flex-1 rounded-xl py-2.5" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 14 }}>
                      Back
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (applyStep === 2) { handleApply(); setApplyStep(3); }
                      else if (selectedJob) setApplyStep(applyStep + 1);
                    }}
                    disabled={applyStep === 1 && !selectedJob}
                    className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 14, fontWeight: 600 }}
                  >
                    {applyStep === 2 ? 'Begin Quest' : 'Continue'}
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
              {applyStep === 3 && (
                <button
                  onClick={() => { setApplyModal(false); setApplyStep(1); setSelectedJob(null); }}
                  className="flex-1 rounded-xl py-2.5"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 14, fontWeight: 600 }}
                >
                  View My Journey
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Task Complete Modal */}
      {taskCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-2xl border text-center p-8"
            style={{ background: '#0f0f1e', borderColor: 'rgba(245,158,11,0.3)' }}
          >
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-4"
              style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 0 30px rgba(245,158,11,0.4)' }}
            >
              <Trophy size={28} color="white" />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Challenge Complete!</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 12 }}>{taskCompleteModal.name}</p>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles size={16} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 24, fontWeight: 800, color: '#f59e0b' }}>+{taskCompleteModal.points} XP</span>
            </div>
            <button
              onClick={() => setTaskCompleteModal(null)}
              className="w-full rounded-xl py-2.5 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontSize: 14, fontWeight: 600 }}
            >
              Awesome!
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ApplicationCard({
  app,
  onCompleteTask,
  completedTaskIds,
  jobById,
}: {
  app: Application;
  onCompleteTask: (t: Task) => void;
  completedTaskIds: Set<string>;
  jobById: (id: string) => Job | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const job = jobById(app.jobId);
  const company = getCompanyById(app.companyId);
  if (!job || !company) return null;

  const guides = app.assignedInterviewerIds.map(getTeamMemberById).filter(Boolean);
  const isTerminal = app.stage === 'hired' || app.stage === 'rejected';

  const availableTasks = allTasks.filter(
    (t) =>
      !completedTaskIds.has(t.id) &&
      (t.type === 'general' ||
        (t.type === 'company' && t.companyId === app.companyId) ||
        (t.type === 'role' && t.jobId === app.jobId))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: isTerminal ? (app.stage === 'hired' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)') : `${company.color}30`,
        background: isTerminal ? (app.stage === 'hired' ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.03)') : `${company.color}08`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-4 p-4">
        <div
          className="flex items-center justify-center rounded-xl shrink-0 text-lg"
          style={{ width: 44, height: 44, background: `${company.color}20`, border: `1px solid ${company.color}30` }}
        >
          {company.logo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{job.title}</h3>
              <div style={{ fontSize: 12, color: company.color, fontWeight: 600 }}>{company.name}</div>
            </div>
            <div
              className="shrink-0 px-2.5 py-1 rounded-full"
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: app.stage === 'hired' ? 'rgba(16,185,129,0.15)' : app.stage === 'rejected' ? 'rgba(239,68,68,0.15)' : `${company.color}15`,
                color: app.stage === 'hired' ? '#10b981' : app.stage === 'rejected' ? '#ef4444' : company.accentColor,
              }}
            >
              {stageStoryLabels[app.stage]}
            </div>
          </div>

          <div className="mt-3">
            <JourneyPath currentStage={app.stage} />
          </div>
        </div>
      </div>

      {/* Guides */}
      {guides.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <span style={{ fontSize: 11, color: '#64748b' }}>Guides:</span>
          {guides.map((g) => g && (
            <div
              key={g.id}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: 18, height: 18, background: `${company.color}30`, fontSize: 8, fontWeight: 700, color: company.color }}
              >
                {g.avatar}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>{g.firstName} · {g.guideArchetype}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expand */}
      {!isTerminal && (
        <>
          <div
            className="flex items-center justify-between px-4 py-2 cursor-pointer border-t"
            style={{ borderColor: `${company.color}15` }}
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-center gap-2">
              <Swords size={12} style={{ color: company.accentColor }} />
              <span style={{ fontSize: 12, color: company.accentColor, fontWeight: 600 }}>
                {availableTasks.length} challenges available
              </span>
            </div>
            <ChevronRight size={14} style={{ color: '#475569', transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }} />
          </div>

          {expanded && (
            <div className="px-4 pb-4 space-y-2">
              {availableTasks.slice(0, 3).map((t) => (
                <TaskCard key={t.id} task={t} onComplete={onCompleteTask} compact />
              ))}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
