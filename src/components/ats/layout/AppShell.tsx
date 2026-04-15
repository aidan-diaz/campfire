'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton, useUser } from '@clerk/nextjs';
import {
  LayoutDashboard, Swords, User, BarChart3, Briefcase, Plus,
  Users, ChevronRight, LogOut, Menu, X, Zap, Map
} from 'lucide-react';

type ActiveRole = 'applicant' | 'recruiter' | 'interviewer';

function roleFromPathname(pathname: string): ActiveRole {
  if (pathname.startsWith('/applicant')) return 'applicant';
  if (pathname.startsWith('/recruiter')) return 'recruiter';
  if (pathname.startsWith('/interviewer')) return 'interviewer';
  return 'applicant';
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const applicantNav: NavItem[] = [
  { label: 'My Journey', path: '/applicant', icon: <Map size={18} /> },
  { label: 'Challenges', path: '/applicant/tasks', icon: <Swords size={18} /> },
  { label: 'Profile', path: '/applicant/profile', icon: <User size={18} /> },
];

const recruiterNav: NavItem[] = [
  { label: 'Dashboard', path: '/recruiter', icon: <LayoutDashboard size={18} /> },
  { label: 'Jobs', path: '/recruiter/jobs', icon: <Briefcase size={18} /> },
  { label: 'Post a Job', path: '/recruiter/jobs/new', icon: <Plus size={18} /> },
  { label: 'Analytics', path: '/recruiter/analytics', icon: <BarChart3 size={18} /> },
];

const interviewerNav: NavItem[] = [
  { label: 'My Interviews', path: '/interviewer', icon: <Users size={18} /> },
];

const NAV_BY_ROLE: Record<ActiveRole, NavItem[]> = {
  applicant: applicantNav,
  recruiter: recruiterNav,
  interviewer: interviewerNav,
};

const ROLE_LABELS: Record<ActiveRole, string> = {
  applicant: 'Applicant',
  recruiter: 'Hiring Manager',
  interviewer: 'Interviewer',
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = roleFromPathname(pathname);
  const navItems = NAV_BY_ROLE[role];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0a14', color: '#f1f5f9' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 shrink-0"
        style={{
          width: sidebarOpen ? 240 : 64,
          background: '#0f0f1e',
          borderRight: '1px solid rgba(124,58,237,0.15)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(124,58,237,0.15)' }}>
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}
          >
            <Zap size={18} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.02em' }}>QuestHire</div>
              <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, letterSpacing: '0.08em' }}>ATS PLATFORM</div>
            </div>
          )}
          <button
            className="ml-auto"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ color: '#64748b' }}
          >
            {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* User Info */}
        {sidebarOpen && user && (
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="rounded-full shrink-0"
                  style={{ width: 36, height: 36 }}
                />
              ) : (
                <div
                  className="flex items-center justify-center rounded-full text-xs shrink-0"
                  style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#a78bfa)', color: 'white', fontWeight: 700 }}
                >
                  {(user.firstName?.[0] ?? '').toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.firstName} {user.lastName}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {ROLE_LABELS[role]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/applicant' && item.path !== '/recruiter' && item.path !== '/interviewer' && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 rounded-lg transition-all duration-150"
                style={{
                  padding: sidebarOpen ? '9px 12px' : '9px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(124,58,237,0.15)' : 'transparent',
                  color: isActive ? '#a78bfa' : '#64748b',
                  borderLeft: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                }}
              >
                {item.icon}
                {sidebarOpen && <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{item.label}</span>}
                {sidebarOpen && isActive && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-2 border-t space-y-1" style={{ borderColor: 'rgba(124,58,237,0.1)' }}>
          <SignOutButton redirectUrl="/">
            <button
              className="flex items-center gap-3 rounded-lg w-full transition-all"
              style={{
                padding: sidebarOpen ? '9px 12px' : '9px',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                color: '#64748b',
              }}
            >
              <LogOut size={16} />
              {sidebarOpen && <span style={{ fontSize: 13 }}>Sign out</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#0a0a14' }}>
        {children}
      </main>
    </div>
  );
}
