'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAts } from '@/context/AtsContext';
import { teamMembers, applicants } from '@/data/ats/mockData';
import { Zap, Briefcase, Users, Star, ChevronRight, Shield, Sword, Crown, Scroll } from 'lucide-react';
import { motion } from 'motion/react';
import { retro, cardVariants } from '@/lib/animations';

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
    if (!m) {
      return;
    }

    setCurrentTeamMember(m);

    const personaForMember = m.role === 'recruiter' || m.role === 'hiring_manager' ? 'recruiter' : 'interviewer';
    setPersona(personaForMember);
    router.push(personaForMember === 'recruiter' ? '/recruiter' : '/interviewer');
  };

  const filteredTeamMembers = teamMembers.filter((m) =>
    selectedRole === 'recruiter'
      ? m.role === 'recruiter' || m.role === 'hiring_manager'
      : m.role === 'team_member'
  );

  const personas = [
    {
      id: 'applicant' as const,
      title: 'ADVENTURER',
      subtitle: 'Start your journey, build your career profile',
      icon: <Sword size={28} style={{ color: 'var(--color-gold)' }} />,
      color: 'var(--color-gold)',
      borderColor: 'var(--color-gold)',
    },
    {
      id: 'recruiter' as const,
      title: 'GUILD MASTER',
      subtitle: 'Post quests, review candidates, build great teams',
      icon: <Crown size={28} style={{ color: 'var(--color-orange)' }} />,
      color: 'var(--color-orange)',
      borderColor: 'var(--color-orange)',
    },
    {
      id: 'interviewer' as const,
      title: 'GUIDE',
      subtitle: 'Guide candidates through their hiring journey',
      icon: <Scroll size={28} style={{ color: 'var(--foreground)' }} />,
      color: 'var(--foreground)',
      borderColor: 'var(--border)',
    },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden scanlines" style={{ background: 'var(--background)', position: 'relative' }}>
      {/* Pixel grid overlay */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(252,191,73,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(252,191,73,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Radial glow */}
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(252,191,73,0.1) 0%, transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-12"
        >
          <div
            className="flex items-center justify-center mb-4"
            style={{
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, var(--color-orange), var(--color-gold))',
              border: '4px solid var(--color-gold)',
              boxShadow: '0 0 40px rgba(252,191,73,0.5), 8px 8px 0 rgba(0,0,0,0.3)',
            }}
          >
            <Zap size={32} style={{ color: 'var(--background)' }} />
          </div>
          <h1 style={{ fontSize: 24, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em', lineHeight: 1 }}>
            [⚡] QUESTHIRE
          </h1>
          <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 12, textAlign: 'center', lineHeight: 1.8 }}>
            WHERE CAREERS LEVEL UP · WHERE TOP TALENT RISES FASTER
          </p>
        </motion.div>

        {/* Step: Role Selection */}
        {step === 'role' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-center mb-2" style={{ fontSize: 14, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.08em' }}>
              SELECT YOUR CLASS
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              EACH CLASS UNLOCKS A DIFFERENT EXPERIENCE
            </p>
            <div className="grid grid-cols-1 gap-4">
              {personas.map((p, i) => (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -4, boxShadow: `0 0 24px ${p.color === 'var(--foreground)' ? 'rgba(234,226,183,0.2)' : p.color === 'var(--color-gold)' ? 'rgba(252,191,73,0.3)' : 'rgba(247,127,0,0.3)'}` }}
                  whileTap={{ y: 2 }}
                  transition={{ delay: i * 0.1, ...retro.snap }}
                  onClick={() => handleRoleSelect(p.id)}
                  className="pixel-border flex items-center gap-5 text-left"
                  style={{
                    padding: '20px 24px',
                    background: 'var(--surface)',
                    borderColor: p.borderColor,
                  }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 56,
                      height: 56,
                      background: 'rgba(0,0,0,0.4)',
                      border: `2px solid ${p.borderColor}`,
                    }}
                  >
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 12, fontFamily: 'var(--font-pixel)', color: p.color }}>{p.title}</div>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 8, lineHeight: 1.8 }}>{p.subtitle.toUpperCase()}</div>
                  </div>
                  <ChevronRight size={20} style={{ color: p.color }} />
                </motion.button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 mt-8">
              <Shield size={12} style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>DEMO PLATFORM — NO REAL DATA STORED</span>
            </div>
          </motion.div>
        )}

        {/* Step: Applicant Select */}
        {step === 'applicant-select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setStep('role')}
              style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginBottom: 16 }}
            >
              ← BACK
            </button>
            <h2 className="text-center mb-2" style={{ fontSize: 14, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
              SELECT YOUR ADVENTURER
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              CHOOSE A PROFILE TO EXPLORE THE JOURNEY EXPERIENCE
            </p>
            <div className="space-y-3">
              {applicants.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 1 }}
                  transition={{ delay: i * 0.08, ...retro.snap }}
                  onClick={() => handleApplicantSelect(a.id)}
                  className="w-full pixel-border flex items-center gap-4 text-left"
                  style={{ padding: '16px 20px', background: 'var(--surface)' }}
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, var(--color-orange), var(--color-gold))',
                      fontSize: 14,
                      fontFamily: 'var(--font-pixel)',
                      color: 'var(--background)',
                      border: '2px solid var(--color-gold)',
                    }}
                  >
                    {a.avatar}
                  </div>
                  <div className="flex-1">
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>{a.firstName.toUpperCase()} {a.lastName.toUpperCase()}</div>
                    <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>{a.jobGoal.toUpperCase()}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-0.5" style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', background: 'rgba(252,191,73,0.15)', border: '1px solid var(--color-gold)' }}>LV.{a.level}</span>
                      <span style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>{a.xp.toLocaleString()} XP</span>
                      <span style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>{a.applications.length} QUESTS</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-gold)' }} />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Team Member Select */}
        {step === 'team-select' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setStep('role')}
              style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginBottom: 16 }}
            >
              ← BACK
            </button>
            <h2 className="text-center mb-2" style={{ fontSize: 14, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
              SELECT YOUR {selectedRole === 'recruiter' ? 'GUILD MASTER' : 'GUIDE'}
            </h2>
            <p className="text-center mb-8" style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>
              {selectedRole === 'recruiter' ? 'EXPLORE THE GUILD MASTER EXPERIENCE' : 'EXPLORE THE GUIDE EXPERIENCE'}
            </p>
            <div className="space-y-3">
              {filteredTeamMembers.map((m, i) => {
                const roleLabel = m.role === 'hiring_manager' ? 'HIRING MANAGER' : m.role === 'recruiter' ? 'RECRUITER' : 'TEAM MEMBER';
                const companyNames: Record<string, string> = { nexacloud: 'NEXACLOUD', synapseai: 'SYNAPSE AI', momentumgtm: 'MOMENTUM GTM' };
                return (
                  <motion.button
                    key={m.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 1 }}
                    transition={{ delay: i * 0.07, ...retro.snap }}
                    onClick={() => handleTeamMemberSelect(m.id)}
                    className="w-full pixel-border flex items-center gap-4 text-left"
                    style={{ padding: '16px 20px', background: 'var(--surface)' }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, var(--color-orange), var(--color-gold))',
                        fontSize: 14,
                        fontFamily: 'var(--font-pixel)',
                        color: 'var(--background)',
                        border: '2px solid var(--color-orange)',
                      }}
                    >
                      {m.avatar}
                    </div>
                    <div className="flex-1">
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>{m.firstName.toUpperCase()} {m.lastName.toUpperCase()}</div>
                      <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-orange)', marginTop: 4 }}>{roleLabel} · {companyNames[m.companyId]}</div>
                      <div style={{ fontSize: 7, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>{m.team.toUpperCase()}</div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)' }}>{m.guideArchetype.toUpperCase()}</div>
                      <ChevronRight size={16} style={{ color: 'var(--color-orange)', marginTop: 4 }} />
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
