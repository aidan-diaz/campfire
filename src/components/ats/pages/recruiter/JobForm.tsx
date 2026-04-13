'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { teamMembers, getCompanyById, Job, HiringStage } from '@/data/ats/mockData';
import { Plus, Trash2, CheckCircle2, ChevronLeft, Briefcase } from 'lucide-react';

const defaultStages: HiringStage[] = [
  {
    id: 's-applied',
    name: 'Applied',
    storyName: 'Quest Begun',
    order: 1,
    passCriteria: [],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [],
  },
  {
    id: 's-screen',
    name: 'Phone Screen',
    storyName: 'First Encounter',
    order: 2,
    passCriteria: ['Communication clarity', 'Role understanding'],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      { id: 'r1', category: 'Communication', description: 'Clear, structured responses', maxScore: 5 },
      { id: 'r2', category: 'Motivation', description: 'Genuine interest in role', maxScore: 5 },
    ],
  },
  {
    id: 's-interview',
    name: 'Interview',
    storyName: 'The Gauntlet',
    order: 3,
    passCriteria: ['Technical competency', 'Problem-solving', 'Culture fit'],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      { id: 'r3', category: 'Technical Skill', description: 'Domain expertise', maxScore: 10 },
      { id: 'r4', category: 'Problem Solving', description: 'Structured approach', maxScore: 10 },
      { id: 'r5', category: 'Culture Fit', description: 'Values alignment', maxScore: 10 },
    ],
  },
  {
    id: 's-final',
    name: 'Final Round',
    storyName: 'Summit Approach',
    order: 4,
    passCriteria: ['Strategic thinking', 'Leadership potential'],
    requiredTaskIds: [],
    suggestedTaskIds: [],
    rubric: [
      { id: 'r6', category: 'Vision', description: 'Long-term strategic thinking', maxScore: 10 },
      { id: 'r7', category: 'Leadership', description: 'Evidence of leading others', maxScore: 10 },
    ],
  },
];

export default function JobForm() {
  const { currentTeamMember, createJob } = useAts();
  const router = useRouter();
  const company = getCompanyById(currentTeamMember.companyId);

  const [form, setForm] = useState({
    title: '',
    team: '',
    hiringManagerId: currentTeamMember.id,
    teamMemberIds: [] as string[],
    overview: '',
    responsibilities: [''],
    qualifications: [''],
    workEnvironment: '',
    applicationProcess: '',
    stages: defaultStages,
  });
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const myTeamMembers = teamMembers.filter(
    (m) => m.companyId === currentTeamMember.companyId && m.id !== currentTeamMember.id
  );

  const handleSubmit = async (status: 'open' | 'draft') => {
    const newJob: Job = {
      id: `job-new-${Date.now()}`,
      companyId: currentTeamMember.companyId,
      title: form.title,
      team: form.team,
      hiringManagerId: form.hiringManagerId,
      teamMemberIds: form.teamMemberIds,
      overview: form.overview,
      responsibilities: form.responsibilities.filter(Boolean),
      qualifications: form.qualifications.filter(Boolean),
      workEnvironment: form.workEnvironment,
      applicationProcess: form.applicationProcess,
      stages: form.stages,
      postedDate: new Date().toISOString().split('T')[0],
      status,
      applicantIds: [],
      requiredTaskIds: [],
    };
    try {
      await createJob(newJob);
    } catch {
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push('/recruiter/jobs'), 1500);
  };

  const addListItem = (field: 'responsibilities' | 'qualifications') => {
    setForm((f) => ({ ...f, [field]: [...f[field], ''] }));
  };

  const updateListItem = (field: 'responsibilities' | 'qualifications', i: number, val: string) => {
    setForm((f) => {
      const list = [...f[field]];
      list[i] = val;
      return { ...f, [field]: list };
    });
  };

  const removeListItem = (field: 'responsibilities' | 'qualifications', i: number) => {
    setForm((f) => ({ ...f, [field]: f[field].filter((_, idx) => idx !== i) }));
  };

  const toggleTeamMember = (id: string) => {
    setForm((f) => ({
      ...f,
      teamMemberIds: f.teamMemberIds.includes(id)
        ? f.teamMemberIds.filter((x) => x !== id)
        : [...f.teamMemberIds, id],
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a14' }}>
        <div className="text-center">
          <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Job Posted!</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Redirecting to your jobs...</p>
        </div>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#f1f5f9',
    fontSize: 14,
    outline: 'none',
  };

  const labelStyle = { fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 6, fontWeight: 500 };

  return (
    <div className="min-h-screen" style={{ background: '#0a0a14' }}>
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
        <button onClick={() => router.push('/recruiter')} className="flex items-center gap-1.5 mb-4" style={{ fontSize: 13, color: '#64748b' }}>
          <ChevronLeft size={14} /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={16} style={{ color: company?.color || '#7c3aed' }} />
          <span style={{ fontSize: 12, color: company?.color || '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>POST A JOB · {company?.name?.toUpperCase()}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>Create Job Posting</h1>

        {/* Step Tabs */}
        <div className="flex gap-1 mt-4">
          {['Job Details', 'Team Setup', 'Hiring Stages'].map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i + 1)}
              className="rounded-lg px-4 py-2 transition-all"
              style={{
                fontSize: 12,
                fontWeight: step === i + 1 ? 700 : 400,
                background: step === i + 1 ? `${company?.color || '#7c3aed'}20` : 'transparent',
                color: step === i + 1 ? company?.accentColor || '#a78bfa' : '#64748b',
                border: `1px solid ${step === i + 1 ? company?.color || '#7c3aed' : 'transparent'}`,
              }}
            >
              {i + 1}. {s}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6 max-w-2xl">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label style={labelStyle}>Job Title *</label>
              <input style={inputStyle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div>
              <label style={labelStyle}>Team *</label>
              <select
                style={inputStyle}
                value={form.team}
                onChange={(e) => setForm({ ...form, team: e.target.value })}
              >
                <option value="">Select team...</option>
                <option>Product Engineering</option>
                <option>Data & AI</option>
                <option>Go-To-Market (GTM)</option>
                <option>Design</option>
                <option>Operations</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Position Overview *</label>
              <textarea
                style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
                value={form.overview}
                onChange={(e) => setForm({ ...form, overview: e.target.value })}
                placeholder="Describe the role and what makes it exciting..."
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ ...labelStyle, marginBottom: 0 }}>Responsibilities</label>
                <button onClick={() => addListItem('responsibilities')} style={{ fontSize: 11, color: '#a78bfa' }}>+ Add</button>
              </div>
              <div className="space-y-2">
                {form.responsibilities.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <input style={{ ...inputStyle }} value={r} onChange={(e) => updateListItem('responsibilities', i, e.target.value)} placeholder={`Responsibility ${i + 1}`} />
                    {form.responsibilities.length > 1 && (
                      <button onClick={() => removeListItem('responsibilities', i)} className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{ ...labelStyle, marginBottom: 0 }}>Qualifications</label>
                <button onClick={() => addListItem('qualifications')} style={{ fontSize: 11, color: '#a78bfa' }}>+ Add</button>
              </div>
              <div className="space-y-2">
                {form.qualifications.map((q, i) => (
                  <div key={i} className="flex gap-2">
                    <input style={{ ...inputStyle }} value={q} onChange={(e) => updateListItem('qualifications', i, e.target.value)} placeholder={`Qualification ${i + 1}`} />
                    {form.qualifications.length > 1 && (
                      <button onClick={() => removeListItem('qualifications', i)} className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Work Environment</label>
              <input style={inputStyle} value={form.workEnvironment} onChange={(e) => setForm({ ...form, workEnvironment: e.target.value })} placeholder="e.g. Hybrid, San Francisco, CA" />
            </div>
            <div>
              <label style={labelStyle}>Application Process</label>
              <input style={inputStyle} value={form.applicationProcess} onChange={(e) => setForm({ ...form, applicationProcess: e.target.value })} placeholder="e.g. Screen → Technical → Final Panel" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label style={labelStyle}>Hiring Manager</label>
              <select style={inputStyle} value={form.hiringManagerId} onChange={(e) => setForm({ ...form, hiringManagerId: e.target.value })}>
                {teamMembers.filter((m) => m.companyId === currentTeamMember.companyId).map((m) => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName} · {m.role === 'hiring_manager' ? 'Hiring Manager' : m.role === 'recruiter' ? 'Recruiter' : 'Team Member'}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Team Members (interviewers)</label>
              <div className="space-y-2">
                {myTeamMembers.map((m) => {
                  const selected = form.teamMemberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleTeamMember(m.id)}
                      className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-all"
                      style={{
                        border: `1px solid ${selected ? company?.color || '#7c3aed' : 'rgba(124,58,237,0.12)'}`,
                        background: selected ? `${company?.color || '#7c3aed'}10` : 'rgba(255,255,255,0.01)',
                      }}
                    >
                      <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `${company?.color || '#7c3aed'}20`, fontSize: 11, fontWeight: 700, color: company?.color || '#7c3aed' }}>
                        {m.avatar}
                      </div>
                      <div className="flex-1">
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{m.firstName} {m.lastName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{m.team}</div>
                      </div>
                      {selected && <CheckCircle2 size={16} style={{ color: company?.color || '#7c3aed' }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>
              Review and customize the hiring stages for this role. Each stage has evaluation criteria built in.
            </p>
            {form.stages.map((stage, i) => (
              <div key={stage.id} className="rounded-xl border p-4" style={{ borderColor: 'rgba(124,58,237,0.12)', background: 'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="flex items-center justify-center rounded-full text-xs"
                    style={{ width: 24, height: 24, background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 700 }}
                  >
                    {i + 1}
                  </div>
                  <input
                    style={{ ...inputStyle, padding: '6px 10px', width: 'auto', flex: 1 }}
                    value={stage.name}
                    onChange={(e) => {
                      const updated = [...form.stages];
                      updated[i] = { ...stage, name: e.target.value };
                      setForm({ ...form, stages: updated });
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>{stage.storyName}</span>
                </div>
                {stage.passCriteria.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {stage.passCriteria.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}>{c}</span>
                    ))}
                  </div>
                )}
                {stage.rubric.length > 0 && (
                  <div className="mt-2">
                    <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>Rubric ({stage.rubric.length} criteria)</div>
                    <div className="flex flex-wrap gap-1">
                      {stage.rubric.map((r) => (
                        <span key={r.id} style={{ fontSize: 10, color: '#64748b' }}>{r.category} (/{r.maxScore})</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 rounded-xl py-3" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 14 }}>
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(step + 1)} className="flex-1 rounded-xl py-3 transition-all hover:opacity-90" style={{ background: `linear-gradient(135deg,${company?.color || '#7c3aed'},${company?.color || '#4f46e5'})`, color: 'white', fontSize: 14, fontWeight: 600 }}>
              Continue
            </button>
          ) : (
            <div className="flex gap-2 flex-1">
              <button onClick={() => handleSubmit('draft')} className="flex-1 rounded-xl py-3" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 13, border: '1px solid rgba(124,58,237,0.12)' }}>
                Save Draft
              </button>
              <button onClick={() => handleSubmit('open')} disabled={!form.title || !form.team} className="flex-1 rounded-xl py-3 transition-all hover:opacity-90 disabled:opacity-40" style={{ background: `linear-gradient(135deg,${company?.color || '#7c3aed'},${company?.color || '#4f46e5'})`, color: 'white', fontSize: 13, fontWeight: 600 }}>
                Publish Job
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
