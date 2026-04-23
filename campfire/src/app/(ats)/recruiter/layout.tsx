'use client';

import { AppShell } from '@/components/ats/layout/AppShell';

export default function RecruiterSegmentLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
