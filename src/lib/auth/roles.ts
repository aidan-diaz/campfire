export const ROLE_STORAGE_KEY = "ats:selectedRole";

export const ROLE_OPTIONS = [
  {
    id: "applicant",
    label: "Applicant",
    description: "Apply to jobs, complete quests, and track your hiring progress.",
  },
  {
    id: "interviewer",
    label: "Interviewer",
    description: "Review candidates, submit scorecards, and collaborate with the hiring team.",
  },
  {
    id: "hiring_manager",
    label: "Hiring Manager",
    description: "Manage job openings, pipeline stages, and hiring outcomes.",
  },
] as const;

export type OnboardingRole = (typeof ROLE_OPTIONS)[number]["id"];

const ROLE_SET = new Set<OnboardingRole>(ROLE_OPTIONS.map((option) => option.id));

export function normalizeOnboardingRole(value: unknown): OnboardingRole | null {
  if (typeof value !== "string") {
    return null;
  }

  return ROLE_SET.has(value as OnboardingRole) ? (value as OnboardingRole) : null;
}
