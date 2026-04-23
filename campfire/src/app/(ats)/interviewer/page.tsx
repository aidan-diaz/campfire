'use client';

import { Suspense } from 'react';
import InterviewerDashboard from '@/components/ats/pages/interviewer/InterviewerDashboard';

export default function InterviewerPage() {
  return (
    <Suspense>
      <InterviewerDashboard />
    </Suspense>
  );
}
