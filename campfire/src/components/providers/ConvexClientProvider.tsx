"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { getConvexClient } from "@/lib/convex/client";
import { RoleOnboardingSync } from "@/components/providers/RoleOnboardingSync";

export function ConvexClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProviderWithClerk client={getConvexClient()} useAuth={useAuth}>
      <RoleOnboardingSync />
      {children}
    </ConvexProviderWithClerk>
  );
}
