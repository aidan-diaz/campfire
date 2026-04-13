import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';
import { getCompanyById, stageLabels, ApplicationStage } from '../../data/mockData';
import {
  Briefcase, Plus, Search, Users, Calendar, CheckCircle2,
  Clock, Eye, MoreHorizontal, ChevronRight, Filter, FileText,
} from 'lucide-react';
import { motion } from 'motion/react';

export default function RecruiterJobsList() {
  const { currentTeamMember, allJobs, allApplicants } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'draft' | 'closed'>('all');

  const company = getCompanyById(currentTeamMember.companyId);
  const myJobs = allJobs.filter((j) => j.companyId === currentTeamMember.companyId);

  const filtered = myJobs.filter((j) => {
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.team.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const inputStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 10,
    padding: '9px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
  };

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    draft: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8' },
    closed: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase size={16} style={{ color: company?.color || '#7c3aed' }} />
              <span style={{ fontSize: 12, color: company?.color || '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>
                {company?.name?.toUpperCase()} · JOB POSTINGS
              </span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>All Jobs</h1>
            <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
              {myJobs.filter((j) => j.status === 'open').length} open · {myJobs.filter((j) => j.status === 'draft').length} draft
            </p>
          </div>
          <button
            onClick={() => navigate('/recruiter/jobs/new')}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 shrink-0 transition-all hover:opacity-90"
            style={{
              background: `linear-gradient(135deg,${company?.color || '#7c3aed'},${company?.color || '#4f46e5'})`,
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              boxShadow: `0 0 20px ${company?.color || '#7c3aed'}40`,
            }}
          >
            <Plus size={16} />
            Post a Job
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 mt-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} style={{ color: '#475569', position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              style={{ ...inputStyle, paddingLeft: 36, width: '100%' }}
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={13} style={{ color: '#64748b' }} />
            {(['all', 'open', 'draft', 'closed'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="rounded-full px-3 py-1.5 transition-all"
                style={{
                  fontSize: 12,
                  fontWeight: statusFilter === s ? 700 : 400,
                  background: statusFilter === s ? `${company?.color || '#7c3aed'}20` : 'rgba(255,255,255,0.03)',
                  color: statusFilter === s ? company?.accentColor || '#a78bfa' : '#94a3b8',
                  border: `1px solid ${statusFilter === s ? company?.color || '#7c3aed' : 'rgba(124,58,237,0.1)'}`,
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="px-6 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={40} style={{ color: '#334155', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#475569' }}>No jobs found</p>
            <p style={{ fontSize: 13, color: '#334155', marginTop: 4 }}>Try adjusting your search or filters</p>
            <button
              onClick={() => navigate('/recruiter/jobs/new')}
              className="mt-4 rounded-xl px-4 py-2"
              style={{ background: `${company?.color || '#7c3aed'}20`, color: company?.accentColor || '#a78bfa', fontSize: 13 }}
            >
              Post your first job
            </button>
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.12)' }}>
            {/* Table Header */}
            <div
              className="grid px-5 py-3 border-b"
              style={{
                gridTemplateColumns: '1fr 140px 100px 100px 120px 80px',
                borderColor: 'rgba(124,58,237,0.08)',
                background: 'rgba(124,58,237,0.04)',
              }}
            >
              {['Job Title', 'Team', 'Applicants', 'Status', 'Posted', ''].map((h) => (
                <div key={h} style={{ fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((job, i) => {
              const applicantCount = job.applicantIds.length;
              const stageCount: Partial<Record<ApplicationStage, number>> = {};
              allApplicants.forEach((a) => {
                a.applications.forEach((app) => {
                  if (app.jobId === job.id) {
                    stageCount[app.stage] = (stageCount[app.stage] || 0) + 1;
                  }
                });
              });

              const sc = statusColors[job.status] || statusColors.closed;

              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="grid px-5 py-4 border-b items-center cursor-pointer hover:bg-white/[0.02] transition-all"
                  style={{
                    gridTemplateColumns: '1fr 140px 100px 100px 120px 80px',
                    borderColor: 'rgba(124,58,237,0.06)',
                  }}
                  onClick={() => navigate(`/recruiter/jobs/${job.id}`)}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{job.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{job.overview.slice(0, 60)}...</div>
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{job.team}</div>
                  <div className="flex items-center gap-1.5">
                    <Users size={12} style={{ color: '#64748b' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: applicantCount > 0 ? '#f1f5f9' : '#475569' }}>
                      {applicantCount}
                    </span>
                  </div>
                  <div>
                    <span
                      className="px-2.5 py-1 rounded-full"
                      style={{ fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color }}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={11} style={{ color: '#475569' }} />
                    <span style={{ fontSize: 11, color: '#64748b' }}>{job.postedDate}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/recruiter/jobs/${job.id}`); }}
                      className="p-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: `${company?.color || '#7c3aed'}15`, color: company?.accentColor || '#a78bfa' }}
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.04)', color: '#64748b' }}
                    >
                      <MoreHorizontal size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Open Roles', value: myJobs.filter((j) => j.status === 'open').length, color: '#10b981', icon: <CheckCircle2 size={16} /> },
            { label: 'Drafts', value: myJobs.filter((j) => j.status === 'draft').length, color: '#94a3b8', icon: <FileText size={16} /> },
            { label: 'Avg. Applicants / Role', value: myJobs.length > 0 ? (myJobs.reduce((s, j) => s + j.applicantIds.length, 0) / myJobs.filter((j) => j.status === 'open').length || 0).toFixed(1) : '0', color: '#818cf8', icon: <Users size={16} /> },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border p-4" style={{ background: `${s.color}08`, borderColor: `${s.color}20` }}>
              <div className="flex items-center gap-2 mb-2" style={{ color: s.color }}>
                {s.icon}
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
