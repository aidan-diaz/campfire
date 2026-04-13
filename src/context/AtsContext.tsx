'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
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

async function parseJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof (data as { error?: string }).error === 'string' ? (data as { error: string }).error : res.statusText;
    throw new Error(msg || `Request failed (${res.status})`);
  }
  return data;
}

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

  updateApplicationStage: (applicantId: string, applicationId: string, stage: ApplicationStage) => Promise<void>;

  allApplicants: Applicant[];
  updateApplicantFeedback: (applicantId: string, applicationId: string, feedback: string) => Promise<void>;

  atsLoading: boolean;
  atsError: string | null;
  refetchAts: () => Promise<void>;
}

const AtsStateContext = createContext<AtsContextType | null>(null);

export function AtsProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(null);
  const [currentApplicant, setCurrentApplicant] = useState<Applicant>(seedApplicants[0]);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember>(teamMembers[1]);
  const [allJobs, setAllJobs] = useState<Job[]>(seedJobs);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>(seedApplicants);
  const [scorecardsList, setScorecardsList] = useState<ScoreCard[]>(seedScorecards);
  const [atsLoading, setAtsLoading] = useState(true);
  const [atsError, setAtsError] = useState<string | null>(null);

  const refetchAts = useCallback(async () => {
    const res = await fetch('/api/ats/state', { credentials: 'include' });
    const data = await parseJson(res) as {
      jobs: Job[];
      applicants: Applicant[];
      scorecards: ScoreCard[];
    };
    setAllJobs(data.jobs);
    setAllApplicants(data.applicants);
    setScorecardsList(data.scorecards);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setAtsError(null);
        await refetchAts();
      } catch (e) {
        if (!cancelled) {
          setAtsError(e instanceof Error ? e.message : 'Failed to load ATS data');
        }
      } finally {
        if (!cancelled) setAtsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refetchAts]);

  useEffect(() => {
    if (allApplicants.length === 0) return;
    setCurrentApplicant((prev) => allApplicants.find((a) => a.id === prev.id) ?? allApplicants[0]);
  }, [allApplicants]);

  const updateApplicationStage = async (
    applicantId: string,
    applicationId: string,
    stage: ApplicationStage,
  ) => {
    const res = await fetch(`/api/ats/applicants/${applicantId}/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ stage }),
    });
    await parseJson(res);
    await refetchAts();
  };

  const updateJobApplicants = async (jobId: string, applicantId: string, stage: ApplicationStage) => {
    const applicant = allApplicants.find((a) => a.id === applicantId);
    const application = applicant?.applications.find((app) => app.jobId === jobId);
    if (!application) return;
    await updateApplicationStage(applicantId, application.id, stage);
  };

  const addScorecard = async (sc: ScoreCard) => {
    const res = await fetch('/api/ats/scorecards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sc),
    });
    await parseJson(res);
    await refetchAts();
  };

  const createJob = async (job: Job) => {
    const res = await fetch('/api/ats/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(job),
    });
    await parseJson(res);
    await refetchAts();
  };

  const updateJob = async (job: Job) => {
    const res = await fetch(`/api/ats/jobs/${job.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(job),
    });
    await parseJson(res);
    await refetchAts();
  };

  const completeTask = async (taskId: string, points: number, jobId?: string) => {
    const res = await fetch(`/api/ats/applicants/${currentApplicant.id}/complete-task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ taskId, points, jobId }),
    });
    await parseJson(res);
    await refetchAts();
  };

  const applyToJob = async (jobId: string, companyId: string, source: string) => {
    const res = await fetch(`/api/ats/applicants/${currentApplicant.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ jobId, companyId, source }),
    });
    await parseJson(res);
    await refetchAts();
  };

  const updateApplicantFeedback = async (
    applicantId: string,
    applicationId: string,
    feedback: string,
  ) => {
    const res = await fetch(`/api/ats/applicants/${applicantId}/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ feedbackForApplicant: feedback }),
    });
    await parseJson(res);
    await refetchAts();
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
        updateApplicationStage,
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
