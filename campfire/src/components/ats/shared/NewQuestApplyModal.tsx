'use client';

import { useState, useEffect } from 'react';
import { useAts } from '@/context/AtsContext';
import { getCompanyById } from '@/data/ats/mockData';
import { Map, X, ChevronRight, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';

type NewQuestApplyModalProps = {
  open: boolean;
  onClose: () => void;
  /** When opening from a specific job row, pre-select that job */
  initialJobId?: string | null;
};

export function NewQuestApplyModal({ open, onClose, initialJobId = null }: NewQuestApplyModalProps) {
  const { currentApplicant, allJobs, applyToJob } = useAts();
  const [applyStep, setApplyStep] = useState(1);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [source, setSource] = useState('');

  const jobById = (id: string) => allJobs.find((j) => j.id === id);

  const openJobs = allJobs.filter(
    (j) => j.status === 'open' && !currentApplicant.applications.some((a) => a.jobId === j.id)
  );

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      setApplyStep(1);
      setSelectedJob(initialJobId ?? null);
      setSource('');
    });

    return () => cancelAnimationFrame(frame);
  }, [open, initialJobId]);

  const handleClose = () => {
    setApplyStep(1);
    setSelectedJob(null);
    setSource('');
    onClose();
  };

  const handleApply = async () => {
    if (!selectedJob) return;
    const job = jobById(selectedJob);
    if (!job) return;
    try {
      await applyToJob(selectedJob, job.companyId, source || 'Direct');
    } catch {
      return;
    }
    setApplyStep(3);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl border overflow-hidden"
        style={{ background: '#0f0f1e', borderColor: 'rgba(124,58,237,0.2)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
          <div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>NEW QUEST</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9' }}>
              {applyStep === 1 ? 'Choose Your Quest' : applyStep === 2 ? 'Share Your Path' : 'Begin the Journey'}
            </h3>
          </div>
          <button type="button" onClick={handleClose} aria-label="Close">
            <X size={20} style={{ color: '#64748b' }} />
          </button>
        </div>

        <div className="px-6 py-5">
          {applyStep === 1 && (
            <div className="space-y-3">
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>Select a role to begin your journey</p>
              {openJobs.map((job) => {
                const company = getCompanyById(job.companyId);
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJob(job.id)}
                    className="w-full flex items-center gap-3 rounded-xl border text-left transition-all p-4"
                    style={{
                      borderColor: selectedJob === job.id ? company?.color || '#7c3aed' : 'rgba(124,58,237,0.1)',
                      background: selectedJob === job.id ? `${company?.color}15` : 'rgba(255,255,255,0.01)',
                    }}
                  >
                    <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: `${company?.color}20`, fontSize: 16 }}>
                      {company?.logo}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: company?.color }}>{company?.name} · {job.team}</div>
                    </div>
                    {selectedJob === job.id && <CheckCircle2 size={16} style={{ color: company?.color, marginLeft: 'auto' }} />}
                  </button>
                );
              })}
              {openJobs.length === 0 && (
                <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: '24px 0' }}>You&apos;ve applied to all open roles!</p>
              )}
            </div>
          )}

          {applyStep === 2 && (
            <div className="space-y-4">
              <div>
                <label style={{ fontSize: 13, color: '#94a3b8', display: 'block', marginBottom: 8 }}>How did you hear about this role?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['LinkedIn', 'Referral', 'Company Website', 'Indeed', 'Twitter/X', 'Other'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      className="rounded-lg py-2 px-3 text-left transition-all"
                      style={{
                        fontSize: 13,
                        background: source === s ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.02)',
                        color: source === s ? '#a78bfa' : '#94a3b8',
                        border: `1px solid ${source === s ? '#7c3aed' : 'rgba(124,58,237,0.1)'}`,
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {selectedJob && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>
                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>Required on apply: </span>
                    Complete the role&apos;s required challenge after applying to stand out.
                  </p>
                </div>
              )}
              <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <p style={{ fontSize: 12, color: '#94a3b8' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>Resume attached automatically: </span>
                  {currentApplicant.resumeFileName
                    ? `${currentApplicant.resumeFileName} will be included with this application.`
                    : 'No saved resume yet. Upload one from your profile so future applications include it.'}
                </p>
              </div>
            </div>
          )}

          {applyStep === 3 && (
            <div className="text-center py-4">
              <div
                className="flex items-center justify-center rounded-full mx-auto mb-4"
                style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
              >
                <Map size={28} color="white" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Quest Begun! ⚔️</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>
                Your application is in. Complete challenges to boost your ranking and move faster through the journey.
              </p>
              <div className="flex items-center gap-2 justify-center mt-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <Star size={14} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 12, color: '#f59e0b' }}>Complete challenges to earn XP and level up your journey!</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
          {applyStep < 3 && (
            <>
              {applyStep > 1 && (
                <button type="button" onClick={() => setApplyStep(applyStep - 1)} className="flex-1 rounded-xl py-2.5" style={{ background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: 14 }}>
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (applyStep === 2) void handleApply();
                  else if (selectedJob) setApplyStep(applyStep + 1);
                }}
                disabled={applyStep === 1 && !selectedJob}
                className="flex-1 rounded-xl py-2.5 flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 14, fontWeight: 600 }}
              >
                {applyStep === 2 ? 'Begin Quest' : 'Continue'}
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {applyStep === 3 && (
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl py-2.5"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: 'white', fontSize: 14, fontWeight: 600 }}
            >
              View My Journey
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
