"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { normalizeOnboardingRole } from "@/lib/auth/roles";

/**
 * Sets publicMetadata.role for the current user via Clerk Backend API.
 * publicMetadata is included in Clerk's default session token (as `metadata`),
 * which allows server-side middleware to read the role from session claims.
 */
export async function setRolePublicMetadata(role: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const validated = normalizeOnboardingRole(role);
  if (!validated) {
    throw new Error("Invalid role");
  }

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role: validated },
  });
}
