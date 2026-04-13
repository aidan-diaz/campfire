'use client';

import { AtsProvider } from '@/context/AtsContext';

export default function AtsGroupLayout({ children }: { children: React.ReactNode }) {
  return <AtsProvider>{children}</AtsProvider>;
}
