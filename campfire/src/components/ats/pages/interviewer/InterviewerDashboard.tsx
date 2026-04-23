'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from 'convex/react';
import { useAts } from '@/context/AtsContext';
import { api } from '../../../../../convex/_generated/api';
import {
  getCompanyById, stageStoryLabels,
  allTasks,
} from '@/data/ats/mockData';
import {
  Users, Star, ChevronRight, CheckCircle2,
  Swords, Shield, Clock, Scroll,
} from 'lucide-react';
import { motion } from 'motion/react';
import { retro, cardVariants, toastVariants } from '@/lib/animations';

function toDisplayName(value: string, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 24) return fallback;
  return trimmed;
}

export default function InterviewerDashboard() {
  const { currentTeamMember, allJobs, allApplicants, scorecardsList } = useAts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useQuery(api.users.getCurrentUser, {});
  const [showSubmissionToast, setShowSubmissionToast] = useState(false);
  const jobById = (id: string) => allJobs.find((j) => j.id === id);

  const displayFirstName = toDisplayName(currentUser?.firstName ?? currentTeamMember.firstName, 'Interviewer');
  const company = getCompanyById(currentTeamMember.companyId);
  const displayCompanyName = currentUser?.companyName?.trim() || company?.name || 'Your Company';
  const myJobs = allJobs.filter((j) => j.companyId === currentTeamMember.companyId);

  const assignedItems = allApplicants.flatMap((applicant) =>
    applicant.applications
      .filter((app) =>
        app.assignedInterviewerIds.includes(currentTeamMember.id) &&
        myJobs.find((j) => j.id === app.jobId)
      )
      .map((app) => ({ applicant, application: app }))
  );

  const activeItems = assignedItems.filter(
    ({ application }) => application.stage !== 'hired' && application.stage !== 'rejected'
  );

  const roleLabel =
    currentTeamMember.role === 'hiring_manager'
      ? 'Hiring Manager'
      : currentTeamMember.role === 'recruiter'
        ? 'Recruiter'
        : 'Team Member';

  const completedScorecards = scorecardsList.filter((sc) => sc.interviewerId === currentTeamMember.id);

  useEffect(() => {
    if (searchParams.get('scorecard') !== 'submitted') return;
    setShowSubmissionToast(true);
    const timeout = window.setTimeout(() => {
      setShowSubmissionToast(false);
      router.replace('/interviewer');
    }, 2200);
    return () => window.clearTimeout(timeout);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Toast notification - RPG dialogue style */}
      {showSubmissionToast && (
        <div className="fixed right-6 top-6 z-50">
          <motion.div
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="pixel-border px-4 py-3"
            style={{ background: 'var(--surface)', borderColor: '#4caf50' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: '#4caf50', fontFamily: 'var(--font-pixel)', fontSize: 10 }}>►</span>
              <CheckCircle2 size={14} style={{ color: '#4caf50' }} />
              <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: '#4caf50' }}>SCORECARD SUBMITTED</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-8 pb-6" style={{ borderBottom: '2px solid var(--border)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} style={{ color: 'var(--color-orange)' }} />
              <span style={{ fontSize: 10, color: 'var(--color-orange)', fontFamily: 'var(--font-pixel)', letterSpacing: '0.1em' }}>
                {displayCompanyName.toUpperCase()} · {roleLabel.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: 20, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.02em' }}>
              WELCOME, {displayFirstName.toUpperCase()}
            </h1>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 8 }}>
              ► {currentTeamMember.team} · {currentTeamMember.guideArchetype} · {activeItems.length} ACTIVE INTERVIEW{activeItems.length !== 1 ? 'S' : ''}
            </p>
          </div>
          {/* Guide archetype badge - pixel style */}
          <div
            className="pixel-border flex flex-col items-center justify-center p-3 shrink-0"
            style={{ background: 'var(--surface)', minWidth: 80 }}
          >
            <Scroll size={20} style={{ color: 'var(--color-gold)' }} />
            <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', marginTop: 6 }}>{currentTeamMember.guideArchetype.toUpperCase()}</div>
          </div>
        </div>

        {/* Quick Stats - pixel cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {[
            { label: 'INTERVIEWS ASSIGNED', value: assignedItems.length, color: 'var(--color-orange)', icon: <Users size={16} /> },
            { label: 'SCORECARDS FILED', value: completedScorecards.length, color: '#4caf50', icon: <CheckCircle2 size={16} /> },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ...retro.snap }}
              className="pixel-border p-3"
              style={{ background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                {s.icon}
                <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', letterSpacing: '0.06em' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 24, fontFamily: 'var(--font-pixel)', color: s.color }}>{s.value}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Active Interviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
              ▸ ACTIVE INTERVIEW QUESTS
            </h2>
            <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>{activeItems.length} IN PROGRESS</span>
          </div>

          {activeItems.length === 0 ? (
            <div className="pixel-border text-center py-12" style={{ background: 'var(--surface)' }}>
              <Users size={32} style={{ color: 'var(--muted-foreground)', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>NO ACTIVE INTERVIEWS ASSIGNED YET</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map(({ applicant, application }, i) => {
                const job = jobById(application.jobId);
                const comp = getCompanyById(application.companyId);
                if (!job || !comp) return null;

                const hasScorecard = scorecardsList.some(
                  (sc) => sc.applicantId === applicant.id && sc.jobId === job.id && sc.interviewerId === currentTeamMember.id
                );

                const relevantTasks = applicant.completedTasks
                  .map((ct) => allTasks.find((t) => t.id === ct.taskId))
                  .filter((t): t is NonNullable<typeof t> =>
                    !!t && (t.type === 'general' || (t.type === 'role' && t.jobId === job.id) || (t.type === 'company' && t.companyId === comp.id))
                  );

                return (
                  <motion.div
                    key={`${applicant.id}-${application.id}`}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    transition={{ delay: i * 0.07, ...retro.snap }}
                    className="pixel-border overflow-hidden"
                    style={{ background: 'var(--surface)' }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar - pixel bordered */}
                        <div
                          className="flex items-center justify-center shrink-0"
                          style={{
                            width: 46,
                            height: 46,
                            background: `linear-gradient(135deg, var(--color-orange), var(--color-gold))`,
                            fontSize: 14,
                            fontFamily: 'var(--font-pixel)',
                            color: 'var(--background)',
                            border: '2px solid var(--color-gold)',
                          }}
                        >
                          {applicant.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>
                                {applicant.firstName.toUpperCase()} {applicant.lastName.toUpperCase()}
                              </h3>
                              <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 2 }}>{applicant.email}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 px-2 py-1" style={{ background: 'rgba(252,191,73,0.15)', border: '1px solid var(--color-gold)' }}>
                              <Star size={10} style={{ color: 'var(--color-gold)' }} fill="var(--color-gold)" />
                              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>LV.{applicant.level}</span>
                            </div>
                          </div>

                          {/* Role + Stage */}
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
                        </div>
                      </div>

                      {/* Relevant Tasks */}
                      {relevantTasks.length > 0 && (
                        <div className="mt-4 pt-3" style={{ borderTop: '2px dashed var(--border)' }}>
                          <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginBottom: 8 }}>
                            <Swords size={10} style={{ display: 'inline', marginRight: 4 }} />
                            CHALLENGES RELEVANT TO THIS ROLE ({relevantTasks.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {relevantTasks.slice(0, 4).map((task) => {
                              const diffColors: Record<string, string> = { easy: '#4caf50', medium: 'var(--color-gold)', hard: 'var(--color-flag)' };
                              return (
                                <span
                                  key={task.id}
                                  className="flex items-center gap-1 px-2 py-1"
                                  style={{
                                    fontSize: 8,
                                    fontFamily: 'var(--font-pixel)',
                                    background: 'rgba(76,175,80,0.1)',
                                    color: '#4caf50',
                                    border: '1px solid rgba(76,175,80,0.3)',
                                  }}
                                >
                                  <CheckCircle2 size={8} />
                                  {task.name.toUpperCase()}
                                  <span style={{ color: diffColors[task.difficulty], marginLeft: 2 }}>· {task.difficulty.toUpperCase()}</span>
                                </span>
                              );
                            })}
                            {relevantTasks.length > 4 && (
                              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>+{relevantTasks.length - 4} MORE</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: '2px solid var(--border)' }}>
                        {hasScorecard ? (
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2 size={12} style={{ color: '#4caf50' }} />
                            <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: '#4caf50' }}>SCORECARD SUBMITTED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Clock size={12} style={{ color: 'var(--color-gold)' }} />
                            <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>SCORECARD PENDING</span>
                          </div>
                        )}
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ y: 2 }}
                          transition={retro.snap}
                          onClick={() => router.push(`/interviewer/candidate/${applicant.id}/${job.id}`)}
                          className="rpg-button flex items-center gap-1.5 px-3 py-2"
                          style={{
                            background: hasScorecard ? 'var(--surface-raised)' : 'var(--color-orange)',
                            color: hasScorecard ? 'var(--color-orange)' : 'var(--background)',
                            fontSize: 8,
                            fontFamily: 'var(--font-pixel)',
                            border: hasScorecard ? '2px solid var(--color-orange)' : 'none',
                          }}
                        >
                          {hasScorecard ? 'VIEW DETAILS' : 'OPEN SCORECARD'}
                          <ChevronRight size={12} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Interviews */}
        {completedScorecards.length > 0 && (
          <div>
            <h2 style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', marginBottom: 12, letterSpacing: '0.05em' }}>
              ▸ COMPLETED SCORECARDS
            </h2>
            <div className="space-y-2">
              {completedScorecards.map((sc, i) => {
                const applicant = allApplicants.find((a) => a.id === sc.applicantId);
                const job = jobById(sc.jobId);
                const comp = job ? getCompanyById(job.companyId) : null;
                if (!applicant || !job || !comp) return null;
                const totalScore = sc.scores.reduce((s, r) => s + r.score, 0);
                const maxScore = sc.scores.reduce((s, r) => s + 10, 0);
                const recColor = sc.recommendation === 'advance' ? '#4caf50' : sc.recommendation === 'reject' ? 'var(--color-flag)' : 'var(--color-gold)';
                return (
                  <motion.div
                    key={sc.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, ...retro.snap }}
                    className="flex items-center gap-3 pixel-border p-3 cursor-pointer transition-all"
                    style={{ background: 'var(--surface)', borderColor: recColor }}
                    onClick={() => router.push(`/interviewer/candidate/${applicant.id}/${job.id}`)}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 34,
                        height: 34,
                        background: `linear-gradient(135deg, var(--color-orange), var(--color-gold))`,
                        fontSize: 10,
                        fontFamily: 'var(--font-pixel)',
                        color: 'var(--background)',
                        border: '2px solid var(--color-gold)',
                      }}
                    >
                      {applicant.avatar}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>
                        {applicant.firstName.toUpperCase()} {applicant.lastName.toUpperCase()}
                      </div>
                      <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 2 }}>
                        {job.title.toUpperCase()} · {comp.name.toUpperCase()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: recColor }}>
                        {sc.recommendation === 'advance' ? '✓ ADVANCE' : sc.recommendation === 'reject' ? '✗ REJECT' : '~ HOLD'}
                      </div>
                      <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 2 }}>{totalScore}/{maxScore} PTS</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Guide Philosophy - RPG lore panel */}
        <div className="pixel-border p-5 scanlines" style={{ background: 'var(--surface)', position: 'relative' }}>
          <div className="flex items-center gap-3 mb-3">
            <Scroll size={18} style={{ color: 'var(--color-gold)' }} />
            <h3 style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>THE GUIDE&apos;S CREED</h3>
          </div>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)', lineHeight: 2 }}>
            In the QuestHire journey, every candidate starts a new adventure when they apply. As{' '}
            <span style={{ color: 'var(--color-orange)' }}>{currentTeamMember.guideArchetype.toUpperCase()}</span>, you play a crucial role — your honest, constructive feedback shapes their path forward.
          </p>
          <div className="pixel-divider my-4" />
          <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 2 }}>
            Review their completed challenges, assess their skills, and provide feedback that helps them grow — whether or not they advance. Every interaction builds their career profile.
          </p>
        </div>
      </div>
    </div>
  );
}