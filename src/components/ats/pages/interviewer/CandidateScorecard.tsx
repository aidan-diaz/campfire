'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { XPBar } from '@/components/ats/shared/XPBar';
import { JourneyPath } from '@/components/ats/shared/JourneyPath';
import {
  getCompanyById, getTeamMemberById, allTasks, stageLabels,
  stageStoryLabels, ApplicationStage, ScoreCard, RubricItem,
} from '@/data/ats/mockData';
import {
  ChevronLeft, Star, CheckCircle2, Sparkles, MessageSquare,
  Award, Swords, User, ScrollText, BookOpen, ThumbsUp, ThumbsDown,
  Minus, Clock, Send, Shield, ChevronDown, ChevronUp, Target,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CandidateScorecard() {
  const params = useParams();
  const applicantId = typeof params.applicantId === 'string' ? params.applicantId : Array.isArray(params.applicantId) ? params.applicantId[0] : undefined;
  const jobId = typeof params.jobId === 'string' ? params.jobId : Array.isArray(params.jobId) ? params.jobId[0] : undefined;
  const router = useRouter();
  const { currentTeamMember, allApplicants, allJobs, addScorecard, scorecardsList, updateApplicationStage, updateApplicantFeedback } = useAts();

  const applicant = allApplicants.find((a) => a.id === applicantId);
  const job = allJobs.find((j) => j.id === jobId);
  const company = job ? getCompanyById(job.companyId) : null;

  // Find the application
  const application = applicant?.applications.find((app) => app.jobId === jobId);

  // Get current stage rubric
  const currentStageData = job?.stages.find((s) =>
    application?.stage === 'applied' ? s.order === 1
    : application?.stage === 'screening' ? s.order === 2
    : application?.stage === 'interview' ? s.order === 3
    : s.order === 4
  );

  // Existing scorecard
  const existingCard = scorecardsList.find(
    (sc) => sc.applicantId === applicantId && sc.jobId === jobId && sc.interviewerId === currentTeamMember.id
  );

  // Form state
  const [scores, setScores] = useState<Record<string, number>>(
    existingCard
      ? Object.fromEntries(existingCard.scores.map((s) => [s.rubricItemId, s.score]))
      : {}
  );
  const [notes, setNotes] = useState<Record<string, string>>(
    existingCard
      ? Object.fromEntries(existingCard.scores.map((s) => [s.rubricItemId, s.notes]))
      : {}
  );
  const [recruiterFeedback, setRecruiterFeedback] = useState(existingCard?.feedbackForRecruiter || '');
  const [applicantFeedback, setApplicantFeedback] = useState(existingCard?.feedbackForApplicant || application?.feedbackForApplicant || '');
  const [recommendation, setRecommendation] = useState<'advance' | 'reject' | 'hold'>(existingCard?.recommendation || 'hold');
  const [submitted, setSubmitted] = useState(!!existingCard);
  const [activeSection, setActiveSection] = useState<'rubric' | 'tasks' | 'profile'>('rubric');

  if (!applicant || !job || !company || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a14' }}>
        <div className="text-center">
          <p style={{ color: '#64748b' }}>Candidate or job not found.</p>
          <button onClick={() => router.push('/interviewer')} style={{ color: '#a78bfa', fontSize: 13, marginTop: 8 }}>← Back</button>
        </div>
      </div>
    );
  }

  const rubric = currentStageData?.rubric || [];

  const handleScoreChange = (rubricItemId: string, val: number) => {
    setScores((prev) => ({ ...prev, [rubricItemId]: val }));
  };

  const handleNotesChange = (rubricItemId: string, val: string) => {
    setNotes((prev) => ({ ...prev, [rubricItemId]: val }));
  };

  const totalScore = rubric.reduce((sum, r) => sum + (scores[r.id] || 0), 0);
  const maxScore = rubric.reduce((sum, r) => sum + r.maxScore, 0);
  const scorePercent = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return '#10b981';
    if (pct >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleSubmit = async () => {
    const sc: ScoreCard = {
      id: existingCard?.id || `sc-new-${Date.now()}`,
      applicantId: applicant.id,
      jobId: job.id,
      stageId: currentStageData?.id || '',
      interviewerId: currentTeamMember.id,
      scores: rubric.map((r) => ({
        rubricItemId: r.id,
        score: scores[r.id] || 0,
        notes: notes[r.id] || '',
      })),
      feedbackForRecruiter: recruiterFeedback,
      feedbackForApplicant: applicantFeedback,
      recommendation,
      completedAt: new Date().toISOString().split('T')[0],
    };
    try {
      await addScorecard(sc);
      if (applicantFeedback) {
        await updateApplicantFeedback(applicant.id, application.id, applicantFeedback);
      }
    } catch {
      return;
    }
    setSubmitted(true);
  };

  const handleAdvance = async () => {
    const stageSeq: ApplicationStage[] = ['applied', 'screening', 'interview', 'final_round', 'offered', 'hired'];
    const currentIdx = stageSeq.indexOf(application.stage);
    if (currentIdx < stageSeq.length - 1) {
      try {
        await updateApplicationStage(applicant.id, application.id, stageSeq[currentIdx + 1]);
      } catch {
        return;
      }
    }
    router.push('/interviewer');
  };

  const relevantTasks = applicant.completedTasks
    .map((ct) => ({ ...ct, task: allTasks.find((t) => t.id === ct.taskId) }))
    .filter((ct): ct is typeof ct & { task: NonNullable<typeof ct.task> } =>
      !!ct.task &&
      (ct.task.type === 'general' ||
        (ct.task.type === 'role' && ct.task.jobId === job.id) ||
        (ct.task.type === 'company' && ct.task.companyId === company.id))
    );

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
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <button onClick={() => router.push('/interviewer')} className="flex items-center gap-1.5 mb-3" style={{ fontSize: 13, color: '#64748b' }}>
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0"
              style={{ width: 56, height: 56, background: `linear-gradient(135deg,${company.color},${company.accentColor})`, fontSize: 18, fontWeight: 800, color: 'white' }}
            >
              {applicant.avatar}
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
                {applicant.firstName} {applicant.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ fontSize: 12, color: company.color, fontWeight: 600 }}>{job.title}</span>
                <span style={{ fontSize: 10, color: '#475569' }}>·</span>
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{ fontSize: 10, fontWeight: 700, background: `${company.color}15`, color: company.accentColor }}
                >
                  {stageStoryLabels[application.stage]}
                </span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{applicant.email}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center gap-1.5 justify-end">
              <Star size={13} style={{ color: '#f59e0b' }} fill="#f59e0b" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>Level {applicant.level}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 justify-end">
              <Sparkles size={11} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 11, color: '#f59e0b' }}>{applicant.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Journey Path */}
        <div className="mt-4 rounded-xl border p-4" style={{ borderColor: `${company.color}20`, background: `${company.color}06` }}>
          <JourneyPath currentStage={application.stage} />
        </div>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile + Tasks */}
        <div className="space-y-5">
          {/* XP */}
          <XPBar level={applicant.level} xp={applicant.xp} xpToNextLevel={applicant.xpToNextLevel} />

          {/* Profile Summary */}
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 mb-1">
              <User size={13} style={{ color: '#7c3aed' }} />
              <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>CANDIDATE PROFILE</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{applicant.jobGoal}</p>
            <div className="flex flex-wrap gap-1.5">
              {applicant.skills.map((skill) => (
                <span key={skill} className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: 'rgba(124,58,237,0.1)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.15)' }}>
                  {skill}
                </span>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.6, fontStyle: 'italic' }}>{applicant.resumeSnippet}</p>
          </div>

          {/* Relevant Tasks */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <Swords size={13} style={{ color: '#a78bfa' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Relevant Challenges</span>
              <span className="ml-auto px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', fontWeight: 700 }}>
                {relevantTasks.length}
              </span>
            </div>
            <div className="p-3 space-y-2">
              {relevantTasks.length === 0 ? (
                <p style={{ fontSize: 12, color: '#475569', padding: '8px 0' }}>No relevant challenges completed yet.</p>
              ) : (
                relevantTasks.map(({ task, dateCompleted, pointsEarned }) => {
                  const typeColors: Record<string, string> = { general: '#818cf8', company: '#f472b6', role: '#fbbf24' };
                  const diffColors: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
                  return (
                    <div key={task.id} className="rounded-lg border p-2.5" style={{ background: 'rgba(16,185,129,0.04)', borderColor: 'rgba(16,185,129,0.12)' }}>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 size={12} style={{ color: '#10b981', marginTop: 1 }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{task.name}</div>
                          <p style={{ fontSize: 10, color: '#64748b', lineHeight: 1.4, marginTop: 2 }}>{task.why}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span style={{ fontSize: 9, color: typeColors[task.type], fontWeight: 600 }}>{task.type === 'general' ? 'Universal' : task.type}</span>
                            <span style={{ fontSize: 9, color: diffColors[task.difficulty], fontWeight: 600 }}>{task.difficulty}</span>
                            <Sparkles size={8} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: 9, color: '#f59e0b' }}>+{pointsEarned} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stage Criteria */}
          {currentStageData && currentStageData.passCriteria.length > 0 && (
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
                <Target size={13} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>Pass Criteria — {stageLabels[application.stage]}</span>
              </div>
              <div className="p-3 space-y-1.5">
                {currentStageData.passCriteria.map((c) => (
                  <div key={c} className="flex items-center gap-2">
                    <CheckCircle2 size={11} style={{ color: '#475569' }} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Scorecard Form */}
        <div className="lg:col-span-2 space-y-5">
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4 flex items-center gap-3"
              style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}
            >
              <CheckCircle2 size={18} style={{ color: '#10b981' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Scorecard submitted on {existingCard?.completedAt || new Date().toISOString().split('T')[0]}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>You can update it below and resubmit</div>
              </div>
            </motion.div>
          )}

          {/* Rubric Section */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <div className="flex items-center gap-2">
                <ScrollText size={15} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Interview Scorecard</span>
                {rubric.length > 0 && (
                  <span style={{ fontSize: 11, color: '#64748b' }}>· {stageLabels[application.stage]}</span>
                )}
              </div>
              {rubric.length > 0 && (
                <div className="flex items-center gap-2">
                  <div style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(scorePercent) }}>{totalScore}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>/ {maxScore}</div>
                </div>
              )}
            </div>

            <div className="p-5">
              {rubric.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={28} style={{ color: '#334155', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: '#475569' }}>No rubric defined for this stage.</p>
                </div>
              ) : (
                <>
                  {/* Score progress */}
                  <div className="rounded-xl p-3 mb-5" style={{ background: `${getScoreColor(scorePercent)}08`, border: `1px solid ${getScoreColor(scorePercent)}20` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 12, color: '#64748b' }}>Overall Score</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: getScoreColor(scorePercent) }}>{Math.round(scorePercent)}%</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        animate={{ width: `${scorePercent}%` }}
                        transition={{ duration: 0.5 }}
                        style={{ height: '100%', background: `linear-gradient(90deg,${getScoreColor(scorePercent)},${getScoreColor(scorePercent)}cc)`, borderRadius: 999, boxShadow: `0 0 8px ${getScoreColor(scorePercent)}60` }}
                      />
                    </div>
                  </div>

                  {/* Rubric Items */}
                  <div className="space-y-4">
                    {rubric.map((item: RubricItem) => {
                      const itemScore = scores[item.id] || 0;
                      const itemPct = (itemScore / item.maxScore) * 100;
                      return (
                        <div key={item.id} className="rounded-xl border p-4" style={{ borderColor: 'rgba(124,58,237,0.1)', background: 'rgba(255,255,255,0.01)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{item.category}</div>
                              <div style={{ fontSize: 11, color: '#64748b' }}>{item.description}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span style={{ fontSize: 20, fontWeight: 800, color: getScoreColor(itemPct) }}>{itemScore}</span>
                              <span style={{ fontSize: 11, color: '#475569' }}>/ {item.maxScore}</span>
                            </div>
                          </div>

                          {/* Score Slider */}
                          <div className="flex items-center gap-2 mb-3">
                            {Array.from({ length: item.maxScore + 1 }, (_, i) => i).map((val) => (
                              <button
                                key={val}
                                onClick={() => handleScoreChange(item.id, val)}
                                className="flex-1 rounded transition-all"
                                style={{
                                  height: 28,
                                  background: val <= itemScore ? getScoreColor(itemPct) : 'rgba(255,255,255,0.04)',
                                  border: val === itemScore ? `2px solid ${getScoreColor(itemPct)}` : '2px solid transparent',
                                  color: val <= itemScore ? 'white' : '#475569',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  opacity: val === 0 ? 0.5 : 1,
                                }}
                              >
                                {val}
                              </button>
                            ))}
                          </div>

                          {/* Notes */}
                          <textarea
                            style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                            placeholder={`Notes on ${item.category.toLowerCase()}...`}
                            value={notes[item.id] || ''}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <MessageSquare size={15} style={{ color: '#818cf8' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Feedback</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  <Shield size={11} style={{ display: 'inline', marginRight: 4 }} />
                  PRIVATE — Notes for the Recruiter
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80 }}
                  placeholder="Share internal notes about this candidate. Not visible to the applicant."
                  value={recruiterFeedback}
                  onChange={(e) => setRecruiterFeedback(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#818cf8', display: 'block', marginBottom: 8, fontWeight: 600 }}>
                  <MessageSquare size={11} style={{ display: 'inline', marginRight: 4 }} />
                  CANDIDATE — Feedback for {applicant.firstName}
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, borderColor: 'rgba(99,102,241,0.25)' }}
                  placeholder="Write constructive feedback that the candidate will see in their dashboard. Help them grow!"
                  value={applicantFeedback}
                  onChange={(e) => setApplicantFeedback(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <Award size={15} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Recommendation</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'advance' as const, label: 'Advance', icon: <ThumbsUp size={20} />, color: '#10b981', desc: 'Move to next stage' },
                  { value: 'hold' as const, label: 'Hold', icon: <Minus size={20} />, color: '#f59e0b', desc: 'Needs more info' },
                  { value: 'reject' as const, label: 'Reject', icon: <ThumbsDown size={20} />, color: '#ef4444', desc: 'Not the right fit' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setRecommendation(opt.value)}
                    className="flex flex-col items-center gap-2 rounded-xl py-4 px-3 border transition-all"
                    style={{
                      background: recommendation === opt.value ? `${opt.color}15` : 'rgba(255,255,255,0.02)',
                      borderColor: recommendation === opt.value ? opt.color : 'rgba(124,58,237,0.1)',
                      color: recommendation === opt.value ? opt.color : '#64748b',
                      boxShadow: recommendation === opt.value ? `0 0 20px ${opt.color}20` : 'none',
                    }}
                  >
                    {opt.icon}
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: 10 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                background: `linear-gradient(135deg,${company.color},${company.color}cc)`,
                color: 'white',
                fontSize: 14,
                fontWeight: 700,
                boxShadow: `0 0 20px ${company.color}40`,
              }}
            >
              <Send size={16} />
              {submitted ? 'Update Scorecard' : 'Submit Scorecard'}
            </button>
            {submitted && recommendation === 'advance' && (
              <button
                onClick={handleAdvance}
                className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontSize: 14, fontWeight: 700 }}
              >
                <ThumbsUp size={16} />
                Advance Candidate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
