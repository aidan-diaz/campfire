'use client';

import { useAts } from '@/context/AtsContext';
import { XPBar } from '@/components/ats/shared/XPBar';
import { TaskCard } from '@/components/ats/shared/TaskCard';
import { JourneyPath } from '@/components/ats/shared/JourneyPath';
import { getTaskById, getCompanyById, stageStoryLabels } from '@/data/ats/mockData';
import { User, MapPin, Briefcase, Star, Clock, Award } from 'lucide-react';

export default function ApplicantProfile() {
  const { currentApplicant, allJobs } = useAts();
  const jobById = (id: string) => allJobs.find((j) => j.id === id);
  const a = currentApplicant;

  const totalXP = a.completedTasks.reduce((s, ct) => s + ct.pointsEarned, 0);

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <User size={16} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: 12, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>CAREER PROFILE</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          {a.firstName} {a.lastName}
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{a.jobGoal}</p>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile Info */}
        <div className="space-y-5">
          {/* Avatar & Stats */}
          <div className="rounded-xl border p-5 text-center" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
            <div
              className="flex items-center justify-center rounded-full mx-auto mb-3"
              style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', fontSize: 24, fontWeight: 800, color: 'white' }}
            >
              {a.avatar}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{a.firstName} {a.lastName}</h2>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{a.email}</p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{a.level}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Level</div>
              </div>
              <div style={{ width: 1, height: 30, background: 'rgba(124,58,237,0.2)' }} />
              <div className="text-center">
                <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>{a.completedTasks.length}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Tasks</div>
              </div>
              <div style={{ width: 1, height: 30, background: 'rgba(124,58,237,0.2)' }} />
              <div className="text-center">
                <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{a.applications.length}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Quests</div>
              </div>
            </div>
          </div>

          {/* XP */}
          <XPBar level={a.level} xp={a.xp} xpToNextLevel={a.xpToNextLevel} />

          {/* Details */}
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-3">
              <MapPin size={14} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{a.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase size={14} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{a.experience} years experience</span>
            </div>
            <div className="flex items-center gap-3">
              <Star size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{totalXP.toLocaleString()} total XP earned</span>
            </div>
          </div>

          {/* Skills */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 10 }}>Skills</h4>
            <div className="flex flex-wrap gap-2">
              {a.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full"
                  style={{ fontSize: 11, background: 'rgba(124,58,237,0.12)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.2)' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div className="rounded-xl border p-4" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Resume Summary</h4>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>{a.resumeSnippet}</p>
          </div>
        </div>

        {/* Right: Applications + Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applications History */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>Journey History</h2>
            <div className="space-y-4">
              {a.applications.map((app) => {
                const job = jobById(app.jobId);
                const company = getCompanyById(app.companyId);
                if (!job || !company) return null;
                return (
                  <div key={app.id} className="rounded-xl border p-4" style={{ borderColor: `${company.color}25`, background: `${company.color}06` }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-lg" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${company.color}20`, borderRadius: 8 }}>
                        {company.logo}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{job.title}</div>
                        <div style={{ fontSize: 12, color: company.color }}>{company.name}</div>
                      </div>
                      <div className="text-right">
                        <div
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            background: app.stage === 'hired' ? 'rgba(16,185,129,0.15)' : app.stage === 'rejected' ? 'rgba(239,68,68,0.15)' : `${company.color}15`,
                            color: app.stage === 'hired' ? '#10b981' : app.stage === 'rejected' ? '#ef4444' : company.accentColor,
                          }}
                        >
                          {stageStoryLabels[app.stage]}
                        </div>
                        <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>Applied {app.dateApplied}</div>
                      </div>
                    </div>
                    <JourneyPath currentStage={app.stage} />
                    {app.completedTasks.length > 0 && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: `${company.color}15` }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Challenges completed for this quest:</div>
                        <div className="flex flex-wrap gap-2">
                          {app.completedTasks.map((ct) => {
                            const task = getTaskById(ct.taskId);
                            return task ? (
                              <span key={ct.taskId} className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ fontSize: 10, background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                                ✓ {task.name} (+{ct.pointsEarned} XP)
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {app.feedbackForApplicant && (
                      <div className="mt-3 pt-3 border-t" style={{ borderColor: `${company.color}15` }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Guide Feedback:</div>
                        <p style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5 }}>"{app.feedbackForApplicant}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completed Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Completed Challenges</h2>
              <div className="flex items-center gap-2">
                <Award size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{a.completedTasks.length} challenges · {totalXP.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="space-y-2">
              {a.completedTasks.map((ct) => {
                const task = getTaskById(ct.taskId);
                return task ? (
                  <TaskCard key={ct.taskId} task={task} completed completedDate={ct.dateCompleted} />
                ) : null;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
