'use client';

import { useAts } from '@/context/AtsContext';
import { getCompanyById, hiringMetrics, stageLabels, ApplicationStage, allTasks } from '@/data/ats/mockData';
import {
  BarChart3, TrendingUp, Users, Clock, Target, Award,
  Sparkles, CheckCircle2, DollarSign, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { motion } from 'motion/react';

const TOOLTIP_STYLE = {
  background: '#0f0f1e',
  border: '1px solid rgba(124,58,237,0.2)',
  borderRadius: 8,
  color: '#f1f5f9',
  fontSize: 12,
};

export default function RecruiterAnalytics() {
  const { currentTeamMember, allJobs, allApplicants } = useAts();
  const company = getCompanyById(currentTeamMember.companyId);

  const myJobs = allJobs.filter((j) => j.companyId === currentTeamMember.companyId);

  // Pipeline funnel data
  const stageCounts: Record<string, number> = {};
  const pipelineStages: ApplicationStage[] = ['applied', 'screening', 'interview', 'final_round', 'offered', 'hired'];
  pipelineStages.forEach((s) => (stageCounts[s] = 0));
  allApplicants.forEach((a) => {
    a.applications.forEach((app) => {
      if (myJobs.find((j) => j.id === app.jobId)) {
        stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1;
      }
    });
  });

  const funnelData = pipelineStages.map((s) => ({
    name: stageLabels[s],
    value: stageCounts[s],
    fill: ['#94a3b8', '#818cf8', '#f59e0b', '#ec4899', '#10b981', '#f59e0b'][pipelineStages.indexOf(s)],
  }));

  // Source of hire
  const sourceData = hiringMetrics.sourceOfHire.map((s, i) => ({
    name: s.source,
    value: s.count,
    percentage: s.percentage,
    fill: ['#7c3aed', '#2563eb', '#db2777', '#f59e0b', '#10b981'][i],
  }));

  // Tasks completed by difficulty
  const tasksByDiff = { easy: 0, medium: 0, hard: 0 };
  allApplicants.forEach((a) => {
    a.completedTasks.forEach((ct) => {
      const task = allTasks.find((t) => t.id === ct.taskId);
      if (task) tasksByDiff[task.difficulty]++;
    });
  });

  const taskDiffData = [
    { name: 'Easy', value: tasksByDiff.easy, fill: '#10b981' },
    { name: 'Medium', value: tasksByDiff.medium, fill: '#f59e0b' },
    { name: 'Hard', value: tasksByDiff.hard, fill: '#ef4444' },
  ];

  // Time to hire per job (mock)
  const timeToHireData = myJobs
    .filter((j) => j.status === 'open')
    .map((j, i) => ({
      name: j.title.split(' ').slice(0, 2).join(' '),
      days: [28, 42, 29, 35][i] || 30,
    }));

  // XP distribution of applicants
  const xpData = allApplicants.map((a) => ({
    name: `${a.firstName} ${a.lastName[0]}.`,
    xp: a.xp,
    level: a.level,
    fill: company?.color || '#7c3aed',
  }));

  const totalApplicants = new Set(myJobs.flatMap((j) => j.applicantIds)).size;
  const hiredCount = allApplicants.reduce((c, a) => c + a.applications.filter((app) => app.stage === 'hired' && myJobs.find((j) => j.id === app.jobId)).length, 0);
  const offeredCount = allApplicants.reduce((c, a) => c + a.applications.filter((app) => (app.stage === 'offered' || app.stage === 'hired') && myJobs.find((j) => j.id === app.jobId)).length, 0);

  const kpis = [
    { label: 'Avg. Time to Fill', value: '33 days', icon: <Clock size={18} />, color: '#f59e0b', delta: '-4 days vs last quarter', up: true },
    { label: 'Avg. Time to Hire', value: '29 days', icon: <TrendingUp size={18} />, color: '#818cf8', delta: '-6 days vs last quarter', up: true },
    { label: 'Offer Acceptance Rate', value: `${offeredCount > 0 ? Math.round((hiredCount / offeredCount) * 100) : 100}%`, icon: <Target size={18} />, color: '#10b981', delta: '+5% vs last quarter', up: true },
    { label: 'Avg. XP per Candidate', value: Math.round(allApplicants.reduce((s, a) => s + a.xp, 0) / (allApplicants.length || 1)).toLocaleString(), icon: <Sparkles size={18} />, color: '#f59e0b', delta: '+320 XP vs last quarter', up: true },
    { label: 'Avg. Tasks Completed', value: hiringMetrics.avgTasksCompleted.toString(), icon: <CheckCircle2 size={18} />, color: '#a78bfa', delta: '+1.2 tasks vs last quarter', up: true },
    { label: 'Total Candidates', value: totalApplicants.toString(), icon: <Users size={18} />, color: '#60a5fa', delta: `Across ${myJobs.filter((j) => j.status === 'open').length} open roles`, up: true },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={16} style={{ color: company?.color || '#7c3aed' }} />
          <span style={{ fontSize: 12, color: company?.color || '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>
            {company?.name?.toUpperCase()} · ANALYTICS
          </span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Hiring Analytics</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
          Data-driven insights across all roles · Q1 2026
        </p>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border p-4"
              style={{ background: `${kpi.color}06`, borderColor: `${kpi.color}20` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2" style={{ color: kpi.color }}>
                  {kpi.icon}
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', color: '#64748b' }}>
                    {kpi.label.toUpperCase()}
                  </span>
                </div>
                {kpi.up && <ArrowUpRight size={14} style={{ color: '#10b981' }} />}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>{kpi.delta}</div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Funnel */}
          <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Hiring Pipeline Funnel</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Source of Hire */}
          <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Source of Hire</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {sourceData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {sourceData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.fill }} />
                      <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{s.value}</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>{s.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time to Hire by Role */}
          <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Time to Fill by Role (Days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={timeToHireData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                <Bar dataKey="days" fill={company?.color || '#7c3aed'} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Task Completion by Difficulty */}
          <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Challenges Completed by Difficulty</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={taskDiffData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.08)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {taskDiffData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate XP Leaderboard */}
        <div className="rounded-xl border p-5" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>Candidate XP Leaderboard</h3>
            <div className="flex items-center gap-2">
              <Sparkles size={13} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: 11, color: '#64748b' }}>Gamified ranking across all applicants</span>
            </div>
          </div>
          <div className="space-y-2">
            {allApplicants
              .filter((a) => a.applications.some((app) => myJobs.find((j) => j.id === app.jobId)))
              .sort((a, b) => b.xp - a.xp)
              .map((applicant, i) => {
                const application = applicant.applications.find((app) => myJobs.find((j) => j.id === app.jobId));
                const jobForApp = myJobs.find((j) => j.id === application?.jobId);
                const maxXP = 8000;
                const rankColors = ['#f59e0b', '#94a3b8', '#cd7f32'];
                return (
                  <div key={applicant.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(124,58,237,0.06)' }}>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0 text-xs font-bold"
                      style={{ width: 28, height: 28, background: i < 3 ? `${rankColors[i]}20` : 'rgba(124,58,237,0.1)', color: i < 3 ? rankColors[i] : '#64748b', fontSize: 12, fontWeight: 800 }}
                    >
                      {i + 1}
                    </div>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 32, height: 32, background: `linear-gradient(135deg,${company?.color || '#7c3aed'},${company?.accentColor || '#a78bfa'})`, fontSize: 11, fontWeight: 700, color: 'white' }}
                    >
                      {applicant.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{applicant.firstName} {applicant.lastName}</span>
                        <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>Lv.{applicant.level}</span>
                        {jobForApp && <span style={{ fontSize: 10, color: '#64748b' }}>· {jobForApp.title}</span>}
                      </div>
                      <div className="rounded-full overflow-hidden mt-1" style={{ height: 4, background: 'rgba(245,158,11,0.1)' }}>
                        <div style={{ width: `${Math.min((applicant.xp / maxXP) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,#f59e0b,#fbbf24)', borderRadius: 999 }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <Sparkles size={11} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{applicant.xp.toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#475569' }}>{applicant.completedTasks.length} tasks</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
