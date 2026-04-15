'use client';

import { useState } from 'react';
import { useAts } from '@/context/AtsContext';
import { XPBar } from '@/components/ats/shared/XPBar';
import { TaskCard } from '@/components/ats/shared/TaskCard';
import { JourneyPath } from '@/components/ats/shared/JourneyPath';
import { getTaskById, getCompanyById, stageStoryLabels } from '@/data/ats/mockData';
import { User, MapPin, Briefcase, Star, Award, Upload, FileText } from 'lucide-react';

export default function ApplicantProfile() {
  const { currentApplicant, allJobs, uploadApplicantResume } = useAts();
  const jobById = (id: string) => allJobs.find((j) => j.id === id);
  const a = currentApplicant;
  const [profileTab, setProfileTab] = useState<'quest' | 'challenges'>('quest');
  const [selectedResumeFile, setSelectedResumeFile] = useState<File | null>(null);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const totalXP = a.completedTasks.reduce((s, ct) => s + ct.pointsEarned, 0);

  const handleResumeUpload = async () => {
    if (!selectedResumeFile) return;
    setIsUploadingResume(true);
    try {
      await uploadApplicantResume(selectedResumeFile);
      setSelectedResumeFile(null);
    } catch {
      return;
    } finally {
      setIsUploadingResume(false);
    }
  };

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

      {/* Profile summary — full width, directly under role */}
      <div className="px-6 pt-6 w-full space-y-5">
        <div className="rounded-xl border p-5 w-full" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div
              className="flex items-center justify-center rounded-full shrink-0 mx-auto sm:mx-0"
              style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', fontSize: 24, fontWeight: 800, color: 'white' }}
            >
              {a.avatar}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>{a.firstName} {a.lastName}</h2>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>{a.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
                <div className="text-center">
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>{a.level}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Level</div>
                </div>
                <div style={{ width: 1, height: 30, background: 'rgba(124,58,237,0.2)' }} className="hidden sm:block" />
                <div className="text-center">
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa' }}>{a.completedTasks.length}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Tasks</div>
                </div>
                <div style={{ width: 1, height: 30, background: 'rgba(124,58,237,0.2)' }} className="hidden sm:block" />
                <div className="text-center">
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#10b981' }}>{a.applications.length}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Quests</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <XPBar level={a.level} xp={a.xp} xpToNextLevel={a.xpToNextLevel} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="rounded-xl border p-4 space-y-3 w-full" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
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

          <div className="rounded-xl border p-4 w-full" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
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
        </div>

        <div className="rounded-xl border p-4 w-full space-y-4" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Resume Summary</h4>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>{a.resumeSnippet}</p>
          </div>
          <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.05)' }}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: '#a78bfa' }} />
                <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600 }}>Saved Resume</span>
              </div>
              {a.resumeUrl ? (
                <a
                  href={a.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}
                >
                  View current
                </a>
              ) : (
                <span style={{ fontSize: 11, color: '#64748b' }}>No resume uploaded</span>
              )}
            </div>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>
              Upload a resume once and it will automatically attach to any new job applications.
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) => setSelectedResumeFile(event.target.files?.[0] ?? null)}
              style={{ fontSize: 12, color: '#94a3b8', width: '100%' }}
            />
            <button
              type="button"
              onClick={() => void handleResumeUpload()}
              disabled={!selectedResumeFile || isUploadingResume}
              className="rounded-lg px-3 py-2 flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
              style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
            >
              <Upload size={13} />
              {isUploadingResume ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => setProfileTab('quest')}
            className="rounded-xl px-4 py-2.5 transition-all"
            style={{
              fontSize: 13,
              fontWeight: 700,
              background: profileTab === 'quest' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.04)',
              color: profileTab === 'quest' ? '#fff' : '#94a3b8',
              border: `1px solid ${profileTab === 'quest' ? 'transparent' : 'rgba(124,58,237,0.15)'}`,
              boxShadow: profileTab === 'quest' ? '0 0 20px rgba(124,58,237,0.25)' : 'none',
            }}
          >
            Quest History
          </button>
          <button
            type="button"
            onClick={() => setProfileTab('challenges')}
            className="rounded-xl px-4 py-2.5 transition-all"
            style={{
              fontSize: 13,
              fontWeight: 700,
              background: profileTab === 'challenges' ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'rgba(255,255,255,0.04)',
              color: profileTab === 'challenges' ? '#fff' : '#94a3b8',
              border: `1px solid ${profileTab === 'challenges' ? 'transparent' : 'rgba(124,58,237,0.15)'}`,
              boxShadow: profileTab === 'challenges' ? '0 0 20px rgba(124,58,237,0.25)' : 'none',
            }}
          >
            Completed Challenges
          </button>
        </div>
      </div>

      <div className="px-6 pb-8 pt-2 w-full">
        {profileTab === 'quest' && (
          <div className="space-y-4 w-full">
            {a.applications.map((app) => {
              const job = jobById(app.jobId);
              const company = getCompanyById(app.companyId);
              if (!job || !company) return null;
              return (
                <div key={app.id} className="rounded-xl border p-4 w-full" style={{ borderColor: `${company.color}25`, background: `${company.color}06` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-lg" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${company.color}20`, borderRadius: 8 }}>
                      {company.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: company.color }}>{company.name}</div>
                    </div>
                    <div className="text-right shrink-0">
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
                      <p style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5 }}>{`"${app.feedbackForApplicant}"`}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {profileTab === 'challenges' && (
          <div className="w-full space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>Completed Challenges</h2>
              <div className="flex items-center gap-2">
                <Award size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>{a.completedTasks.length} challenges · {totalXP.toLocaleString()} XP</span>
              </div>
            </div>
            <div className="space-y-2 w-full">
              {a.completedTasks.map((ct) => {
                const task = getTaskById(ct.taskId);
                return task ? (
                  <TaskCard key={ct.taskId} task={task} completed completedDate={ct.dateCompleted} />
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
