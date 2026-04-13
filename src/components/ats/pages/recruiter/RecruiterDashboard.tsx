'use client';

import { useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { getCompanyById, stageLabels, ApplicationStage } from '@/data/ats/mockData';
import {
  LayoutDashboard, Briefcase, Plus, TrendingUp, Users, Clock,
  ChevronRight, CheckCircle2, Star, AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function RecruiterDashboard() {
  const { currentTeamMember, allJobs, allApplicants } = useAts();
  const router = useRouter();

  const company = getCompanyById(currentTeamMember.companyId);
  const myJobs = allJobs.filter((j) => j.companyId === currentTeamMember.companyId);
  const openJobs = myJobs.filter((j) => j.status === 'open');
  const draftJobs = myJobs.filter((j) => j.status === 'draft');

  // All applicants for my company's jobs
  const myApplicantIds = new Set(myJobs.flatMap((j) => j.applicantIds));
  const myApplicants = allApplicants.filter((a) => myApplicantIds.has(a.id));

  // Pipeline overview
  const stageCounts: Record<ApplicationStage, number> = {
    applied: 0, screening: 0, interview: 0, final_round: 0, offered: 0, hired: 0, rejected: 0,
  };
  myApplicants.forEach((a) => {
    a.applications.forEach((app) => {
      if (myJobs.find((j) => j.id === app.jobId)) {
        stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
      }
    });
  });

  const stageDisplay: { stage: ApplicationStage; color: string }[] = [
    { stage: 'applied', color: '#94a3b8' },
    { stage: 'screening', color: '#818cf8' },
    { stage: 'interview', color: '#f59e0b' },
    { stage: 'final_round', color: '#f472b6' },
    { stage: 'offered', color: '#10b981' },
    { stage: 'hired', color: '#10b981' },
  ];

  // Recent applicants
  const recentApplicants = myApplicants.slice(0, 5).map((a) => {
    const appForMyJob = a.applications.find((app) => myJobs.find((j) => j.id === app.jobId));
    const job = myJobs.find((j) => j.id === appForMyJob?.jobId);
    return { applicant: a, application: appForMyJob, job };
  }).filter((x) => x.application && x.job);

  const roleLabel = currentTeamMember.role === 'hiring_manager' ? 'Hiring Manager' : 'Recruiter';

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard size={16} style={{ color: company?.color || '#7c3aed' }} />
              <span style={{ fontSize: 12, color: company?.color || '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>
                {company?.name?.toUpperCase()} · {roleLabel.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Welcome, {currentTeamMember.firstName}
            </h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {openJobs.length} open roles · {myApplicants.length} total candidates
            </p>
          </div>
          <button
            onClick={() => router.push('/recruiter/jobs/new')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all hover:opacity-90"
            style={{ background: `linear-gradient(135deg,${company?.color || '#7c3aed'},${company?.color || '#4f46e5'})`, color: 'white', fontSize: 13, fontWeight: 600, boxShadow: `0 0 20px ${company?.color || '#7c3aed'}40` }}
          >
            <Plus size={16} />
            Post a Job
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Open Roles', value: openJobs.length, icon: <Briefcase size={18} />, color: company?.color || '#7c3aed' },
            { label: 'Active Candidates', value: myApplicants.length, icon: <Users size={18} />, color: '#10b981' },
            { label: 'Avg. Time to Hire', value: '29 days', icon: <Clock size={18} />, color: '#f59e0b' },
            { label: 'Offer Rate', value: '67%', icon: <TrendingUp size={18} />, color: '#818cf8' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border p-4"
              style={{ background: `${stat.color}08`, borderColor: `${stat.color}20` }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                {stat.icon}
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>{stat.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Pipeline Overview */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Hiring Pipeline</h2>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            {stageDisplay.map(({ stage, color }) => (
              <div key={stage} className="text-center rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div style={{ fontSize: 24, fontWeight: 800, color }}>{stageCounts[stage]}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{stageLabels[stage]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Open Jobs */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Open Roles</h2>
              <button onClick={() => router.push('/recruiter/jobs')} style={{ fontSize: 12, color: '#a78bfa' }}>View all →</button>
            </div>
            <div className="divide-y divide-[rgba(124,58,237,0.06)]">
              {openJobs.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <AlertCircle size={24} style={{ color: '#475569', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: '#475569' }}>No open roles. Post your first job!</p>
                </div>
              ) : (
                openJobs.map((job) => {
                  const candidateCount = job.applicantIds.length;
                  return (
                    <button
                      key={job.id}
                      onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-all"
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{job.title}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{job.team} · Posted {job.postedDate}</div>
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Users size={12} style={{ color: '#64748b' }} />
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>{candidateCount}</span>
                        </div>
                        <ChevronRight size={14} style={{ color: '#475569' }} />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {draftJobs.length > 0 && (
              <div className="px-5 py-3 border-t" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>{draftJobs.length} draft{draftJobs.length > 1 ? 's' : ''} in progress</span>
              </div>
            )}
          </div>

          {/* Recent Candidates */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.08)' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Recent Candidates</h2>
              <Star size={14} style={{ color: '#f59e0b' }} />
            </div>
            <div className="divide-y divide-[rgba(124,58,237,0.06)]">
              {recentApplicants.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <Users size={24} style={{ color: '#475569', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, color: '#475569' }}>No applicants yet.</p>
                </div>
              ) : (
                recentApplicants.map(({ applicant, application, job }) => {
                  if (!application || !job) return null;
                  const stageColor: Record<string, string> = {
                    applied: '#94a3b8', screening: '#818cf8', interview: '#f59e0b',
                    final_round: '#f472b6', offered: '#10b981', hired: '#10b981', rejected: '#ef4444',
                  };
                  return (
                    <button
                      key={applicant.id}
                      onClick={() => router.push(`/recruiter/jobs/${job.id}`)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-white/[0.02] transition-all"
                    >
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', fontSize: 11, fontWeight: 700, color: 'white' }}
                      >
                        {applicant.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>
                          {applicant.firstName} {applicant.lastName}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.title}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="px-2 py-0.5 rounded-full" style={{ fontSize: 9, fontWeight: 700, background: `${stageColor[application.stage]}15`, color: stageColor[application.stage] }}>
                          {stageLabels[application.stage]}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={9} style={{ color: '#f59e0b' }} />
                          <span style={{ fontSize: 10, color: '#f59e0b' }}>Lv.{applicant.level}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
