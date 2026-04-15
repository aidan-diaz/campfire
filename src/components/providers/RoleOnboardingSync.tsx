"use client";

import { useEffect, useMemo, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  normalizeOnboardingRole,
  ROLE_STORAGE_KEY,
  type OnboardingRole,
} from "@/lib/auth/roles";
import { setRolePublicMetadata } from "@/lib/auth/actions";

function getRoleFromClerkMetadata(user: ReturnType<typeof useUser>["user"]): OnboardingRole | null {
  if (!user) {
    return null;
  }

  return (
    normalizeOnboardingRole((user.publicMetadata as { role?: unknown })?.role) ??
    normalizeOnboardingRole((user.unsafeMetadata as { role?: unknown })?.role)
  );
}

export function RoleOnboardingSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const existingUser = useQuery(api.users.getCurrentUser, isLoaded && isSignedIn ? {} : "skip");
  const inFlightSignature = useRef<string | null>(null);

  const roleFromStorage = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return normalizeOnboardingRole(localStorage.getItem(ROLE_STORAGE_KEY));
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || existingUser === undefined) {
      return;
    }

    const metadataRole = getRoleFromClerkMetadata(user);
    const selectedRole = metadataRole ?? roleFromStorage ?? existingUser?.role ?? null;
    const firstName = user.firstName ?? undefined;
    const lastName = user.lastName ?? undefined;
    const avatar = user.imageUrl ?? undefined;

    const signature = JSON.stringify({
      userId: user.id,
      selectedRole,
      firstName,
      lastName,
      avatar,
      existingRole: existingUser?.role ?? null,
      existingEmail: existingUser?.email ?? null,
      existingFirstName: existingUser?.firstName ?? null,
      existingLastName: existingUser?.lastName ?? null,
      existingAvatar: existingUser?.avatar ?? null,
      existingOnboardingCompleted: existingUser?.onboardingCompleted ?? null,
      metadataRole,
    });

    if (!selectedRole) {
      return;
    }

    if (inFlightSignature.current === signature) {
      return;
    }

    const needsSync =
      !existingUser ||
      existingUser.role !== selectedRole ||
      existingUser.firstName !== firstName ||
      existingUser.lastName !== lastName ||
      existingUser.avatar !== avatar ||
      !existingUser.onboardingCompleted;

    const needsMetadataUpdate =
      !metadataRole && !!selectedRole && (selectedRole === roleFromStorage || selectedRole === existingUser?.role);

    if (!needsSync && !needsMetadataUpdate) {
      if (roleFromStorage && typeof window !== "undefined") {
        localStorage.removeItem(ROLE_STORAGE_KEY);
      }
      return;
    }

    inFlightSignature.current = signature;

    void (async () => {
      try {
        if (needsMetadataUpdate) {
          await Promise.all([
            user.update({
              unsafeMetadata: {
                ...(user.unsafeMetadata ?? {}),
                role: selectedRole,
              },
            }),
            setRolePublicMetadata(selectedRole),
          ]);
        }

        await syncCurrentUser({
          role: selectedRole,
          firstName,
          lastName,
          avatar,
          onboardingCompleted: true,
        });

        if (typeof window !== "undefined") {
          localStorage.removeItem(ROLE_STORAGE_KEY);
        }
      } catch (error) {
        console.error("Failed to sync role onboarding profile", error);
        inFlightSignature.current = null;
      }
    })();
  }, [existingUser, isLoaded, isSignedIn, roleFromStorage, syncCurrentUser, user]);

  return null;
}
