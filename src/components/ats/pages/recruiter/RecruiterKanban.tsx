'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import {
  getCompanyById, getTeamMemberById, allTasks, teamMembers,
  stageLabels, stageStoryLabels, ApplicationStage, stageOrder,
  Applicant, Application,
} from '@/data/ats/mockData';
import {
  ChevronLeft, Users, Star, Sparkles, User, MessageSquare,
  CheckCircle2, ChevronDown, ChevronUp, ArrowRight, X, Filter,
  Swords, Clock, Award, Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const KANBAN_STAGES: ApplicationStage[] = ['applied', 'screening', 'interview', 'final_round', 'offered', 'hired'];

const stageColors: Record<ApplicationStage, { bg: string; border: string; color: string; accent: string }> = {
  applied:     { bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.2)',  color: '#94a3b8', accent: '#cbd5e1' },
  screening:   { bg: 'rgba(99,102,241,0.06)',  border: 'rgba(99,102,241,0.2)',   color: '#818cf8', accent: '#a5b4fc' },
  interview:   { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.2)',   color: '#f59e0b', accent: '#fbbf24' },
  final_round: { bg: 'rgba(236,72,153,0.06)',  border: 'rgba(236,72,153,0.2)',   color: '#ec4899', accent: '#f472b6' },
  offered:     { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.2)',   color: '#10b981', accent: '#34d399' },
  hired:       { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)',  color: '#f59e0b', accent: '#fbbf24' },
  rejected:    { bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.15)',   color: '#ef4444', accent: '#f87171' },
};

export default function RecruiterKanban() {
  const params = useParams();
  const jobId = typeof params.jobId === 'string' ? params.jobId : Array.isArray(params.jobId) ? params.jobId[0] : undefined;
  const router = useRouter();
  const {
    allJobs,
    allApplicants,
    updateApplicationStage,
    updateApplicantFeedback,
    assignInterviewerToApplication,
    currentTeamMember,
  } = useAts();

  const job = allJobs.find((j) => j.id === jobId);
  const company = job ? getCompanyById(job.companyId) : null;

  const [selectedCard, setSelectedCard] = useState<{ applicant: Applicant; application: Application } | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState('');
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [rejectedVisible, setRejectedVisible] = useState(false);

  if (!job || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a14' }}>
        <div className="text-center">
          <p style={{ color: '#64748b' }}>Job not found.</p>
          <button onClick={() => router.push('/recruiter/jobs')} style={{ color: '#a78bfa', fontSize: 13, marginTop: 8 }}>← Back</button>
        </div>
      </div>
    );
  }

  // Group applicants by stage
  const applicantsForJob = allApplicants.filter((a) => job.applicantIds.includes(a.id));

  const getApplicantApplication = (applicant: Applicant) =>
    applicant.applications.find((app) => app.jobId === job.id);

  const byStage: Record<ApplicationStage, { applicant: Applicant; application: Application }[]> = {
    applied: [], screening: [], interview: [], final_round: [], offered: [], hired: [], rejected: [],
  };

  applicantsForJob.forEach((a) => {
    const app = getApplicantApplication(a);
    if (app) {
      const s = app.stage in byStage ? app.stage : 'applied';
      byStage[s].push({ applicant: a, application: app });
    }
  });

  // Filter by search
  const filteredByStage = Object.fromEntries(
    Object.entries(byStage).map(([stage, items]) => [
      stage,
      items.filter(({ applicant }) =>
        search === '' ||
        `${applicant.firstName} ${applicant.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        applicant.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
      ),
    ])
  ) as typeof byStage;

  const handleAdvance = async (applicant: Applicant, application: Application) => {
    const currentIdx = stageOrder.indexOf(application.stage);
    const nextStage = stageOrder[currentIdx + 1] as ApplicationStage;
    if (nextStage && nextStage !== 'rejected') {
      try {
        await updateApplicationStage(applicant.id, application.id, nextStage);
      } catch {
        return;
      }
    }
  };

  const handleReject = async (applicant: Applicant, application: Application) => {
    try {
      await updateApplicationStage(applicant.id, application.id, 'rejected');
    } catch {
      return;
    }
    setSelectedCard(null);
  };

  const handleSaveFeedback = async () => {
    if (!selectedCard) return;
    try {
      await updateApplicantFeedback(selectedCard.applicant.id, selectedCard.application.id, feedbackDraft);
    } catch {
      return;
    }
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 2000);
  };

  const openCard = (applicant: Applicant, application: Application) => {
    setSelectedCard({ applicant, application });
    setFeedbackDraft(application.feedbackForApplicant || '');
    setFeedbackSaved(false);
  };

  const totalApplicants = applicantsForJob.length;
  const hiredCount = byStage.hired.length;
  const rejectedCount = byStage.rejected.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b shrink-0" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <button onClick={() => router.push('/recruiter/jobs')} className="flex items-center gap-1.5 mb-3" style={{ fontSize: 13, color: '#64748b' }}>
          <ChevronLeft size={14} /> All Jobs
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="text-lg">{company.logo}</div>
              <span style={{ fontSize: 12, color: company.color, fontWeight: 600, letterSpacing: '0.08em' }}>
                {company.name.toUpperCase()} · KANBAN
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>{job.title}</h1>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              {job.team} · {totalApplicants} applicant{totalApplicants !== 1 ? 's' : ''} · {hiredCount} hired · {rejectedCount} rejected
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} style={{ color: '#475569', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 10, padding: '7px 12px 7px 30px', color: '#f1f5f9', fontSize: 12, outline: 'none', width: 180 }}
                placeholder="Filter candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-5">
        <div className="flex gap-4 min-w-max">
          {KANBAN_STAGES.map((stage) => {
            const sc = stageColors[stage];
            const cards = filteredByStage[stage];
            return (
              <div key={stage} className="w-64 shrink-0 flex flex-col rounded-xl border" style={{ background: sc.bg, borderColor: sc.border, maxHeight: 'calc(100vh - 220px)' }}>
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: sc.border }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: sc.color }}>{stageLabels[stage]}</div>
                    <div style={{ fontSize: 10, color: '#475569' }}>{stageStoryLabels[stage]}</div>
                  </div>
                  <div
                    className="flex items-center justify-center rounded-full"
                    style={{ width: 22, height: 22, background: `${sc.color}20`, fontSize: 11, fontWeight: 700, color: sc.color }}
                  >
                    {cards.length}
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {cards.length === 0 && (
                    <div className="text-center py-8">
                      <Users size={20} style={{ color: '#1e293b', margin: '0 auto 6px' }} />
                      <p style={{ fontSize: 11, color: '#334155' }}>No candidates</p>
                    </div>
                  )}
                  {cards.map(({ applicant, application }) => (
                    <KanbanCard
                      key={applicant.id}
                      applicant={applicant}
                      application={application}
                      stage={stage}
                      companyColor={company.color}
                      onClick={() => openCard(applicant, application)}
                      onAdvance={() => handleAdvance(applicant, application)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Rejected Column Toggle */}
          <div className="w-64 shrink-0">
            <button
              onClick={() => setRejectedVisible(!rejectedVisible)}
              className="w-full flex items-center gap-2 rounded-xl border px-3 py-3 transition-all"
              style={{ background: 'rgba(239,68,68,0.04)', borderColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
            >
              <span style={{ fontSize: 12, fontWeight: 700 }}>Rejected ({byStage.rejected.length})</span>
              {rejectedVisible ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {rejectedVisible && (
              <div className="mt-2 space-y-2">
                {filteredByStage.rejected.map(({ applicant, application }) => (
                  <KanbanCard
                    key={applicant.id}
                    applicant={applicant}
                    application={application}
                    stage="rejected"
                    companyColor={company.color}
                    onClick={() => openCard(applicant, application)}
                    onAdvance={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate Detail Panel */}
      <AnimatePresence>
        {selectedCard && (
          <>
            <div
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)' }}
              onClick={() => setSelectedCard(null)}
            />
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
              style={{ width: 420, background: '#0f0f1e', borderLeft: '1px solid rgba(124,58,237,0.2)' }}
            >
              <CandidatePanel
                applicant={selectedCard.applicant}
                application={selectedCard.application}
                job={job}
                company={company}
                feedbackDraft={feedbackDraft}
                setFeedbackDraft={setFeedbackDraft}
                feedbackSaved={feedbackSaved}
                onSaveFeedback={handleSaveFeedback}
                onAdvance={() => handleAdvance(selectedCard.applicant, selectedCard.application)}
                onReject={() => handleReject(selectedCard.applicant, selectedCard.application)}
                onClose={() => setSelectedCard(null)}
                onAssignInterviewer={async (interviewerId, assigned) => {
                  try {
                    await assignInterviewerToApplication(
                      selectedCard.applicant.id,
                      selectedCard.application.id,
                      interviewerId,
                      assigned
                    );
                  } catch {
                    return;
                  }

                  // Keep the panel responsive immediately while Convex pushes realtime updates.
                  setSelectedCard((prev) => {
                    if (!prev) return prev;
                    const currentIds = new Set(prev.application.assignedInterviewerIds);
                    if (assigned) currentIds.add(interviewerId);
                    else currentIds.delete(interviewerId);
                    return {
                      ...prev,
                      application: {
                        ...prev.application,
                        assignedInterviewerIds: Array.from(currentIds),
                      },
                    };
                  });
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function KanbanCard({
  applicant,
  application,
  stage,
  companyColor,
  onClick,
  onAdvance,
}: {
  applicant: Applicant;
  application: Application;
  stage: ApplicationStage;
  companyColor: string;
  onClick: () => void;
  onAdvance: () => void;
}) {
  const sc = stageColors[stage];
  const completedCount = applicant.completedTasks.length;
  const totalXP = applicant.completedTasks.reduce((s, t) => s + t.pointsEarned, 0);
  const canAdvance = stage !== 'hired' && stage !== 'rejected' && stage !== 'offered';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-3 cursor-pointer transition-all hover:bg-white/[0.02]"
      style={{ background: 'rgba(10,10,20,0.8)', borderColor: 'rgba(124,58,237,0.1)' }}
      onClick={onClick}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 32, height: 32, background: `linear-gradient(135deg,${companyColor},${companyColor}99)`, fontSize: 11, fontWeight: 700, color: 'white' }}
        >
          {applicant.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9' }}>
            {applicant.firstName} {applicant.lastName}
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {applicant.jobGoal}
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <Star size={9} style={{ color: '#f59e0b' }} fill="#f59e0b" />
          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>Lv.{applicant.level}</span>
        </div>
      </div>

      {/* XP + Tasks */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
        <div className="flex items-center gap-1">
          <Swords size={10} style={{ color: '#a78bfa' }} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{completedCount} tasks</span>
        </div>
        <div className="flex items-center gap-1">
          <Sparkles size={10} style={{ color: '#f59e0b' }} />
          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>{totalXP.toLocaleString()} XP</span>
        </div>
      </div>

      {/* Applied date */}
      <div style={{ fontSize: 10, color: '#334155', marginTop: 4 }}>Applied {application.dateApplied}</div>

      {/* Action */}
      {canAdvance && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdvance(); }}
          className="w-full mt-2 rounded-lg py-1.5 flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: `${sc.color}15`, color: sc.color, fontSize: 11, fontWeight: 600 }}
        >
          <ArrowRight size={11} />
          Advance
        </button>
      )}
    </motion.div>
  );
}

function CandidatePanel({
  applicant, application, job, company,
  feedbackDraft, setFeedbackDraft, feedbackSaved,
  onSaveFeedback, onAdvance, onReject, onClose, onAssignInterviewer,
}: {
  applicant: Applicant;
  application: Application;
  job: any;
  company: any;
  feedbackDraft: string;
  setFeedbackDraft: (s: string) => void;
  feedbackSaved: boolean;
  onSaveFeedback: () => void;
  onAdvance: () => void;
  onReject: () => void;
  onClose: () => void;
  onAssignInterviewer: (id: string, assigned: boolean) => Promise<void>;
}) {
  const [tab, setTab] = useState<'overview' | 'tasks' | 'feedback'>('overview');
  const [selectedInterviewerId, setSelectedInterviewerId] = useState('');
  const isTerminal = application.stage === 'hired' || application.stage === 'rejected';
  const canAdvance = !isTerminal && application.stage !== 'offered';

  const sc = stageColors[application.stage] || stageColors.applied;
  const guides = application.assignedInterviewerIds.map(getTeamMemberById).filter(Boolean);
  const availableInterviewers = teamMembers.filter(
    (member) =>
      member.companyId === company.id &&
      (member.role === 'team_member' || member.role === 'recruiter')
  );
  const effectiveSelectedInterviewerId = selectedInterviewerId || availableInterviewers[0]?.id || '';

  const completedTaskDetails = applicant.completedTasks.map((ct) => {
    const t = allTasks.find((task) => task.id === ct.taskId);
    return t ? { ...t, dateCompleted: ct.dateCompleted, pointsEarned: ct.pointsEarned } : null;
  }).filter(Boolean);

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: 13,
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 100,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 48, height: 48, background: `linear-gradient(135deg,${company.color},${company.accentColor})`, fontSize: 16, fontWeight: 800, color: 'white' }}
        >
          {applicant.avatar}
        </div>
        <div className="flex-1">
          <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9' }}>{applicant.firstName} {applicant.lastName}</h3>
          <p style={{ fontSize: 12, color: '#94a3b8' }}>{applicant.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.color }}>
              {stageLabels[application.stage]}
            </span>
            <span style={{ fontSize: 10, color: '#475569' }}>Applied {application.dateApplied}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ color: '#475569' }}><X size={18} /></button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
        {(['overview', 'tasks', 'feedback'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-3 py-1.5 transition-all"
            style={{
              fontSize: 12,
              fontWeight: tab === t ? 700 : 400,
              background: tab === t ? `${company.color}15` : 'transparent',
              color: tab === t ? company.accentColor : '#64748b',
              border: `1px solid ${tab === t ? company.color : 'transparent'}`,
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {tab === 'overview' && (
          <>
            {/* Career Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Level', value: `${applicant.level}`, color: '#f59e0b' },
                { label: 'XP', value: applicant.xp.toLocaleString(), color: '#a78bfa' },
                { label: 'Tasks', value: applicant.completedTasks.length.toString(), color: '#10b981' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Goal */}
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(124,58,237,0.04)' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>CAREER GOAL</div>
              <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{applicant.jobGoal}</p>
            </div>

            {/* Resume */}
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>RESUME SUMMARY</div>
              <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>{applicant.resumeSnippet}</p>
            </div>

            {/* Skills */}
            <div>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>SKILLS</div>
              <div className="flex flex-wrap gap-1.5">
                {applicant.skills.map((skill) => (
                  <span key={skill} className="px-2 py-1 rounded-full" style={{ fontSize: 10, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Source */}
            <div className="rounded-xl border p-3 flex items-center gap-2" style={{ borderColor: 'rgba(124,58,237,0.1)', background: 'rgba(255,255,255,0.01)' }}>
              <Filter size={12} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Source of hire: </span>
              <span style={{ fontSize: 11, color: '#f1f5f9', fontWeight: 600 }}>{application.source}</span>
            </div>

            {/* Guides */}
            {guides.length > 0 && (
              <div>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>ASSIGNED INTERVIEWERS (GUIDES)</div>
                <div className="space-y-1.5">
                  {guides.map((g) => g && (
                    <div key={g.id} className="flex items-center gap-2.5 rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.08)' }}>
                      <div className="flex items-center justify-center rounded-full" style={{ width: 28, height: 28, background: `${company.color}20`, fontSize: 10, fontWeight: 700, color: company.color }}>
                        {g.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{g.firstName} {g.lastName}</div>
                        <div style={{ fontSize: 10, color: '#64748b' }}>{g.guideArchetype} · {g.team}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => void onAssignInterviewer(g.id, false)}
                        className="ml-auto rounded-lg px-2 py-1 transition-all hover:opacity-80"
                        style={{ fontSize: 10, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                      >
                        Unassign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ fontSize: 10, color: '#64748b', marginBottom: 8 }}>ASSIGN INTERVIEWER</div>
              <div className="flex items-center gap-2">
                <select
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(124,58,237,0.15)',
                    borderRadius: 10,
                    padding: '8px 10px',
                    color: '#f1f5f9',
                    fontSize: 12,
                    outline: 'none',
                  }}
                  value={effectiveSelectedInterviewerId}
                  onChange={(event) => setSelectedInterviewerId(event.target.value)}
                >
                  {availableInterviewers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.firstName} {member.lastName} - {member.team}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => void onAssignInterviewer(effectiveSelectedInterviewerId, true)}
                  disabled={!effectiveSelectedInterviewerId}
                  className="rounded-lg px-3 py-2 transition-all hover:opacity-90 disabled:opacity-40"
                  style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
                >
                  Assign
                </button>
              </div>
            </div>
          </>
        )}

        {tab === 'tasks' && (
          <>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>
              {completedTaskDetails.length} challenges completed · {applicant.xp.toLocaleString()} XP earned
            </div>
            <div className="space-y-2">
              {completedTaskDetails.length === 0 && (
                <div className="text-center py-8">
                  <Swords size={28} style={{ color: '#1e293b', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, color: '#475569' }}>No challenges completed yet</p>
                </div>
              )}
              {completedTaskDetails.map((task: any) => {
                const typeColors: Record<string, string> = { general: '#818cf8', company: '#f472b6', role: '#fbbf24' };
                const diffColors: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
                return (
                  <div key={task.id} className="rounded-xl border p-3" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.15)' }}>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} style={{ color: '#10b981', marginTop: 1 }} />
                      <div className="flex-1">
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{task.name}</div>
                        <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4, marginTop: 2 }}>{task.why}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: `${typeColors[task.type]}15`, color: typeColors[task.type], fontWeight: 600 }}>
                            {task.type === 'general' ? 'Universal' : task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded-full" style={{ fontSize: 9, background: `${diffColors[task.difficulty]}15`, color: diffColors[task.difficulty], fontWeight: 600 }}>
                            {task.difficulty}
                          </span>
                          <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>+{task.pointsEarned} XP</span>
                          <span style={{ fontSize: 9, color: '#475569' }}>· {task.dateCompleted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'feedback' && (
          <>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>FEEDBACK FOR APPLICANT</div>
              <textarea
                style={inputStyle}
                value={feedbackDraft}
                onChange={(e) => setFeedbackDraft(e.target.value)}
                placeholder="Leave constructive feedback visible to the applicant after their interview stage..."
              />
              <button
                onClick={onSaveFeedback}
                className="mt-2 rounded-lg px-4 py-2 flex items-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: 12, fontWeight: 600, border: '1px solid rgba(99,102,241,0.2)' }}
              >
                <MessageSquare size={13} />
                {feedbackSaved ? '✓ Saved!' : 'Save Feedback'}
              </button>
            </div>

            {application.feedbackForApplicant && (
              <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.04)' }}>
                <div style={{ fontSize: 10, color: '#818cf8', fontWeight: 600, marginBottom: 6 }}>CURRENT SAVED FEEDBACK</div>
                <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.6, fontStyle: 'italic' }}>&quot;{application.feedbackForApplicant}&quot;</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Footer */}
      {!isTerminal && (
        <div className="p-4 border-t space-y-2" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
          {canAdvance && (
            <button
              onClick={onAdvance}
              className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: `linear-gradient(135deg,${company.color},${company.color}cc)`, color: 'white', fontSize: 14, fontWeight: 700 }}
            >
              <ArrowRight size={16} />
              Advance to Next Stage
            </button>
          )}
          {application.stage === 'offered' && (
            <button
              onClick={() => onAdvance()}
              className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontSize: 14, fontWeight: 700 }}
            >
              <Award size={16} />
              Mark as Hired
            </button>
          )}
          <button
            onClick={onReject}
            className="w-full rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-80"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 13, border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <X size={14} />
            Reject Candidate
          </button>
        </div>
      )}
    </div>
  );
}
