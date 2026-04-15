import { normalizeOnboardingRole, type OnboardingRole } from "@/lib/auth/roles";

export function readRoleFromClaims(sessionClaims: unknown): OnboardingRole | null {
  if (!sessionClaims || typeof sessionClaims !== "object") {
    return null;
  }

  const claims = sessionClaims as Record<string, unknown>;
  const candidates = [
    claims.role,
    (claims.metadata as { role?: unknown } | undefined)?.role,
    (claims.public_metadata as { role?: unknown } | undefined)?.role,
    (claims.unsafe_metadata as { role?: unknown } | undefined)?.role,
  ];

  for (const candidate of candidates) {
    const role = normalizeOnboardingRole(candidate);
    if (role) {
      return role;
    }
  }

  return null;
}

export function getRoleHomePath(role: OnboardingRole | null | undefined): string {
  switch (role) {
    case "applicant":
      return "/applicant";
    case "interviewer":
      return "/interviewer";
    case "hiring_manager":
      return "/recruiter";
    default:
      return "/applicant";
  }
}

export function getPostAuthPath(role: OnboardingRole | null | undefined): string {
  if (!role) {
    return "/onboarding/role";
  }

  return getRoleHomePath(role);
}
