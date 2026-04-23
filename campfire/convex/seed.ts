import { mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  allTasks,
  applicants,
  jobs,
  scorecards,
  teamMembers,
} from "../src/data/ats/mockData";

const TEAM_MEMBER_ROLE_TO_USER_ROLE = {
  hiring_manager: "hiring_manager",
  recruiter: "interviewer",
  team_member: "interviewer",
} as const;

function toTimestamp(date: string | undefined, fallback: number): number {
  if (!date) {
    return fallback;
  }

  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function buildApplicationKey(applicantId: string, jobId: string): string {
  return `${applicantId}:${jobId}`;
}

export const seedAtsData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingUsers = await ctx.db.query("users").take(1);
    if (existingUsers.length > 0) {
      return {
        seeded: false,
        reason: "users table already has data",
      };
    }

    const now = Date.now();
    const userIdByMockId = new Map<string, Id<"users">>();
    const jobIdByMockId = new Map<string, Id<"jobs">>();
    const applicationIdByMockId = new Map<string, Id<"applications">>();
    const applicationIdByApplicantAndJob = new Map<string, Id<"applications">>();

    for (const member of teamMembers) {
      const userRole = TEAM_MEMBER_ROLE_TO_USER_ROLE[member.role];
      const userId = await ctx.db.insert("users", {
        clerkUserId: `seed:team_member:${member.id}`,
        role: userRole,
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        avatar: member.avatar,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      });
      userIdByMockId.set(member.id, userId);
    }

    for (const applicant of applicants) {
      const userId = await ctx.db.insert("users", {
        clerkUserId: `seed:applicant:${applicant.id}`,
        role: "applicant",
        email: applicant.email,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        avatar: applicant.avatar,
        onboardingCompleted: true,
        xpSummary: {
          totalXp: applicant.xp,
          level: applicant.level,
          badges: [],
        },
        createdAt: now,
        updatedAt: now,
      });
      userIdByMockId.set(applicant.id, userId);
    }

    for (const job of jobs) {
      const hiringManagerUserId = userIdByMockId.get(job.hiringManagerId);
      if (!hiringManagerUserId) {
        throw new Error(`Missing hiring manager user for ${job.id}`);
      }

      const hiringTeamUserIds = job.teamMemberIds
        .map((teamMemberId) => userIdByMockId.get(teamMemberId))
        .filter((id): id is Id<"users"> => id !== undefined);

      const jobId = await ctx.db.insert("jobs", {
        companyId: job.companyId,
        title: job.title,
        description: job.overview,
        status: job.status,
        hiringManagerUserId,
        hiringTeamUserIds,
        stageConfig: job.stages,
        metadata: {
          seedId: job.id,
          team: job.team,
          responsibilities: job.responsibilities,
          qualifications: job.qualifications,
          workEnvironment: job.workEnvironment,
          applicationProcess: job.applicationProcess,
          postedDate: job.postedDate,
          applicantIds: job.applicantIds,
          requiredTaskIds: job.requiredTaskIds,
        },
        createdAt: toTimestamp(job.postedDate, now),
        updatedAt: now,
      });
      jobIdByMockId.set(job.id, jobId);
    }

    for (const applicant of applicants) {
      const applicantUserId = userIdByMockId.get(applicant.id);
      if (!applicantUserId) {
        throw new Error(`Missing applicant user for ${applicant.id}`);
      }

      for (const application of applicant.applications) {
        const jobId = jobIdByMockId.get(application.jobId);
        if (!jobId) {
          throw new Error(`Missing job for application ${application.id}`);
        }

        const applicationId = await ctx.db.insert("applications", {
          applicantUserId,
          jobId,
          stage: application.stage,
          status: application.stage,
          timeline: {
            dateApplied: application.dateApplied,
            dateScreened: application.dateScreened,
            dateInterviewed: application.dateInterviewed,
            dateOffered: application.dateOffered,
            dateHired: application.dateHired,
            dateRejected: application.dateRejected,
          },
          source: application.source,
          publicFeedback: application.feedbackForApplicant,
          metadata: {
            seedId: application.id,
            companyId: application.companyId,
            assignedInterviewerIds: application.assignedInterviewerIds,
            completedTasks: application.completedTasks,
          },
          createdAt: toTimestamp(application.dateApplied, now),
          updatedAt: now,
        });

        applicationIdByMockId.set(application.id, applicationId);
        applicationIdByApplicantAndJob.set(
          buildApplicationKey(applicant.id, application.jobId),
          applicationId,
        );
      }
    }

    for (const task of allTasks) {
      await ctx.db.insert("tasks", {
        name: task.name,
        description: task.description,
        scope: task.type,
        companyId: task.companyId,
        points: task.points,
        metadata: {
          seedId: task.id,
          why: task.why,
          difficulty: task.difficulty,
          estimatedTime: task.estimatedTime,
          skills: task.skills,
          questLabel: task.questLabel,
          jobId: task.jobId,
        },
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    for (const scorecard of scorecards) {
      const applicationId = applicationIdByApplicantAndJob.get(
        buildApplicationKey(scorecard.applicantId, scorecard.jobId),
      );
      if (!applicationId) {
        continue;
      }

      const interviewerUserId = userIdByMockId.get(scorecard.interviewerId);
      if (!interviewerUserId) {
        continue;
      }

      await ctx.db.insert("scorecards", {
        applicationId,
        interviewerUserId,
        recommendation: scorecard.recommendation,
        structuredFeedback: {
          stageId: scorecard.stageId,
          scores: scorecard.scores,
          feedbackForApplicant: scorecard.feedbackForApplicant,
          feedbackForRecruiter: scorecard.feedbackForRecruiter,
        },
        notes: scorecard.feedbackForRecruiter,
        submittedAt: toTimestamp(scorecard.completedAt, now),
        updatedAt: now,
      });
    }

    for (const applicant of applicants) {
      const applicantUserId = userIdByMockId.get(applicant.id);
      if (!applicantUserId) {
        continue;
      }

      for (const completion of applicant.completedTasks) {
        const linkedApplication = applicant.applications.find((application) =>
          application.completedTasks.some((task) => task.taskId === completion.taskId),
        );

        const applicationId = linkedApplication
          ? applicationIdByMockId.get(linkedApplication.id)
          : undefined;

        await ctx.db.insert("gamificationEvents", {
          userId: applicantUserId,
          applicationId,
          type: "seed.task.completed",
          pointsDelta: completion.pointsEarned,
          metadata: {
            taskId: completion.taskId,
            source: "mockData",
          },
          createdAt: toTimestamp(completion.dateCompleted, now),
        });
      }
    }

    return {
      seeded: true,
      counts: {
        users: userIdByMockId.size,
        jobs: jobIdByMockId.size,
        applications: applicationIdByMockId.size,
        tasks: allTasks.length,
        scorecards: scorecards.length,
        gamificationEvents: applicants.reduce(
          (total, applicant) => total + applicant.completedTasks.length,
          0,
        ),
      },
    };
  },
});

