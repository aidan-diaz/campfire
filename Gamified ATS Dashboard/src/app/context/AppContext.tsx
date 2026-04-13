import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  Applicant,
  TeamMember,
  applicants,
  teamMembers,
  jobs,
  Job,
  Application,
  ApplicationStage,
  scorecards,
  ScoreCard,
} from '../data/mockData';

export type Persona = 'applicant' | 'recruiter' | 'interviewer' | null;

interface AppContextType {
  persona: Persona;
  setPersona: (p: Persona) => void;

  currentApplicant: Applicant;
  setCurrentApplicant: (a: Applicant) => void;

  currentTeamMember: TeamMember;
  setCurrentTeamMember: (m: TeamMember) => void;

  allJobs: Job[];
  updateJobApplicants: (jobId: string, applicantId: string, stage: ApplicationStage) => void;

  scorecardsList: ScoreCard[];
  addScorecard: (sc: ScoreCard) => void;

  // For recruiter job form
  createJob: (job: Job) => void;
  updateJob: (job: Job) => void;

  // Applicant: complete a task
  completeTask: (taskId: string, points: number, jobId?: string) => void;

  // Apply to job
  applyToJob: (jobId: string, companyId: string, source: string) => void;

  // Interviewer: advance/reject applicant
  updateApplicationStage: (applicantId: string, applicationId: string, stage: ApplicationStage) => void;

  // All applicants for recruiter view
  allApplicants: Applicant[];
  updateApplicantFeedback: (applicantId: string, applicationId: string, feedback: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>(null);
  const [currentApplicant, setCurrentApplicant] = useState<Applicant>(applicants[0]);
  const [currentTeamMember, setCurrentTeamMember] = useState<TeamMember>(teamMembers[1]); // Marcus (recruiter)
  const [allJobs, setAllJobs] = useState<Job[]>(jobs);
  const [allApplicants, setAllApplicants] = useState<Applicant[]>(applicants);
  const [scorecardsList, setScorecardsList] = useState<ScoreCard[]>(scorecards);

  const updateJobApplicants = (jobId: string, applicantId: string, stage: ApplicationStage) => {
    setAllApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== applicantId) return a;
        return {
          ...a,
          applications: a.applications.map((app) =>
            app.jobId === jobId ? { ...app, stage } : app
          ),
        };
      })
    );
  };

  const addScorecard = (sc: ScoreCard) => {
    setScorecardsList((prev) => [...prev.filter((s) => s.id !== sc.id), sc]);
  };

  const createJob = (job: Job) => {
    setAllJobs((prev) => [...prev, job]);
  };

  const updateJob = (job: Job) => {
    setAllJobs((prev) => prev.map((j) => (j.id === job.id ? job : j)));
  };

  const completeTask = (taskId: string, points: number, jobId?: string) => {
    const dateCompleted = new Date().toISOString().split('T')[0];
    setCurrentApplicant((prev) => {
      const alreadyDone = prev.completedTasks.some((ct) => ct.taskId === taskId);
      if (alreadyDone) return prev;
      const newCompleted = [...prev.completedTasks, { taskId, dateCompleted, pointsEarned: points }];
      const newXP = prev.xp + points;
      const newLevel = computeLevel(newXP);
      return { ...prev, completedTasks: newCompleted, xp: newXP, level: newLevel };
    });
  };

  const applyToJob = (jobId: string, companyId: string, source: string) => {
    setCurrentApplicant((prev) => {
      const alreadyApplied = prev.applications.some((a) => a.jobId === jobId);
      if (alreadyApplied) return prev;
      const newApp: Application = {
        id: `appl-new-${Date.now()}`,
        jobId,
        companyId,
        stage: 'applied',
        dateApplied: new Date().toISOString().split('T')[0],
        completedTasks: [],
        assignedInterviewerIds: [],
        source,
      };
      return { ...prev, applications: [...prev.applications, newApp] };
    });
    setAllJobs((prev) =>
      prev.map((j) =>
        j.id === jobId && !j.applicantIds.includes(currentApplicant.id)
          ? { ...j, applicantIds: [...j.applicantIds, currentApplicant.id] }
          : j
      )
    );
  };

  const updateApplicationStage = (applicantId: string, applicationId: string, stage: ApplicationStage) => {
    setAllApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== applicantId) return a;
        return {
          ...a,
          applications: a.applications.map((app) =>
            app.id === applicationId ? { ...app, stage } : app
          ),
        };
      })
    );
    if (applicantId === currentApplicant.id) {
      setCurrentApplicant((prev) => ({
        ...prev,
        applications: prev.applications.map((app) =>
          app.id === applicationId ? { ...app, stage } : app
        ),
      }));
    }
  };

  const updateApplicantFeedback = (applicantId: string, applicationId: string, feedback: string) => {
    setAllApplicants((prev) =>
      prev.map((a) => {
        if (a.id !== applicantId) return a;
        return {
          ...a,
          applications: a.applications.map((app) =>
            app.id === applicationId ? { ...app, feedbackForApplicant: feedback } : app
          ),
        };
      })
    );
  };

  return (
    <AppContext.Provider
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function computeLevel(xp: number): number {
  const thresholds = [0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 8800, 10200, 11700, 13300, 15000];
  let level = 1;
  for (let i = 0; i < thresholds.length; i++) {
    if (xp >= thresholds[i]) level = i + 1;
    else break;
  }
  return level;
}
