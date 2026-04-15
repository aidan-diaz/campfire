'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import {
  Applicant,
  TeamMember,
  applicants as seedApplicants,
  teamMembers,
  jobs as seedJobs,
  scorecards as seedScorecards,
  Job,
  ApplicationStage,
  ScoreCard,
} from '@/data/ats/mockData';

export type Persona = 'applicant' | 'recruiter' | 'interviewer' | null;

interface AtsContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;

  currentApplicant: Applicant;
  setCurrentApplicant: (a: Applicant) => void;

  currentTeamMember: TeamMember;
  setCurrentTeamMember: (m: TeamMember) => void;

  allJobs: Job[];
  updateJobApplicants: (jobId: string, applicantId: string, stage: ApplicationStage) => Promise<void>;

  scorecardsList: ScoreCard[];
  addScorecard: (sc: ScoreCard) => Promise<void>;

  createJob: (job: Job) => Promise<void>;
  updateJob: (job: Job) => Promise<void>;

  completeTask: (taskId: string, points: number, jobId?: string) => Promise<void>;

  applyToJob: (jobId: string, companyId: string, source: string) => Promise<void>;
  uploadApplicantResume: (file: File) => Promise<void>;

  updateApplicationStage: (applicantId: string, applicationId: string, stage: ApplicationStage) => Promise<void>;
  assignInterviewerToApplication: (
    applicantId: string,
    applicationId: string,
    interviewerId: string,
    assigned: boolean,
  ) => Promise<void>;

  allApplicants: Applicant[];
  updateApplicantFeedback: (applicantId: string, applicationId: string, feedback: string) => Promise<void>;

  atsLoading: boolean;
  atsError: string | null;
  refetchAts: () => Promise<void>;
}

const AtsStateContext = createContext<AtsContextType | null>(null);

export function AtsProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(null);
  const [currentApplicantId, setCurrentApplicantId] = useState<string>(seedApplicants[0].id);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember>(teamMembers[1]);
  const [atsError, setAtsError] = useState<string | null>(null);
  const hasAttemptedSeedRef = useRef(false);

  const atsState = useQuery(api.ats.getAtsState, {});
  const authUser = useQuery(api.users.getCurrentUser, {});
  const authUserResume = useQuery(api.users.getCurrentUserResume, {});
  const seedAtsData = useMutation(api.seed.seedAtsData);
  const createJobMutation = useMutation(api.ats.createJob);
  const updateJobMutation = useMutation(api.ats.updateJob);
  const addScorecardMutation = useMutation(api.ats.addScorecard);
  const applyToJobMutation = useMutation(api.ats.applyToJob);
  const updateApplicationMutation = useMutation(api.ats.updateApplication);
  const assignInterviewerMutation = useMutation(api.ats.assignInterviewer);
  const completeTaskMutation = useMutation(api.ats.completeTask);
  const createResumeUploadUrlMutation = useMutation(api.ats.createResumeUploadUrl);
  const saveApplicantResumeMutation = useMutation(api.ats.saveApplicantResume);

  const isSeedRecord = (clerkUserId: string | undefined) => !!clerkUserId && clerkUserId.startsWith('seed:');
  const isRealSignedInUser = !!authUser && !isSeedRecord(authUser.clerkUserId);
  const shouldUseSeedFallback = !isRealSignedInUser;

  const allJobs = atsState?.jobs ?? (shouldUseSeedFallback ? seedJobs : []);
  const allApplicants = atsState?.applicants ?? (shouldUseSeedFallback ? seedApplicants : []);
  const scorecardsList = atsState?.scorecards ?? (shouldUseSeedFallback ? seedScorecards : []);
  const atsLoading = atsState === undefined;

  const currentApplicant = useMemo(() => {
    const authApplicantId =
      isRealSignedInUser && authUser?.role === 'applicant' ? authUser.clerkUserId : undefined;
    const matched =
      (authApplicantId ? allApplicants.find((a) => a.id === authApplicantId) : undefined) ??
      allApplicants.find((a) => a.id === currentApplicantId) ??
      allApplicants[0];
    if (matched) {
      if (authApplicantId && authUserResume?.resumeUrl && !matched.resumeUrl) {
        return {
          ...matched,
          resumeUrl: authUserResume.resumeUrl,
          resumeFileName: authUserResume.resumeFileName ?? undefined,
          resumeUploadedAt:
            typeof authUserResume.resumeUploadedAt === 'number'
              ? new Date(authUserResume.resumeUploadedAt).toISOString().split('T')[0]
              : matched.resumeUploadedAt,
        } satisfies Applicant;
      }
      return matched;
    }

    if (authApplicantId && authUser) {
      const firstName = authUser.firstName ?? 'Applicant';
      const lastName = authUser.lastName ?? '';
      const avatar = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'U';
      return {
        id: authApplicantId,
        firstName,
        lastName,
        email: authUser.email,
        jobGoal: 'Find a role aligned to my strengths.',
        level: 1,
        xp: 0,
        xpToNextLevel: 300,
        completedTasks: [],
        applications: [],
        skills: [],
        location: 'Remote',
        experience: 0,
        resumeSnippet: '',
        resumeFileName: authUserResume?.resumeFileName ?? undefined,
        resumeUrl: authUserResume?.resumeUrl ?? undefined,
        resumeUploadedAt:
          typeof authUserResume?.resumeUploadedAt === 'number'
            ? new Date(authUserResume.resumeUploadedAt).toISOString().split('T')[0]
            : undefined,
        avatar,
      } satisfies Applicant;
    }

    return seedApplicants[0];
  }, [allApplicants, authUser, authUserResume, currentApplicantId, isRealSignedInUser]);

  const setCurrentApplicant = useCallback((applicant: Applicant) => {
    setCurrentApplicantId(applicant.id);
  }, []);

  // Sync applicant ID for authenticated applicants
  useEffect(() => {
    if (!authUser || authUser.role !== 'applicant' || isSeedRecord(authUser.clerkUserId)) return;
    setCurrentApplicantId(authUser.clerkUserId);
  }, [authUser]);

  // Sync team member for authenticated non-applicant roles
  useEffect(() => {
    if (!authUser || isSeedRecord(authUser.clerkUserId)) return;
    if (authUser.role === 'applicant') return;

    const firstName = authUser.firstName ?? 'Team';
    const lastName = authUser.lastName ?? 'Member';
    const avatar = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'TM';
    const sanitizedCompany = (authUser.companyName ?? 'my-company')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 20);
    const companyId = sanitizedCompany || 'my-company';

    setCurrentTeamMember({
      id: authUser.clerkUserId,
      firstName,
      lastName,
      email: authUser.email,
      team: authUser.role === 'hiring_manager' ? 'Leadership' : 'Interview Team',
      role: authUser.role === 'hiring_manager' ? 'hiring_manager' : 'team_member',
      companyId,
      avatar,
      guideArchetype: authUser.role === 'hiring_manager' ? 'The Keeper' : 'The Scout',
    });
  }, [authUser]);

  // Seed data only for non-authenticated users
  useEffect(() => {
    if (atsState === undefined || hasAttemptedSeedRef.current || !shouldUseSeedFallback) return;
    if (atsState.jobs.length > 0 || atsState.applicants.length > 0) return;

    hasAttemptedSeedRef.current = true;
    void (async () => {
      try {
        setAtsError(null);
        await seedAtsData({});
      } catch (error) {
        setAtsError(error instanceof Error ? error.message : 'Failed to seed ATS data');
      }
    })();
  }, [atsState, seedAtsData, shouldUseSeedFallback]);

  const refetchAts = useCallback(async () => {}, []);

  const updateApplicationStage = async (
    applicantId: string,
    applicationId: string,
    stage: ApplicationStage,
  ) => {
    setAtsError(null);
    try {
      await updateApplicationMutation({ applicantId, applicationId, stage });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update application stage';
      setAtsError(message);
      throw error;
    }
  };

  const updateJobApplicants = async (jobId: string, applicantId: string, stage: ApplicationStage) => {
    const applicant = allApplicants.find((a) => a.id === applicantId);
    const application = applicant?.applications.find((app) => app.jobId === jobId);
    if (!application) return;
    await updateApplicationStage(applicantId, application.id, stage);
  };

  const addScorecard = async (sc: ScoreCard) => {
    setAtsError(null);
    try {
      await addScorecardMutation({ scorecard: sc });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add scorecard';
      setAtsError(message);
      throw error;
    }
  };

  const createJob = async (job: Job) => {
    setAtsError(null);
    try {
      await createJobMutation({ job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create job';
      setAtsError(message);
      throw error;
    }
  };

  const updateJob = async (job: Job) => {
    setAtsError(null);
    try {
      await updateJobMutation({ job });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update job';
      setAtsError(message);
      throw error;
    }
  };

  const completeTask = async (taskId: string, points: number, jobId?: string) => {
    setAtsError(null);
    try {
      await completeTaskMutation({
        applicantId: currentApplicant.id,
        taskId,
        points,
        ...(jobId ? { jobId } : {}),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to complete task';
      setAtsError(message);
      throw error;
    }
  };

  const applyToJob = async (jobId: string, companyId: string, source: string) => {
    setAtsError(null);
    try {
      await applyToJobMutation({
        applicantId: currentApplicant.id,
        jobId,
        companyId,
        source,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to apply to job';
      setAtsError(message);
      throw error;
    }
  };

  const uploadApplicantResume = async (file: File) => {
    setAtsError(null);
    try {
      const uploadUrl = await createResumeUploadUrlMutation({});
      const uploadResult = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!uploadResult.ok) throw new Error('Upload failed');

      const { storageId } = (await uploadResult.json()) as { storageId?: string };
      if (!storageId) throw new Error('Missing storage ID from upload response');

      await saveApplicantResumeMutation({
        applicantId: currentApplicant.id,
        storageId: storageId as Id<'_storage'>,
        fileName: file.name,
        contentType: file.type || undefined,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload resume';
      setAtsError(message);
      throw error;
    }
  };

  const updateApplicantFeedback = async (
    applicantId: string,
    applicationId: string,
    feedback: string,
  ) => {
    setAtsError(null);
    try {
      await updateApplicationMutation({ applicantId, applicationId, feedbackForApplicant: feedback });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update applicant feedback';
      setAtsError(message);
      throw error;
    }
  };

  const assignInterviewerToApplication = async (
    applicantId: string,
    applicationId: string,
    interviewerId: string,
    assigned: boolean,
  ) => {
    setAtsError(null);
    try {
      await assignInterviewerMutation({ applicantId, applicationId, interviewerId, assigned });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update interviewer assignment';
      setAtsError(message);
      throw error;
    }
  };

  return (
    <AtsStateContext.Provider
      value={{
        persona,
        setPersona,
        currentApplicant,
        setCurrentApplicant,
        currentTeamMember,
        setCurrentTeamMember,
        allJobs,
        updateJobApplicants,
        scorecardsList,
        addScorecard,
        createJob,
        updateJob,
        completeTask,
        applyToJob,
        uploadApplicantResume,
        updateApplicationStage,
        assignInterviewerToApplication,
        allApplicants,
        updateApplicantFeedback,
        atsLoading,
        atsError,
        refetchAts,
      }}
    >
      {children}
    </AtsStateContext.Provider>
  );
}

export function useAts() {
  const ctx = useContext(AtsStateContext);
  if (!ctx) throw new Error('useAts must be used within AtsProvider');
  return ctx;
}
