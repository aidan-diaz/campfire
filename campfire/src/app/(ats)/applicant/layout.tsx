'use client';

import { AppShell } from '@/components/ats/layout/AppShell';

export default function ApplicantSegmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
