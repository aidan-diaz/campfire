import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { XPBar } from '../../components/shared/XPBar';
import {
  getCompanyById, getJobById, stageLabels, stageStoryLabels,
  allTasks,
} from '../../data/mockData';
import {
  Users, Map, Star, Sparkles, ChevronRight, CheckCircle2,
  Swords, MessageSquare, Award, Shield, Clock, Scroll,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function InterviewerDashboard() {
  const { currentTeamMember, allJobs, allApplicants, scorecardsList } = useApp();
  const navigate = useNavigate();

  const company = getCompanyById(currentTeamMember.companyId);
  const myJobs = allJobs.filter((j) => j.companyId === currentTeamMember.companyId);

  // Find all applicants assigned to this interviewer
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
  const completedItems = assignedItems.filter(
    ({ application }) => application.stage === 'hired' || application.stage === 'rejected'
  );

  const roleLabel =
    currentTeamMember.role === 'hiring_manager'
      ? 'Hiring Manager'
      : currentTeamMember.role === 'recruiter'
      ? 'Recruiter'
      : 'Team Member';

  const completedScorecards = scorecardsList.filter((sc) => sc.interviewerId === currentTeamMember.id);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={16} style={{ color: company?.color || '#2563eb' }} />
              <span style={{ fontSize: 12, color: company?.color || '#2563eb', fontWeight: 600, letterSpacing: '0.08em' }}>
                {company?.name?.toUpperCase()} · {roleLabel.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Welcome, {currentTeamMember.firstName}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {currentTeamMember.team} · {currentTeamMember.guideArchetype} · {activeItems.length} active interview{activeItems.length !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Guide archetype badge */}
          <div
            className="flex flex-col items-center justify-center rounded-xl p-3 shrink-0"
            style={{ background: `${company?.color || '#2563eb'}10`, border: `1px solid ${company?.color || '#2563eb'}30`, minWidth: 80 }}
          >
            <Scroll size={20} style={{ color: company?.color || '#2563eb' }} />
            <div style={{ fontSize: 10, color: company?.color || '#60a5fa', fontWeight: 700, marginTop: 4 }}>{currentTeamMember.guideArchetype}</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Interviews Assigned', value: assignedItems.length, color: company?.color || '#2563eb', icon: <Users size={16} /> },
            { label: 'Scorecards Filed', value: completedScorecards.length, color: '#10b981', icon: <CheckCircle2 size={16} /> },
            { label: 'Avg. Recommendation', value: completedScorecards.filter((s) => s.recommendation === 'advance').length > 0 ? 'Advance' : 'Pending', color: '#f59e0b', icon: <Award size={16} /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-3" style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                {s.icon}
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Active Interviews */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Active Interviews</h2>
            <span style={{ fontSize: 12, color: '#64748b' }}>{activeItems.length} in progress</span>
          </div>

          {activeItems.length === 0 ? (
            <div className="rounded-xl border text-center py-12" style={{ borderColor: 'rgba(124,58,237,0.1)', background: 'rgba(255,255,255,0.01)' }}>
              <Users size={32} style={{ color: '#334155', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, color: '#475569' }}>No active interviews assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeItems.map(({ applicant, application }, i) => {
                const job = getJobById(application.jobId);
                const comp = getCompanyById(application.companyId);
                if (!job || !comp) return null;

                const currentStageData = job.stages.find((s) => s.name.toLowerCase().replace(' ', '_') === application.stage || s.id.includes(application.stage));
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: `${comp.color}25`, background: `${comp.color}06` }}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          className="flex items-center justify-center rounded-full shrink-0"
                          style={{ width: 46, height: 46, background: `linear-gradient(135deg,${comp.color},${comp.accentColor})`, fontSize: 14, fontWeight: 800, color: 'white' }}
                        >
                          {applicant.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{applicant.firstName} {applicant.lastName}</h3>
                              <div style={{ fontSize: 12, color: '#94a3b8' }}>{applicant.email}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Star size={11} style={{ color: '#f59e0b' }} fill="#f59e0b" />
                              <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>Lv.{applicant.level}</span>
                            </div>
                          </div>

                          {/* Role + Stage */}
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-xs" style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${comp.color}20`, borderRadius: 4 }}>{comp.logo}</div>
                            <span style={{ fontSize: 12, color: comp.color, fontWeight: 600 }}>{job.title}</span>
                            <span style={{ fontSize: 10, color: '#475569' }}>·</span>
                            <span
                              className="px-2 py-0.5 rounded-full"
                              style={{ fontSize: 10, fontWeight: 700, background: `${comp.color}15`, color: comp.accentColor }}
                            >
                              {stageStoryLabels[application.stage]}
                            </span>
                          </div>

                          {/* XP Bar compact */}
                          <div className="mt-3">
                            <XPBar level={applicant.level} xp={applicant.xp} xpToNextLevel={applicant.xpToNextLevel} compact />
                          </div>
                        </div>
                      </div>

                      {/* Relevant Tasks */}
                      {relevantTasks.length > 0 && (
                        <div className="mt-4 pt-3 border-t" style={{ borderColor: `${comp.color}15` }}>
                          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                            <Swords size={11} style={{ display: 'inline', marginRight: 4 }} />
                            Challenges relevant to this role ({relevantTasks.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {relevantTasks.slice(0, 4).map((task) => {
                              const diffColors: Record<string, string> = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
                              return (
                                <span
                                  key={task.id}
                                  className="flex items-center gap-1 px-2 py-1 rounded-full"
                                  style={{ fontSize: 10, background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.15)' }}
                                >
                                  <CheckCircle2 size={9} />
                                  {task.name}
                                  <span style={{ color: diffColors[task.difficulty], fontWeight: 700, marginLeft: 2 }}>· {task.difficulty}</span>
                                </span>
                              );
                            })}
                            {relevantTasks.length > 4 && (
                              <span style={{ fontSize: 10, color: '#64748b' }}>+{relevantTasks.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Row */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: `${comp.color}12` }}>
                        {hasScorecard ? (
                          <div className="flex items-center gap-2 flex-1">
                            <CheckCircle2 size={14} style={{ color: '#10b981' }} />
                            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Scorecard submitted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 flex-1">
                            <Clock size={12} style={{ color: '#f59e0b' }} />
                            <span style={{ fontSize: 11, color: '#f59e0b' }}>Scorecard pending</span>
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/interviewer/candidate/${applicant.id}/${job.id}`)}
                          className="flex items-center gap-1.5 rounded-xl px-3 py-2 transition-all hover:opacity-90"
                          style={{
                            background: hasScorecard ? 'rgba(124,58,237,0.1)' : `linear-gradient(135deg,${comp.color},${comp.color}cc)`,
                            color: hasScorecard ? '#a78bfa' : 'white',
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {hasScorecard ? 'View Details' : 'Open Scorecard'}
                          <ChevronRight size={13} />
                        </button>
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
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Completed Scorecards</h2>
            <div className="space-y-2">
              {completedScorecards.map((sc) => {
                const applicant = allApplicants.find((a) => a.id === sc.applicantId);
                const job = getJobById(sc.jobId);
                const comp = job ? getCompanyById(job.companyId) : null;
                if (!applicant || !job || !comp) return null;
                const totalScore = sc.scores.reduce((s, r) => s + r.score, 0);
                const maxScore = sc.scores.reduce((s, r) => s + 10, 0);
                return (
                  <div
                    key={sc.id}
                    className="flex items-center gap-3 rounded-xl border p-3 cursor-pointer hover:bg-white/[0.02] transition-all"
                    style={{ borderColor: 'rgba(16,185,129,0.15)', background: 'rgba(16,185,129,0.03)' }}
                    onClick={() => navigate(`/interviewer/candidate/${applicant.id}/${job.id}`)}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 34, height: 34, background: `linear-gradient(135deg,${comp.color},${comp.accentColor})`, fontSize: 11, fontWeight: 700, color: 'white' }}
                    >
                      {applicant.avatar}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{applicant.firstName} {applicant.lastName}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{job.title} · {comp.name}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 13, fontWeight: 700, color: sc.recommendation === 'advance' ? '#10b981' : '#ef4444' }}>
                        {sc.recommendation === 'advance' ? '✓ Advance' : sc.recommendation === 'reject' ? '✗ Reject' : '~ Hold'}
                      </div>
                      <div style={{ fontSize: 10, color: '#64748b' }}>{totalScore}/{maxScore} pts</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Guide Philosophy */}
        <div className="rounded-xl border p-5" style={{ borderColor: `${company?.color || '#2563eb'}20`, background: `${company?.color || '#2563eb'}05` }}>
          <div className="flex items-center gap-3 mb-3">
            <Scroll size={18} style={{ color: company?.color || '#60a5fa' }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>The Guide's Creed</h3>
          </div>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
            In the QuestHire journey, every candidate starts a new adventure when they apply. As <span style={{ color: company?.color || '#60a5fa', fontWeight: 600 }}>{currentTeamMember.guideArchetype}</span>, you play a crucial role — your honest, constructive feedback shapes their path forward. 
            <br /><br />
            Review their completed challenges, assess their skills, and provide feedback that helps them grow — whether or not they advance. Every interaction builds their career profile.
          </p>
        </div>
      </div>
    </div>
  );
}