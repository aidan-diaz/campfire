'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { XPBar } from '@/components/ats/shared/XPBar';
import { JourneyPath } from '@/components/ats/shared/JourneyPath';
import {
  getCompanyById, allTasks, stageLabels,
  stageStoryLabels, ApplicationStage, ScoreCard, RubricItem,
} from '@/data/ats/mockData';
import {
  ChevronLeft, Star, CheckCircle2, Sparkles, MessageSquare,
  Award, Swords, User, ScrollText, BookOpen, ThumbsUp, ThumbsDown,
  Minus, Send, Shield, Target, X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { retro, cardVariants, modalVariants } from '@/lib/animations';

export default function CandidateScorecard() {
  const params = useParams();
  const applicantId = typeof params.applicantId === 'string' ? params.applicantId : Array.isArray(params.applicantId) ? params.applicantId[0] : undefined;
  const jobId = typeof params.jobId === 'string' ? params.jobId : Array.isArray(params.jobId) ? params.jobId[0] : undefined;
  const router = useRouter();
  const { currentTeamMember, allApplicants, allJobs, addScorecard, scorecardsList, updateApplicationStage, updateApplicantFeedback } = useAts();

  const applicant = allApplicants.find((a) => a.id === applicantId);
  const job = allJobs.find((j) => j.id === jobId);
  const company = job ? getCompanyById(job.companyId) : null;

  const application = applicant?.applications.find((app) => app.jobId === jobId);

  const currentStageData = job?.stages.find((s) =>
    application?.stage === 'applied' ? s.order === 1
      : application?.stage === 'screening' ? s.order === 2
        : application?.stage === 'interview' ? s.order === 3
          : s.order === 4
  );

  const existingCard = scorecardsList.find(
    (sc) => sc.applicantId === applicantId && sc.jobId === jobId && sc.interviewerId === currentTeamMember.id
  );

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
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!applicant || !job || !company || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
        <div className="text-center pixel-border p-8" style={{ background: 'var(--surface)' }}>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>CANDIDATE OR JOB NOT FOUND</p>
          <button
            onClick={() => router.push('/interviewer')}
            className="rpg-button mt-4 px-4 py-2"
            style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', background: 'var(--color-orange)', color: 'var(--background)' }}
          >
            ← BACK TO DASHBOARD
          </button>
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
    if (pct >= 80) return '#4caf50';
    if (pct >= 60) return 'var(--color-gold)';
    return 'var(--color-flag)';
  };

  const handleSubmit = async () => {
    const sc: ScoreCard = {
      id: existingCard?.id || `sc-${application.id}-${currentTeamMember.id}-${currentStageData?.id || 'stage'}`,
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

  const profilePanel = (
    <div className="space-y-5">
      <XPBar level={applicant.level} xp={applicant.xp} xpToNextLevel={applicant.xpToNextLevel} />

      <div className="pixel-border p-4 space-y-3" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 mb-1">
          <User size={12} style={{ color: 'var(--color-orange)' }} />
          <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-orange)', letterSpacing: '0.08em' }}>CANDIDATE PROFILE</span>
        </div>
        <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)', lineHeight: 2 }}>{applicant.jobGoal}</p>
        <div className="flex flex-wrap gap-1.5">
          {applicant.skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5"
              style={{
                fontSize: 8,
                fontFamily: 'var(--font-pixel)',
                background: 'rgba(247,127,0,0.15)',
                color: 'var(--color-orange)',
                border: '1px solid var(--color-orange)',
              }}
            >
              {skill.toUpperCase()}
            </span>
          ))}
        </div>
        <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 2, fontStyle: 'italic' }}>{applicant.resumeSnippet}</p>
      </div>

      <div className="pixel-border overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid var(--border)' }}>
          <Swords size={12} style={{ color: 'var(--color-gold)' }} />
          <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>RELEVANT CHALLENGES</span>
          <span
            className="ml-auto px-2 py-0.5"
            style={{
              fontSize: 8,
              fontFamily: 'var(--font-pixel)',
              background: 'rgba(252,191,73,0.2)',
              color: 'var(--color-gold)',
              border: '1px solid var(--color-gold)',
            }}
          >
            {relevantTasks.length}
          </span>
        </div>
        <div className="p-3 space-y-2">
          {relevantTasks.length === 0 ? (
            <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', padding: '8px 0' }}>NO RELEVANT CHALLENGES COMPLETED YET</p>
          ) : (
            relevantTasks.map(({ task, dateCompleted, pointsEarned }) => {
              const typeColors: Record<string, string> = { general: 'var(--color-vanilla)', company: '#f472b6', role: 'var(--color-gold)' };
              const diffColors: Record<string, string> = { easy: '#4caf50', medium: 'var(--color-gold)', hard: 'var(--color-flag)' };
              return (
                <div key={task.id} className="p-2.5" style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)' }}>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 size={10} style={{ color: '#4caf50', marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>{task.name.toUpperCase()}</div>
                      <p style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 1.8, marginTop: 4 }}>{task.why}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: typeColors[task.type] }}>{task.type === 'general' ? 'UNIVERSAL' : task.type.toUpperCase()}</span>
                        <span style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: diffColors[task.difficulty] }}>{task.difficulty.toUpperCase()}</span>
                        <Sparkles size={8} style={{ color: 'var(--color-gold)' }} />
                        <span style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>+{pointsEarned} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {currentStageData && currentStageData.passCriteria.length > 0 && (
        <div className="pixel-border overflow-hidden" style={{ background: 'var(--surface)' }}>
          <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '2px solid var(--border)' }}>
            <Target size={12} style={{ color: 'var(--color-orange)' }} />
            <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>PASS CRITERIA — {stageLabels[application.stage].toUpperCase()}</span>
          </div>
          <div className="p-3 space-y-1.5">
            {currentStageData.passCriteria.map((c) => (
              <div key={c} className="flex items-center gap-2">
                <span style={{ color: 'var(--color-gold)', fontSize: 10 }}>▸</span>
                <span style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const inputStyle = {
    width: '100%',
    background: 'rgba(0,48,73,0.8)',
    border: '2px solid rgba(252,191,73,0.2)',
    padding: '10px 14px',
    color: 'var(--foreground)',
    fontSize: 10,
    fontFamily: 'var(--font-pixel)',
    outline: 'none',
    resize: 'vertical' as const,
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-5" style={{ borderBottom: '2px solid var(--border)' }}>
        <button
          onClick={() => router.push('/interviewer')}
          className="flex items-center gap-1.5 mb-3"
          style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}
        >
          <ChevronLeft size={12} /> BACK TO DASHBOARD
        </button>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{
                width: 56,
                height: 56,
                background: 'linear-gradient(135deg, var(--color-orange), var(--color-gold))',
                fontSize: 18,
                fontFamily: 'var(--font-pixel)',
                color: 'var(--background)',
                border: '2px solid var(--color-gold)',
              }}
            >
              {applicant.avatar}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 style={{ fontSize: 16, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.02em' }}>
                  {applicant.firstName.toUpperCase()} {applicant.lastName.toUpperCase()}
                </h1>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 2 }}
                  transition={retro.snap}
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="rpg-button px-3 py-1.5 shrink-0"
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-pixel)',
                    color: 'var(--color-orange)',
                    background: 'var(--surface)',
                    border: '2px solid var(--color-orange)',
                  }}
                >
                  VIEW PROFILE
                </motion.button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--color-orange)' }}>{job.title.toUpperCase()}</span>
                <span style={{ fontSize: 8, color: 'var(--muted-foreground)' }}>·</span>
                <span
                  className="px-2 py-0.5"
                  style={{
                    fontSize: 8,
                    fontFamily: 'var(--font-pixel)',
                    background: 'rgba(247,127,0,0.15)',
                    color: 'var(--color-orange)',
                    border: '1px solid var(--color-orange)',
                  }}
                >
                  {stageStoryLabels[application.stage].toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>{applicant.email}</p>
            </div>
          </div>
          <div className="text-right shrink-0 pixel-border p-3" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-1.5 justify-end">
              <Star size={12} style={{ color: 'var(--color-gold)' }} fill="var(--color-gold)" />
              <span style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>LV.{applicant.level}</span>
            </div>
            <div className="flex items-center gap-1 mt-1 justify-end">
              <Sparkles size={10} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>{applicant.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Journey Path */}
        <div className="mt-4 pixel-border p-4" style={{ background: 'var(--surface)' }}>
          <JourneyPath currentStage={application.stage} />
        </div>
      </div>

      <div className="px-6 py-6 max-w-4xl mx-auto w-full">
        <div className="space-y-5">
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pixel-border p-4 flex items-center gap-3"
              style={{ background: 'var(--surface)', borderColor: '#4caf50' }}
            >
              <CheckCircle2 size={16} style={{ color: '#4caf50' }} />
              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: '#4caf50' }}>
                  ► SCORECARD SUBMITTED ON {existingCard?.completedAt || new Date().toISOString().split('T')[0]}
                </div>
                <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>YOU CAN UPDATE IT BELOW AND RESUBMIT</div>
              </div>
            </motion.div>
          )}

          {/* Rubric Section */}
          <div className="pixel-border overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--border)' }}>
              <div className="flex items-center gap-2">
                <ScrollText size={14} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>INTERVIEW SCORECARD</span>
                {rubric.length > 0 && (
                  <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>· {stageLabels[application.stage].toUpperCase()}</span>
                )}
              </div>
              {rubric.length > 0 && (
                <div className="flex items-center gap-2">
                  <div style={{ fontSize: 16, fontFamily: 'var(--font-pixel)', color: getScoreColor(scorePercent) }}>{totalScore}</div>
                  <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>/ {maxScore}</div>
                </div>
              )}
            </div>

            <div className="p-5">
              {rubric.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen size={28} style={{ color: 'var(--muted-foreground)', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>NO RUBRIC DEFINED FOR THIS STAGE</p>
                </div>
              ) : (
                <>
                  {/* Score progress - pixel bar */}
                  <div className="pixel-border p-3 mb-5" style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>OVERALL SCORE</span>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: getScoreColor(scorePercent) }}>{Math.round(scorePercent)}%</span>
                    </div>
                    <div style={{ height: 16, background: 'rgba(0,0,0,0.4)', border: '2px solid var(--border)' }}>
                      <motion.div
                        animate={{ width: `${scorePercent}%` }}
                        transition={retro.xpFill}
                        className="xp-fill-segmented"
                        style={{
                          height: '100%',
                          background: `linear-gradient(90deg, ${getScoreColor(scorePercent)}, ${getScoreColor(scorePercent)}cc)`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Rubric Items */}
                  <div className="space-y-4">
                    {rubric.map((item: RubricItem, i) => {
                      const itemScore = scores[item.id] || 0;
                      const itemPct = (itemScore / item.maxScore) * 100;
                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, ...retro.snap }}
                          className="pixel-border p-4"
                          style={{ background: 'var(--surface-raised)' }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>{item.category.toUpperCase()}</div>
                              <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>{item.description}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span style={{ fontSize: 16, fontFamily: 'var(--font-pixel)', color: getScoreColor(itemPct) }}>{itemScore}</span>
                              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>/ {item.maxScore}</span>
                            </div>
                          </div>

                          {/* Score Slider - pixel buttons */}
                          <div className="flex items-center gap-1 mb-3">
                            {Array.from({ length: item.maxScore + 1 }, (_, i) => i).map((val) => (
                              <motion.button
                                key={val}
                                whileHover={{ y: -1 }}
                                whileTap={{ y: 1 }}
                                onClick={() => handleScoreChange(item.id, val)}
                                className="flex-1 transition-all"
                                style={{
                                  height: 32,
                                  background: val <= itemScore ? getScoreColor(itemPct) : 'rgba(0,0,0,0.4)',
                                  border: val === itemScore ? `2px solid ${getScoreColor(itemPct)}` : '2px solid var(--border)',
                                  color: val <= itemScore ? 'var(--background)' : 'var(--muted-foreground)',
                                  fontSize: 10,
                                  fontFamily: 'var(--font-pixel)',
                                  cursor: 'pointer',
                                  opacity: val === 0 ? 0.5 : 1,
                                }}
                              >
                                {val}
                              </motion.button>
                            ))}
                          </div>

                          {/* Notes */}
                          <textarea
                            style={{ ...inputStyle, minHeight: 60 }}
                            placeholder={`NOTES ON ${item.category.toUpperCase()}...`}
                            value={notes[item.id] || ''}
                            onChange={(e) => handleNotesChange(item.id, e.target.value)}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Feedback */}
          <div className="pixel-border overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '2px solid var(--border)' }}>
              <MessageSquare size={14} style={{ color: 'var(--color-orange)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>FEEDBACK</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', display: 'block', marginBottom: 8 }}>
                  <Shield size={10} style={{ display: 'inline', marginRight: 4 }} />
                  PRIVATE — NOTES FOR THE RECRUITER
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80 }}
                  placeholder="SHARE INTERNAL NOTES ABOUT THIS CANDIDATE. NOT VISIBLE TO THE APPLICANT."
                  value={recruiterFeedback}
                  onChange={(e) => setRecruiterFeedback(e.target.value)}
                />
              </div>
              <div className="pixel-divider" />
              <div>
                <label style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', display: 'block', marginBottom: 8 }}>
                  <MessageSquare size={10} style={{ display: 'inline', marginRight: 4 }} />
                  CANDIDATE — FEEDBACK FOR {applicant.firstName.toUpperCase()}
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, borderColor: 'var(--color-gold)' }}
                  placeholder="WRITE CONSTRUCTIVE FEEDBACK THAT THE CANDIDATE WILL SEE IN THEIR DASHBOARD. HELP THEM GROW!"
                  value={applicantFeedback}
                  onChange={(e) => setApplicantFeedback(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Recommendation - RPG decision panel */}
          <div className="pixel-border overflow-hidden" style={{ background: 'var(--surface)' }}>
            <div className="flex items-center gap-2 px-5 py-4" style={{ borderBottom: '2px solid var(--border)' }}>
              <Award size={14} style={{ color: 'var(--color-gold)' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>RECOMMENDATION</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'advance' as const, label: 'ADVANCE', icon: <ThumbsUp size={20} />, color: '#4caf50', desc: 'MOVE TO NEXT STAGE' },
                  { value: 'hold' as const, label: 'HOLD', icon: <Minus size={20} />, color: 'var(--color-gold)', desc: 'NEEDS MORE INFO' },
                  { value: 'reject' as const, label: 'REJECT', icon: <ThumbsDown size={20} />, color: 'var(--color-flag)', desc: 'NOT THE RIGHT FIT' },
                ].map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    transition={retro.snap}
                    onClick={() => setRecommendation(opt.value)}
                    className="flex flex-col items-center gap-2 py-4 px-3 transition-all"
                    style={{
                      background: recommendation === opt.value ? `rgba(${opt.color === '#4caf50' ? '76,175,80' : opt.color === 'var(--color-gold)' ? '252,191,73' : '214,40,40'},0.15)` : 'var(--surface-raised)',
                      border: `2px solid ${recommendation === opt.value ? opt.color : 'var(--border)'}`,
                      color: recommendation === opt.value ? opt.color : 'var(--muted-foreground)',
                      boxShadow: recommendation === opt.value ? `0 0 12px ${opt.color}40, 4px 4px 0 rgba(0,0,0,0.3)` : '4px 4px 0 rgba(0,0,0,0.3)',
                    }}
                  >
                    {opt.icon}
                    <div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)' }}>{opt.label}</div>
                      <div style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', marginTop: 4 }}>{opt.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              transition={retro.snap}
              onClick={handleSubmit}
              className="rpg-button flex-1 py-3 flex items-center justify-center gap-2"
              style={{
                background: 'var(--color-orange)',
                color: 'var(--background)',
                fontSize: 10,
                fontFamily: 'var(--font-pixel)',
                boxShadow: '0 0 20px rgba(247,127,0,0.4), 4px 4px 0 rgba(0,0,0,0.3)',
              }}
            >
              <Send size={14} />
              {submitted ? 'UPDATE SCORECARD' : 'SUBMIT SCORECARD'}
            </motion.button>
            {submitted && recommendation === 'advance' && (
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 2 }}
                transition={retro.snap}
                onClick={handleAdvance}
                className="rpg-button flex-1 py-3 flex items-center justify-center gap-2"
                style={{
                  background: '#4caf50',
                  color: 'var(--background)',
                  fontSize: 10,
                  fontFamily: 'var(--font-pixel)',
                  boxShadow: '0 0 20px rgba(76,175,80,0.4), 4px 4px 0 rgba(0,0,0,0.3)',
                }}
              >
                <ThumbsUp size={14} />
                ADVANCE CANDIDATE
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Candidate profile modal - pixel bordered */}
      {profileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setProfileModalOpen(false)}
          role="presentation"
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pixel-border scanlines w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            style={{ background: 'var(--surface)', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '2px solid var(--border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(135deg, var(--color-orange), var(--color-gold))',
                    fontSize: 14,
                    fontFamily: 'var(--font-pixel)',
                    color: 'var(--background)',
                    border: '2px solid var(--color-gold)',
                  }}
                >
                  {applicant.avatar}
                </div>
                <div className="min-w-0">
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>
                    {applicant.firstName.toUpperCase()} {applicant.lastName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 2 }} className="truncate">{applicant.email}</div>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="p-2 shrink-0"
                style={{ background: 'var(--surface-raised)', color: 'var(--foreground)', border: '2px solid var(--border)' }}
                aria-label="Close"
              >
                <X size={16} />
              </motion.button>
            </div>
            <div className="overflow-y-auto px-5 py-4 flex-1">{profilePanel}</div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
