'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { teamMembers, applicants } from '@/data/ats/mockData';
import { Zap, Briefcase, Users, Star, ChevronRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const BG_IMAGE = 'https://images.unsplash.com/photo-1771448234296-78d75c0afe12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwYWJzdHJhY3QlMjBqb3VybmV5JTIwcGF0aCUyMGdsb3dpbmclMjBwdXJwbGV8ZW58MXx8fHwxNzc2MDQ3NzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';

type Step = 'role' | 'applicant-select' | 'team-select';

export default function Landing() {
  const { setPersona, setCurrentApplicant, setCurrentTeamMember } = useAts();
  const router = useRouter();
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<'applicant' | 'recruiter' | 'interviewer' | null>(null);

  const handleRoleSelect = (role: 'applicant' | 'recruiter' | 'interviewer') => {
    setSelectedRole(role);
    if (role === 'applicant') setStep('applicant-select');
    else setStep('team-select');
  };

  const handleApplicantSelect = (id: string) => {
    const a = applicants.find((x) => x.id === id);
    if (a) setCurrentApplicant(a);
    setPersona('applicant');
    router.push('/applicant');
  };

  const handleTeamMemberSelect = (id: string) => {
    const m = teamMembers.find((x) => x.id === id);
    if (m) setCurrentTeamMember(m);
    if (selectedRole) setPersona(selectedRole);
    if (selectedRole === 'recruiter') router.push('/recruiter');
    else router.push('/interviewer');
  };

  const filteredTeamMembers = teamMembers.filter((m) =>
    selectedRole === 'recruiter' ? m.role === 'recruiter' || m.role === 'hiring_manager' : m.role !== 'recruiter'
  );

  const personas = [
    {
      id: 'applicant' as const,
      title: 'I\'m an Applicant',
      subtitle: 'Start your journey, build your career profile',
      icon: <Star size={28} style={{ color: '#f59e0b' }} />,
      color: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.08)',
      borderColor: 'rgba(245,158,11,0.25)',
      glow: '0 0 40px rgba(245,158,11,0.15)',
    },
    {
      id: 'recruiter' as const,
      title: 'I\'m a Recruiter',
      subtitle: 'Post jobs, review candidates, build great teams',
      icon: <Briefcase size={28} style={{ color: '#a78bfa' }} />,
      color: '#a78bfa',
      accentBg: 'rgba(124,58,237,0.08)',
      borderColor: 'rgba(124,58,237,0.25)',
      glow: '0 0 40px rgba(124,58,237,0.15)',
    },
    {
      id: 'interviewer' as const,
      title: 'I\'m an Interviewer',
      subtitle: 'Guide candidates through their hiring journey',
      icon: <Users size={28} style={{ color: '#60a5fa' }} />,
      color: '#60a5fa',
      accentBg: 'rgba(37,99,235,0.08)',
      borderColor: 'rgba(37,99,235,0.25)',
      glow: '0 0 40px rgba(37,99,235,0.15)',
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#07070f' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img src={BG_IMAGE} alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 40px rgba(124,58,237,0.5)' }}
          >
            <Zap size={32} color="white" />
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.03em', lineHeight: 1 }}>
            QuestHire
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>
            Where careers level up. Where top talent rises faster.
          </p>
        </motion.div>

        {/* Step: Role Selection */}
        {step === 'role' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-center mb-2" style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              Choose your role
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 14, color: '#64748b' }}>
              Each persona unlocks a different experience on the platform
            </p>
            <div className="grid grid-cols-1 gap-4">
              {personas.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleRoleSelect(p.id)}
                  className="flex items-center gap-5 rounded-2xl border text-left transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    padding: '20px 24px',
                    background: p.accentBg,
                    borderColor: p.borderColor,
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = p.glow; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; }}
                >
                  <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.04)', border: `1px solid ${p.borderColor}` }}>
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>{p.title}</div>
                    <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{p.subtitle}</div>
                  </div>
                  <ChevronRight size={20} style={{ color: p.color }} />
                </motion.button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <Shield size={12} style={{ color: '#475569' }} />
              <span style={{ fontSize: 11, color: '#475569' }}>Demo platform — no real data stored</span>
            </div>
          </motion.div>
        )}

        {/* Step: Applicant Select */}
        {step === 'applicant-select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setStep('role')} style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>← Back</button>
            <h2 className="text-center mb-2" style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              Select your applicant profile
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 14, color: '#64748b' }}>
              Choose from our seed applicant profiles to explore the journey experience
            </p>
            <div className="space-y-3">
              {applicants.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleApplicantSelect(a.id)}
                  className="w-full flex items-center gap-4 rounded-2xl border text-left transition-all hover:scale-[1.005]"
                  style={{ padding: '16px 20px', background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)' }}
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontWeight: 700, fontSize: 14 }}
                  >
                    {a.avatar}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{a.firstName} {a.lastName}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{a.jobGoal}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>Level {a.level}</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{a.xp.toLocaleString()} XP</span>
                      <span style={{ fontSize: 11, color: '#64748b' }}>{a.applications.length} applications</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: '#f59e0b' }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Team Member Select */}
        {step === 'team-select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button onClick={() => setStep('role')} style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>← Back</button>
            <h2 className="text-center mb-2" style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>
              Select your team profile
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 14, color: '#64748b' }}>
              {selectedRole === 'recruiter' ? 'Explore the recruiter experience' : 'Explore the interviewer experience'}
            </p>
            <div className="space-y-3">
              {filteredTeamMembers.map((m, i) => {
                const roleLabel = m.role === 'hiring_manager' ? 'Hiring Manager' : m.role === 'recruiter' ? 'Recruiter' : 'Team Member';
                const colorMap: Record<string, string> = { nexacloud: '#7c3aed', synapseai: '#2563eb', momentumgtm: '#db2777' };
                const color = colorMap[m.companyId] ?? '#7c3aed';
                const companyNames: Record<string, string> = { nexacloud: 'NexaCloud', synapseai: 'Synapse AI', momentumgtm: 'Momentum GTM' };
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleTeamMemberSelect(m.id)}
                    className="w-full flex items-center gap-4 rounded-2xl border text-left transition-all hover:scale-[1.005]"
                    style={{ padding: '16px 20px', background: `rgba(0,0,0,0.2)`, borderColor: `${color}30` }}
                  >
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 44, height: 44, background: `linear-gradient(135deg,${color},${color}99)`, color: 'white', fontWeight: 700, fontSize: 14 }}
                    >
                      {m.avatar}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{m.firstName} {m.lastName}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{roleLabel} · {companyNames[m.companyId]}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.team}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 10, color: color, fontWeight: 600 }}>{m.guideArchetype}</div>
                      <ChevronRight size={16} style={{ color }} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
