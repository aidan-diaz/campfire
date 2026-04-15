"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import {
  normalizeOnboardingRole,
  ROLE_OPTIONS,
  type OnboardingRole,
} from "@/lib/auth/roles";
import { getRoleHomePath } from "@/lib/auth/redirects";
import { setRolePublicMetadata } from "@/lib/auth/actions";

function getRoleFromMetadata(user: ReturnType<typeof useUser>["user"]): OnboardingRole | null {
  if (!user) {
    return null;
  }

  return (
    normalizeOnboardingRole((user.publicMetadata as { role?: unknown } | undefined)?.role) ??
    normalizeOnboardingRole((user.unsafeMetadata as { role?: unknown } | undefined)?.role)
  );
}

export default function RoleOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your onboarding...</p>
        </main>
      }
    >
      <RoleOnboardingInner />
    </Suspense>
  );
}

function RoleOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewSignUp = searchParams.get("new") === "1";
  const { isLoaded, isSignedIn, user } = useUser();
  const syncCurrentUser = useMutation(api.users.syncCurrentUser);
  const existingUser = useQuery(api.users.getCurrentUser, isLoaded && isSignedIn ? {} : "skip");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const existingRole = useMemo(() => getRoleFromMetadata(user) ?? existingUser?.role ?? null, [existingUser?.role, user]);

  const clerkRole = useMemo(() => getRoleFromMetadata(user), [user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    // Fresh sign-ups always see the role picker — never auto-redirect.
    if (isNewSignUp) {
      return;
    }

    // Returning sign-ins: redirect immediately if role is already set.
    if (clerkRole) {
      router.replace(getRoleHomePath(clerkRole));
      return;
    }

    if (existingUser !== undefined && existingRole) {
      router.replace(getRoleHomePath(existingRole));
    }
  }, [clerkRole, existingRole, existingUser, isLoaded, isNewSignUp, isSignedIn, router]);

  const handleSelectRole = async (role: OnboardingRole) => {
    if (!user || isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await Promise.all([
        user.update({
          unsafeMetadata: {
            ...(user.unsafeMetadata ?? {}),
            role,
          },
        }),
        setRolePublicMetadata(role),
      ]);

      await syncCurrentUser({
        role,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        avatar: user.imageUrl ?? undefined,
        onboardingCompleted: true,
      });

      router.replace(getRoleHomePath(role));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save your role. Please try again.");
      setIsSaving(false);
    }
  };

  if (!isLoaded || !isSignedIn || clerkRole || (existingUser === undefined && !clerkRole) || existingRole) {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16 dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading your onboarding...</p>
          <SignOutButton>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sign out
            </button>
          </SignOutButton>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Choose your role
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pick your role to finish account setup and open your dashboard.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => void handleSelectRole(role.id)}
              disabled={isSaving}
              className="rounded-xl border border-zinc-200 p-4 text-left transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            >
              <div className="text-base font-medium text-zinc-900 dark:text-zinc-100">{role.label}</div>
              <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{role.description}</div>
            </button>
          ))}
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        ) : null}
      </div>
    </main>
  );
}
