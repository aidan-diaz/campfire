'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

  const allJobs = atsState?.jobs ?? seedJobs;
  const allApplicants = atsState?.applicants ?? seedApplicants;
  const scorecardsList = atsState?.scorecards ?? seedScorecards;
  const atsLoading = atsState === undefined;
  const currentApplicant =
    allApplicants.find((applicant) => applicant.id === currentApplicantId) ??
    allApplicants[0] ??
    seedApplicants[0];
  const setCurrentApplicant = useCallback((applicant: Applicant) => {
    setCurrentApplicantId(applicant.id);
  }, []);

  useEffect(() => {
    if (atsState === undefined || hasAttemptedSeedRef.current) {
      return;
    }

    if (atsState.jobs.length > 0 || atsState.applicants.length > 0) {
      return;
    }

    hasAttemptedSeedRef.current = true;
    void (async () => {
      try {
        setAtsError(null);
        await seedAtsData({});
      } catch (error) {
        setAtsError(error instanceof Error ? error.message : 'Failed to seed ATS data');
      }
    })();
  }, [atsState, seedAtsData]);

  const refetchAts = useCallback(async () => {
    // Convex queries are realtime; no explicit fetch is required.
  }, []);

  const updateApplicationStage = async (
    applicantId: string,
    applicationId: string,
    stage: ApplicationStage,
  ) => {
    setAtsError(null);
    try {
      await updateApplicationMutation({
        applicantId,
        applicationId,
        stage,
      });
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
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      });
      if (!uploadResult.ok) {
        throw new Error('Upload failed');
      }

      const { storageId } = (await uploadResult.json()) as { storageId?: string };
      if (!storageId) {
        throw new Error('Missing storage ID from upload response');
      }

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
      await updateApplicationMutation({
        applicantId,
        applicationId,
        feedbackForApplicant: feedback,
      });
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
      await assignInterviewerMutation({
        applicantId,
        applicationId,
        interviewerId,
        assigned,
      });
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
