'use client';

import { AtsProvider } from '@/context/AtsContext';
import { ConvexClientProvider } from '@/components/providers/ConvexClientProvider';

export default function AtsGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexClientProvider>
      <AtsProvider>{children}</AtsProvider>
    </ConvexClientProvider>
  );
}
