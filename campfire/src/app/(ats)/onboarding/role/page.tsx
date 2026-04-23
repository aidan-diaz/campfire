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
import { Upload, FileText, CheckCircle2, Sword, Crown, Scroll } from "lucide-react";
import { motion } from "motion/react";
import { retro } from "@/lib/animations";

function getRoleFromMetadata(user: ReturnType<typeof useUser>["user"]): OnboardingRole | null {
  if (!user) return null;
  return (
    normalizeOnboardingRole((user.publicMetadata as { role?: unknown } | undefined)?.role) ??
    normalizeOnboardingRole((user.unsafeMetadata as { role?: unknown } | undefined)?.role)
  );
}

const ROLE_ICONS: Record<OnboardingRole, React.ReactNode> = {
  applicant: <Sword size={24} style={{ color: 'var(--color-gold)' }} />,
  hiring_manager: <Crown size={24} style={{ color: 'var(--color-orange)' }} />,
  interviewer: <Scroll size={24} style={{ color: 'var(--foreground)' }} />,
};

const ROLE_CLASS_NAMES: Record<OnboardingRole, string> = {
  applicant: 'ADVENTURER',
  hiring_manager: 'GUILD MASTER',
  interviewer: 'GUIDE',
};

export default function RoleOnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16" style={{ background: 'var(--background)' }}>
          <div className="pixel-border p-6" style={{ background: 'var(--surface)' }}>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>LOADING YOUR ONBOARDING...</p>
          </div>
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
      <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16" style={{ background: 'var(--background)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="pixel-border p-6" style={{ background: 'var(--surface)' }}>
            <p style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)' }}>LOADING YOUR ONBOARDING...</p>
          </div>
          <SignOutButton>
            <button
              type="button"
              className="rpg-button px-4 py-2"
              style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', background: 'var(--surface)', color: 'var(--foreground)', border: '2px solid var(--border)' }}
            >
              SIGN OUT
            </button>
          </SignOutButton>
        </div>
      </main>
    );
  }

  if (step === "resume") {
    return (
      <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12 scanlines" style={{ background: 'var(--background)', position: 'relative' }}>
        {/* Pixel grid */}
        <div className="absolute inset-0 z-0" style={{
          backgroundImage: 'linear-gradient(rgba(252,191,73,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(252,191,73,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={retro.spring}
          className="relative z-10 w-full max-w-lg pixel-border p-6"
          style={{ background: 'var(--surface)' }}
        >
          <h1 style={{ fontSize: 14, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>EQUIP YOUR RESUME</h1>
          <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 12, lineHeight: 1.8 }}>
            ADD YOUR RESUME NOW AND WE&#39;LL ATTACH IT AUTOMATICALLY TO EVERY QUEST APPLICATION.
          </p>

          <div className="mt-6 space-y-4">
            {uploadedFileName ? (
              <div className="pixel-border flex items-center gap-3 p-4" style={{ background: 'var(--surface)', borderColor: '#4caf50' }}>
                <CheckCircle2 size={20} style={{ color: '#4caf50' }} />
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: '#4caf50' }}>► ITEM EQUIPPED</div>
                  <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 4 }}>{uploadedFileName.toUpperCase()}</div>
                </div>
              </div>
            ) : (
              <div className="pixel-border p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: 'var(--color-gold)' }} />
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--foreground)' }}>
                    {resumeFile ? resumeFile.name.toUpperCase() : 'DROP ITEM HERE'}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  title="Upload your resume file"
                  aria-label="Upload your resume file"
                  style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', width: '100%' }}
                />
                {resumeFile && (
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 2 }}
                    transition={retro.snap}
                    type="button"
                    onClick={() => void handleResumeUpload()}
                    disabled={isUploading}
                    className="rpg-button flex items-center gap-2 px-4 py-2 disabled:opacity-40"
                    style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: 'var(--background)', background: 'var(--color-orange)' }}
                  >
                    <Upload size={14} />
                    {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                  </motion.button>
                )}
              </div>
            )}

            {errorMessage && (
              <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--color-flag)' }}>▲ {errorMessage.toUpperCase()}</p>
            )}

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ y: 2 }}
              transition={retro.snap}
              type="button"
              onClick={handleContinueToDashboard}
              className="rpg-button w-full py-3"
              style={{
                fontSize: 10,
                fontFamily: 'var(--font-pixel)',
                color: 'var(--background)',
                background: 'var(--color-orange)',
                boxShadow: '0 0 20px rgba(247,127,0,0.3), 4px 4px 0 rgba(0,0,0,0.3)',
              }}
            >
              {uploadedFileName ? '[ BEGIN ADVENTURE → ]' : '[ SKIP FOR NOW → ]'}
            </motion.button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12 scanlines" style={{ background: 'var(--background)', position: 'relative' }}>
      {/* Pixel grid */}
      <div className="absolute inset-0 z-0" style={{
        backgroundImage: 'linear-gradient(rgba(252,191,73,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(252,191,73,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      {/* Radial glow */}
      <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at center, rgba(252,191,73,0.1) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={retro.spring}
        className="relative z-10 w-full max-w-3xl pixel-border p-6"
        style={{ background: 'var(--surface)' }}
      >
        <h1 style={{ fontSize: 16, fontFamily: 'var(--font-pixel)', color: 'var(--color-gold)', letterSpacing: '0.05em' }}>
          SELECT YOUR CLASS
        </h1>
        <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', marginTop: 12, lineHeight: 1.8 }}>
          PICK YOUR CLASS TO FINISH ACCOUNT SETUP AND BEGIN YOUR ADVENTURE.
        </p>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((role, i) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, boxShadow: '0 0 20px rgba(252,191,73,0.2)' }}
              whileTap={{ y: 2 }}
              transition={{ delay: i * 0.1, ...retro.snap }}
              type="button"
              onClick={() => void handleSelectRole(role.id)}
              disabled={isSaving}
              className="pixel-border p-4 text-left disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: selectedRole === role.id ? 'var(--surface-raised)' : 'var(--surface)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.4)', border: '2px solid var(--border)' }}
                >
                  {ROLE_ICONS[role.id]}
                </div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-pixel)', color: role.id === 'applicant' ? 'var(--color-gold)' : role.id === 'hiring_manager' ? 'var(--color-orange)' : 'var(--foreground)' }}>
                  {ROLE_CLASS_NAMES[role.id]}
                </div>
              </div>
              <div style={{ fontSize: 8, fontFamily: 'var(--font-pixel)', color: 'var(--muted-foreground)', lineHeight: 1.8 }}>{role.description.toUpperCase()}</div>
            </motion.button>
          ))}
        </div>

        {errorMessage ? (
          <p style={{ fontSize: 9, fontFamily: 'var(--font-pixel)', color: 'var(--color-flag)', marginTop: 16 }}>▲ {errorMessage.toUpperCase()}</p>
        ) : null}
      </motion.div>
    </main>
  );
}
