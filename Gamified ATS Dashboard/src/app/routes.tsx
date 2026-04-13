import { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './components/layout/AppShell';
import Landing from './pages/Landing';
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import ApplicantProfile from './pages/applicant/ApplicantProfile';
import TasksHub from './pages/applicant/TasksHub';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobForm from './pages/recruiter/JobForm';
import RecruiterJobsList from './pages/recruiter/RecruiterJobsList';
import RecruiterKanban from './pages/recruiter/RecruiterKanban';
import RecruiterAnalytics from './pages/recruiter/RecruiterAnalytics';
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import CandidateScorecard from './pages/interviewer/CandidateScorecard';

function WithShell({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  {
    path: '/applicant',
    element: <WithShell><ApplicantDashboard /></WithShell>,
  },
  {
    path: '/applicant/tasks',
    element: <WithShell><TasksHub /></WithShell>,
  },
  {
    path: '/applicant/profile',
    element: <WithShell><ApplicantProfile /></WithShell>,
  },
  {
    path: '/recruiter',
    element: <WithShell><RecruiterDashboard /></WithShell>,
  },
  {
    path: '/recruiter/jobs',
    element: <WithShell><RecruiterJobsList /></WithShell>,
  },
  {
    path: '/recruiter/jobs/new',
    element: <WithShell><JobForm /></WithShell>,
  },
  {
    path: '/recruiter/jobs/:jobId',
    element: <WithShell><RecruiterKanban /></WithShell>,
  },
  {
    path: '/recruiter/analytics',
    element: <WithShell><RecruiterAnalytics /></WithShell>,
  },
  {
    path: '/interviewer',
    element: <WithShell><InterviewerDashboard /></WithShell>,
  },
  {
    path: '/interviewer/candidate/:applicantId/:jobId',
    element: <WithShell><CandidateScorecard /></WithShell>,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);