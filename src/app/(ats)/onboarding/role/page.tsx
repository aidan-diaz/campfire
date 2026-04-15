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
import { Upload, FileText, CheckCircle2 } from "lucide-react";

function getRoleFromMetadata(user: ReturnType<typeof useUser>["user"]): OnboardingRole | null {
  if (!user) return null;
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
  const createResumeUploadUrl = useMutation(api.users.createResumeUploadUrl);
  const saveResume = useMutation(api.users.saveCurrentUserResume);
  const existingUser = useQuery(api.users.getCurrentUser, isLoaded && isSignedIn ? {} : "skip");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"role" | "resume">("role");
  const [selectedRole, setSelectedRole] = useState<OnboardingRole | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const existingRole = useMemo(() => getRoleFromMetadata(user) ?? existingUser?.role ?? null, [existingUser?.role, user]);
  const clerkRole = useMemo(() => getRoleFromMetadata(user), [user]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (isNewSignUp) return;
    if (clerkRole) {
      router.replace(getRoleHomePath(clerkRole));
      return;
    }
    if (existingUser !== undefined && existingRole) {
      router.replace(getRoleHomePath(existingRole));
    }
  }, [clerkRole, existingRole, existingUser, isLoaded, isNewSignUp, isSignedIn, router]);

  const handleSelectRole = async (role: OnboardingRole) => {
    if (!user || isSaving) return;

    setSelectedRole(role);
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await Promise.all([
        user.update({ unsafeMetadata: { ...(user.unsafeMetadata ?? {}), role } }),
        setRolePublicMetadata(role),
      ]);

      await syncCurrentUser({
        role,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
        avatar: user.imageUrl ?? undefined,
        onboardingCompleted: true,
      });

      if (role === "applicant") {
        setStep("resume");
        setIsSaving(false);
      } else {
        router.replace(getRoleHomePath(role));
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to save your role. Please try again.");
      setIsSaving(false);
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const uploadUrl = await createResumeUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": resumeFile.type || "application/octet-stream" },
        body: resumeFile,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = (await res.json()) as { storageId?: string };
      if (!storageId) throw new Error("Missing storage ID");

      await saveResume({
        storageId: storageId as any,
        fileName: resumeFile.name,
        contentType: resumeFile.type || undefined,
      });

      setUploadedFileName(resumeFile.name);
      setResumeFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleContinueToDashboard = () => {
    router.replace(getRoleHomePath("applicant"));
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

  if (step === "resume") {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12" style={{ background: '#0a0a14' }}>
        <div className="w-full max-w-lg rounded-2xl border p-6" style={{ borderColor: 'rgba(124,58,237,0.2)', background: '#0f0f1e' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>Upload your resume</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8 }}>
            Add your resume now and we&#39;ll attach it automatically to every job application.
          </p>

          <div className="mt-6 space-y-4">
            {uploadedFileName ? (
              <div className="flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.08)' }}>
                <CheckCircle2 size={20} style={{ color: '#10b981' }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>Resume uploaded</div>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{uploadedFileName}</div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'rgba(124,58,237,0.15)', background: 'rgba(124,58,237,0.05)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: '#a78bfa' }} />
                  <span style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600 }}>
                    {resumeFile ? resumeFile.name : 'Choose a file'}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  style={{ fontSize: 12, color: '#94a3b8', width: '100%' }}
                />
                {resumeFile && (
                  <button
                    type="button"
                    onClick={() => void handleResumeUpload()}
                    disabled={isUploading}
                    className="flex items-center gap-2 rounded-lg px-4 py-2 transition-all hover:opacity-90 disabled:opacity-40"
                    style={{ fontSize: 13, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}
                  >
                    <Upload size={14} />
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                )}
              </div>
            )}

            {errorMessage && (
              <p style={{ fontSize: 13, color: '#ef4444' }}>{errorMessage}</p>
            )}

            <button
              type="button"
              onClick={handleContinueToDashboard}
              className="w-full rounded-xl py-3 transition-all hover:opacity-90"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'white',
                background: 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                boxShadow: '0 0 20px rgba(124,58,237,0.3)',
              }}
            >
              {uploadedFileName ? 'Continue to Dashboard' : 'Skip for Now'}
            </button>
          </div>
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
