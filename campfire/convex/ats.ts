import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type {
  Applicant,
  Application,
  ApplicationStage,
  CompletedTask,
  Job,
  ScoreCard,
} from "../src/data/ats/mockData";
import {
  applicants as seedApplicants,
  jobs as seedJobs,
  scorecards as seedScorecards,
} from "../src/data/ats/mockData";

const STAGES: ApplicationStage[] = [
  "applied",
  "screening",
  "interview",
  "final_round",
  "offered",
  "hired",
  "rejected",
];

const stageValidator = v.union(
  v.literal("applied"),
  v.literal("screening"),
  v.literal("interview"),
  v.literal("final_round"),
  v.literal("offered"),
  v.literal("hired"),
  v.literal("rejected"),
);

const recommendationValidator = v.union(
  v.literal("advance"),
  v.literal("reject"),
  v.literal("hold"),
);

const XP_THRESHOLDS = [
  0, 300, 700, 1200, 1800, 2500, 3300, 4200, 5200, 6300, 7500, 8800, 10200, 11700, 13300, 15000,
];

function computeLevel(totalXp: number): number {
  let level = 1;
  for (let i = 1; i < XP_THRESHOLDS.length; i += 1) {
    if (totalXp >= XP_THRESHOLDS[i]) {
      level = i;
    }
  }
  return level;
}

function getNextLevelThreshold(level: number): number {
  return XP_THRESHOLDS[level + 1] ?? XP_THRESHOLDS[XP_THRESHOLDS.length - 1];
}

function toDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

function parseDateToTimestamp(date: string | undefined, fallback: number): number {
  if (!date) return fallback;
  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getSeedIdFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const seedId = (metadata as { seedId?: unknown }).seedId;
  return typeof seedId === "string" ? seedId : null;
}

function seedIdFromClerkUserId(clerkUserId: string, prefix: "seed:applicant:" | "seed:team_member:") {
  return clerkUserId.startsWith(prefix) ? clerkUserId.slice(prefix.length) : null;
}

function toAvatar(firstName?: string, lastName?: string): string {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

async function getUsersBySeedIds(ctx: MutationCtx, ids: string[], seedPrefix: "seed:applicant:" | "seed:team_member:") {
  const entries = await Promise.all(
    ids.map(async (id) => {
      const user = await ctx.db
        .query("users")
        .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", `${seedPrefix}${id}`))
        .unique();
      return [id, user] as const;
    }),
  );
  return new Map(entries.filter((entry): entry is [string, Doc<"users">] => entry[1] !== null));
}

async function resolveApplicantUser(ctx: MutationCtx, applicantId: string): Promise<Doc<"users">> {
  const seeded = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", `seed:applicant:${applicantId}`))
    .unique();
  if (seeded) return seeded;

  const direct = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", applicantId))
    .unique();
  if (direct) return direct;

  throw new Error(`Applicant not found for id ${applicantId}`);
}

async function resolveTeamMemberUser(ctx: MutationCtx, teamMemberId: string): Promise<Doc<"users">> {
  const seeded = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", `seed:team_member:${teamMemberId}`))
    .unique();
  if (seeded) return seeded;

  const direct = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", teamMemberId))
    .unique();
  if (direct) return direct;

  throw new Error(`Team member not found for id ${teamMemberId}`);
}

async function resolveTeamMemberUsers(ctx: MutationCtx, teamMemberIds: string[]): Promise<Id<"users">[]> {
  const usersBySeedId = await getUsersBySeedIds(ctx, teamMemberIds, "seed:team_member:");
  return teamMemberIds
    .map((id) => usersBySeedId.get(id)?._id)
    .filter((id): id is Id<"users"> => id !== undefined);
}

async function resolveJobByExternalId(ctx: MutationCtx, jobId: string): Promise<Doc<"jobs">> {
  const jobs = await ctx.db.query("jobs").take(500);
  const match = jobs.find((job) => {
    const externalId = getSeedIdFromMetadata(job.metadata) ?? String(job._id);
    return externalId === jobId;
  });
  if (!match) {
    throw new Error(`Job not found for id ${jobId}`);
  }
  return match;
}

async function resolveApplicationByExternalId(
  ctx: MutationCtx,
  applicantUserId: Id<"users">,
  applicationId: string,
): Promise<Doc<"applications">> {
  const applications = await ctx.db
    .query("applications")
    .withIndex("byApplicantUserId", (q) => q.eq("applicantUserId", applicantUserId))
    .take(500);
  const match = applications.find((app) => {
    const externalId = getSeedIdFromMetadata(app.metadata) ?? String(app._id);
    return externalId === applicationId;
  });
  if (!match) {
    throw new Error(`Application not found for id ${applicationId}`);
  }
  return match;
}

function timelineWithStageDate(
  timeline: Record<string, unknown> | undefined,
  stage: ApplicationStage,
  date: string,
): Record<string, unknown> {
  const next = { ...(timeline ?? {}) };
  if (stage === "screening") next.dateScreened = date;
  if (stage === "interview") next.dateInterviewed = date;
  if (stage === "offered") next.dateOffered = date;
  if (stage === "hired") next.dateHired = date;
  if (stage === "rejected") next.dateRejected = date;
  return next;
}

type AtsState = {
  jobs: Job[];
  applicants: Applicant[];
  scorecards: ScoreCard[];
};

async function buildAtsState(ctx: QueryCtx): Promise<AtsState> {
  const [jobsDocs, usersDocs, applicationsDocs, scorecardDocs, gamificationDocs] = await Promise.all([
    ctx.db.query("jobs").take(500),
    ctx.db.query("users").take(1000),
    ctx.db.query("applications").take(2000),
    ctx.db.query("scorecards").take(2000),
    ctx.db.query("gamificationEvents").take(4000),
  ]);

  const usersById = new Map(usersDocs.map((user) => [user._id, user]));
  const jobsById = new Map(jobsDocs.map((job) => [job._id, job]));
  const applicationsById = new Map(applicationsDocs.map((app) => [app._id, app]));
  const applicationsByApplicantId = new Map<Id<"users">, Doc<"applications">[]>();

  for (const application of applicationsDocs) {
    const existing = applicationsByApplicantId.get(application.applicantUserId) ?? [];
    existing.push(application);
    applicationsByApplicantId.set(application.applicantUserId, existing);
  }

  const applicantResumeUrlByUserId = new Map<Id<"users">, string | null>(
    await Promise.all(
      usersDocs
        .filter((user) => user.role === "applicant")
        .map(async (user) => [user._id, user.resumeStorageId ? await ctx.storage.getUrl(user.resumeStorageId) : null] as const),
    ),
  );
  const applicationResumeUrlById = new Map<Id<"applications">, string | null>(
    await Promise.all(
      applicationsDocs.map(async (application) => [
        application._id,
        application.resumeStorageId ? await ctx.storage.getUrl(application.resumeStorageId) : null,
      ] as const),
    ),
  );

  const jobModels: Job[] = jobsDocs.map((jobDoc) => {
    const seedJob = seedJobs.find((job) => job.id === getSeedIdFromMetadata(jobDoc.metadata));
    const metadata = (jobDoc.metadata ?? {}) as Record<string, unknown>;
    const derivedApplicantIds = applicationsDocs
      .filter((application) => application.jobId === jobDoc._id)
      .map((application) => {
        const applicant = usersById.get(application.applicantUserId);
        if (!applicant) return null;
        return seedIdFromClerkUserId(applicant.clerkUserId, "seed:applicant:") ?? applicant.clerkUserId;
      })
      .filter((id): id is string => id !== null);

    const id = getSeedIdFromMetadata(jobDoc.metadata) ?? String(jobDoc._id);
    const teamMemberIds = jobDoc.hiringTeamUserIds
      .map((userId) => {
        const user = usersById.get(userId);
        if (!user) return null;
        return seedIdFromClerkUserId(user.clerkUserId, "seed:team_member:");
      })
      .filter((value): value is string => value !== null);
    const hiringManager = usersById.get(jobDoc.hiringManagerUserId);
    const hiringManagerId =
      (hiringManager && seedIdFromClerkUserId(hiringManager.clerkUserId, "seed:team_member:")) ??
      String(jobDoc.hiringManagerUserId);

    return {
      ...seedJob,
      id,
      companyId: jobDoc.companyId,
      title: jobDoc.title,
      team: (metadata.team as string | undefined) ?? seedJob?.team ?? "General",
      hiringManagerId,
      teamMemberIds: teamMemberIds.length > 0 ? teamMemberIds : seedJob?.teamMemberIds ?? [],
      overview: jobDoc.description ?? seedJob?.overview ?? "",
      responsibilities:
        ((metadata.responsibilities as string[] | undefined) ?? seedJob?.responsibilities ?? []),
      qualifications:
        ((metadata.qualifications as string[] | undefined) ?? seedJob?.qualifications ?? []),
      workEnvironment:
        (metadata.workEnvironment as string | undefined) ?? seedJob?.workEnvironment ?? "",
      applicationProcess:
        (metadata.applicationProcess as string | undefined) ?? seedJob?.applicationProcess ?? "",
      stages:
        (Array.isArray(jobDoc.stageConfig) ? (jobDoc.stageConfig as Job["stages"]) : seedJob?.stages) ?? [],
      postedDate:
        (metadata.postedDate as string | undefined) ?? seedJob?.postedDate ?? toDateString(jobDoc.createdAt),
      status: (jobDoc.status as Job["status"]) ?? seedJob?.status ?? "open",
      applicantIds:
        ((metadata.applicantIds as string[] | undefined) ?? (derivedApplicantIds.length > 0 ? derivedApplicantIds : seedJob?.applicantIds)) ??
        [],
      requiredTaskIds:
        ((metadata.requiredTaskIds as string[] | undefined) ?? seedJob?.requiredTaskIds ?? []),
    };
  });

  const completedTasksByUser = new Map<Id<"users">, CompletedTask[]>();
  for (const event of gamificationDocs) {
    const taskId = (event.metadata as { taskId?: unknown } | undefined)?.taskId;
    if (typeof taskId !== "string") continue;

    const list = completedTasksByUser.get(event.userId) ?? [];
    list.push({
      taskId,
      dateCompleted: toDateString(event.createdAt),
      pointsEarned: event.pointsDelta,
    });
    completedTasksByUser.set(event.userId, list);
  }

  const applicantModels: Applicant[] = usersDocs
    .filter((user) => user.role === "applicant")
    .map((userDoc) => {
      const applicantId = seedIdFromClerkUserId(userDoc.clerkUserId, "seed:applicant:") ?? userDoc.clerkUserId;
      const seedApplicant = seedApplicants.find((applicant) => applicant.id === applicantId);
      const applications = (applicationsByApplicantId.get(userDoc._id) ?? []).map((appDoc) => {
        const jobDoc = jobsById.get(appDoc.jobId);
        const companyId =
          (appDoc.metadata as { companyId?: unknown } | undefined)?.companyId ??
          (jobDoc?.companyId ?? seedApplicant?.applications.find((app) => app.id === getSeedIdFromMetadata(appDoc.metadata))?.companyId);
        const stage = (appDoc.stage as ApplicationStage) ?? "applied";
        const timeline = (appDoc.timeline ?? {}) as Record<string, string | undefined>;
        const externalApplicationId = getSeedIdFromMetadata(appDoc.metadata) ?? String(appDoc._id);

        return {
          ...(seedApplicant?.applications.find((seedApp) => seedApp.id === externalApplicationId) ?? {}),
          id: externalApplicationId,
          jobId: getSeedIdFromMetadata(jobDoc?.metadata) ?? String(appDoc.jobId),
          companyId: typeof companyId === "string" ? companyId : "unknown",
          stage,
          dateApplied: timeline.dateApplied ?? toDateString(appDoc.createdAt),
          dateScreened: timeline.dateScreened,
          dateInterviewed: timeline.dateInterviewed,
          dateOffered: timeline.dateOffered,
          dateHired: timeline.dateHired,
          dateRejected: timeline.dateRejected,
          completedTasks:
            ((appDoc.metadata as { completedTasks?: unknown } | undefined)?.completedTasks as CompletedTask[] | undefined) ?? [],
          assignedInterviewerIds:
            ((appDoc.metadata as { assignedInterviewerIds?: unknown } | undefined)?.assignedInterviewerIds as string[] | undefined) ?? [],
          feedbackForApplicant: appDoc.publicFeedback ?? undefined,
          source: appDoc.source ?? "Direct",
          resumeFileName: appDoc.resumeFileName ?? undefined,
          resumeUrl: applicationResumeUrlById.get(appDoc._id) ?? undefined,
          resumeUploadedAt: appDoc.resumeUploadedAt ? toDateString(appDoc.resumeUploadedAt) : undefined,
        } satisfies Application;
      });

      const completedTasks =
        completedTasksByUser.get(userDoc._id)?.sort((a, b) => a.dateCompleted.localeCompare(b.dateCompleted)) ??
        seedApplicant?.completedTasks ??
        [];
      const totalXp = userDoc.xpSummary?.totalXp ?? completedTasks.reduce((sum, task) => sum + task.pointsEarned, 0);
      const level = userDoc.xpSummary?.level ?? computeLevel(totalXp);

      return {
        ...seedApplicant,
        id: applicantId,
        firstName: userDoc.firstName ?? seedApplicant?.firstName ?? "Applicant",
        lastName: userDoc.lastName ?? seedApplicant?.lastName ?? "",
        email: userDoc.email,
        jobGoal: seedApplicant?.jobGoal ?? "Find a role aligned to my strengths.",
        level,
        xp: totalXp,
        xpToNextLevel: getNextLevelThreshold(level),
        completedTasks,
        applications,
        skills: seedApplicant?.skills ?? [],
        location: seedApplicant?.location ?? "Remote",
        experience: seedApplicant?.experience ?? 0,
        resumeSnippet: seedApplicant?.resumeSnippet ?? "",
        resumeFileName: userDoc.resumeFileName ?? undefined,
        resumeUrl: applicantResumeUrlByUserId.get(userDoc._id) ?? undefined,
        resumeUploadedAt: userDoc.resumeUploadedAt ? toDateString(userDoc.resumeUploadedAt) : undefined,
        avatar: userDoc.avatar ?? seedApplicant?.avatar ?? toAvatar(userDoc.firstName, userDoc.lastName),
      } satisfies Applicant;
    });

  const scorecards: ScoreCard[] = scorecardDocs.map((scorecardDoc) => {
    const application = applicationsById.get(scorecardDoc.applicationId);
    const applicant = application ? usersById.get(application.applicantUserId) : null;
    const job = application ? jobsById.get(application.jobId) : null;
    const interviewer = usersById.get(scorecardDoc.interviewerUserId);

    const applicantId =
      applicant && (seedIdFromClerkUserId(applicant.clerkUserId, "seed:applicant:") ?? applicant.clerkUserId);
    const jobId = job ? getSeedIdFromMetadata(job.metadata) ?? String(job._id) : "";
    const interviewerId =
      interviewer &&
      (seedIdFromClerkUserId(interviewer.clerkUserId, "seed:team_member:") ?? interviewer.clerkUserId);
    const seedScorecard = seedScorecards.find(
      (scorecard) =>
        scorecard.applicantId === applicantId &&
        scorecard.jobId === jobId &&
        scorecard.interviewerId === interviewerId,
    );

    return {
      ...seedScorecard,
      id: getSeedIdFromMetadata(scorecardDoc.structuredFeedback) ?? String(scorecardDoc._id),
      applicantId: applicantId ?? "",
      jobId,
      stageId:
        ((scorecardDoc.structuredFeedback as { stageId?: unknown } | undefined)?.stageId as string | undefined) ??
        seedScorecard?.stageId ??
        "",
      interviewerId: interviewerId ?? "",
      scores:
        ((scorecardDoc.structuredFeedback as { scores?: unknown } | undefined)?.scores as ScoreCard["scores"] | undefined) ??
        seedScorecard?.scores ??
        [],
      feedbackForRecruiter: scorecardDoc.notes ?? seedScorecard?.feedbackForRecruiter ?? "",
      feedbackForApplicant:
        ((scorecardDoc.structuredFeedback as { feedbackForApplicant?: unknown } | undefined)
          ?.feedbackForApplicant as string | undefined) ??
        seedScorecard?.feedbackForApplicant ??
        "",
      recommendation:
        (scorecardDoc.recommendation as ScoreCard["recommendation"] | undefined) ??
        seedScorecard?.recommendation ??
        "hold",
      completedAt: toDateString(scorecardDoc.submittedAt),
    } satisfies ScoreCard;
  });

  return {
    jobs: jobModels,
    applicants: applicantModels,
    scorecards,
  };
}

export const getAtsState = query({
  args: {},
  handler: async (ctx) => {
    return await buildAtsState(ctx);
  },
});

export const createJob = mutation({
  args: { job: v.any() },
  handler: async (ctx, args) => {
    const job = args.job as Job;
    const now = Date.now();

    const hiringManager = await getUsersBySeedIds(ctx, [job.hiringManagerId], "seed:team_member:");
    const hiringManagerUser = hiringManager.get(job.hiringManagerId);
    if (!hiringManagerUser) {
      throw new Error("Hiring manager user not found");
    }

    const hiringTeamUserIds = await resolveTeamMemberUsers(ctx, job.teamMemberIds);
    const existingJobs = await ctx.db.query("jobs").take(500);
    const existing = existingJobs.find((existingJob) => {
      const existingExternalId = getSeedIdFromMetadata(existingJob.metadata) ?? String(existingJob._id);
      return existingExternalId === job.id;
    });

    const payload = {
      companyId: job.companyId,
      title: job.title,
      description: job.overview,
      status: job.status,
      hiringManagerUserId: hiringManagerUser._id,
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
      createdAt: parseDateToTimestamp(job.postedDate, now),
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("jobs", payload);
    }

    return { ok: true };
  },
});

export const updateJob = mutation({
  args: { job: v.any() },
  handler: async (ctx, args) => {
    const job = args.job as Job;
    const now = Date.now();
    const existing = await resolveJobByExternalId(ctx, job.id);

    const hiringManagerMap = await getUsersBySeedIds(ctx, [job.hiringManagerId], "seed:team_member:");
    const hiringManager = hiringManagerMap.get(job.hiringManagerId);
    if (!hiringManager) {
      throw new Error("Hiring manager user not found");
    }

    const hiringTeamUserIds = await resolveTeamMemberUsers(ctx, job.teamMemberIds);

    await ctx.db.patch(existing._id, {
      companyId: job.companyId,
      title: job.title,
      description: job.overview,
      status: job.status,
      hiringManagerUserId: hiringManager._id,
      hiringTeamUserIds,
      stageConfig: job.stages,
      metadata: {
        ...(existing.metadata as Record<string, unknown> | undefined),
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
      updatedAt: now,
    });

    return { ok: true };
  },
});

export const createResumeUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveApplicantResume = mutation({
  args: {
    applicantId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const applicantUser = await resolveApplicantUser(ctx, args.applicantId);
    const now = Date.now();

    await ctx.db.patch(applicantUser._id, {
      resumeStorageId: args.storageId,
      resumeFileName: args.fileName,
      resumeContentType: args.contentType,
      resumeUploadedAt: now,
      updatedAt: now,
    });

    return { ok: true };
  },
});

export const applyToJob = mutation({
  args: {
    applicantId: v.string(),
    jobId: v.string(),
    companyId: v.string(),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    const applicantUser = await resolveApplicantUser(ctx, args.applicantId);
    const job = await resolveJobByExternalId(ctx, args.jobId);
    const existingApplications = await ctx.db
      .query("applications")
      .withIndex("byApplicantUserId", (q) => q.eq("applicantUserId", applicantUser._id))
      .take(500);

    const alreadyApplied = existingApplications.some((application) => application.jobId === job._id);
    if (alreadyApplied) {
      return { ok: true, alreadyApplied: true };
    }

    const now = Date.now();
    const dateApplied = toDateString(now);
    const applicationExternalId = `appl-new-${now}`;

    await ctx.db.insert("applications", {
      applicantUserId: applicantUser._id,
      jobId: job._id,
      stage: "applied",
      status: "applied",
      resumeStorageId: applicantUser.resumeStorageId,
      resumeFileName: applicantUser.resumeFileName,
      resumeContentType: applicantUser.resumeContentType,
      resumeUploadedAt: applicantUser.resumeUploadedAt,
      timeline: { dateApplied },
      source: args.source || "Direct",
      metadata: {
        seedId: applicationExternalId,
        companyId: args.companyId,
        assignedInterviewerIds: [],
        completedTasks: [],
      },
      createdAt: now,
      updatedAt: now,
    });

    const metadata = (job.metadata ?? {}) as Record<string, unknown>;
    const applicantIds = new Set((metadata.applicantIds as string[] | undefined) ?? []);
    applicantIds.add(args.applicantId);

    await ctx.db.patch(job._id, {
      metadata: {
        ...metadata,
        applicantIds: Array.from(applicantIds),
      },
      updatedAt: now,
    });

    return { ok: true };
  },
});

export const updateApplication = mutation({
  args: {
    applicantId: v.string(),
    applicationId: v.string(),
    stage: v.optional(stageValidator),
    feedbackForApplicant: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.stage === undefined && args.feedbackForApplicant === undefined) {
      throw new Error("No updates provided");
    }

    const applicantUser = await resolveApplicantUser(ctx, args.applicantId);
    const application = await resolveApplicationByExternalId(ctx, applicantUser._id, args.applicationId);
    const now = Date.now();
    const timeline = (application.timeline as Record<string, unknown> | undefined) ?? {};

    await ctx.db.patch(application._id, {
      ...(args.stage !== undefined ? { stage: args.stage, status: args.stage } : {}),
      ...(args.feedbackForApplicant !== undefined ? { publicFeedback: args.feedbackForApplicant } : {}),
      ...(args.stage !== undefined ? { timeline: timelineWithStageDate(timeline, args.stage, toDateString(now)) } : {}),
      updatedAt: now,
    });

    return { ok: true };
  },
});

export const assignInterviewer = mutation({
  args: {
    applicantId: v.string(),
    applicationId: v.string(),
    interviewerId: v.string(),
    assigned: v.boolean(),
  },
  handler: async (ctx, args) => {
    const applicantUser = await resolveApplicantUser(ctx, args.applicantId);
    const application = await resolveApplicationByExternalId(ctx, applicantUser._id, args.applicationId);
    const interviewer = await resolveTeamMemberUser(ctx, args.interviewerId);
    const metadata = (application.metadata ?? {}) as Record<string, unknown>;
    const assignedInterviewerIds = new Set(
      ((metadata.assignedInterviewerIds as string[] | undefined) ?? []).filter((id) => typeof id === "string"),
    );
    const interviewerExternalId =
      seedIdFromClerkUserId(interviewer.clerkUserId, "seed:team_member:") ?? args.interviewerId;

    if (args.assigned) {
      assignedInterviewerIds.add(interviewerExternalId);
    } else {
      assignedInterviewerIds.delete(interviewerExternalId);
    }

    await ctx.db.patch(application._id, {
      metadata: {
        ...metadata,
        assignedInterviewerIds: Array.from(assignedInterviewerIds),
      },
      updatedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const completeTask = mutation({
  args: {
    applicantId: v.string(),
    taskId: v.string(),
    points: v.number(),
    jobId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const applicantUser = await resolveApplicantUser(ctx, args.applicantId);
    const existingEvents = await ctx.db
      .query("gamificationEvents")
      .withIndex("byUserId", (q) => q.eq("userId", applicantUser._id))
      .take(1000);
    const alreadyDone = existingEvents.some(
      (event) => (event.metadata as { taskId?: unknown } | undefined)?.taskId === args.taskId,
    );
    if (alreadyDone) {
      return { ok: true, alreadyDone: true };
    }

    const now = Date.now();

    let linkedApplicationId: Id<"applications"> | undefined;
    if (args.jobId) {
      const job = await resolveJobByExternalId(ctx, args.jobId);
      const applications = await ctx.db
        .query("applications")
        .withIndex("byApplicantUserId", (q) => q.eq("applicantUserId", applicantUser._id))
        .take(500);
      linkedApplicationId = applications.find((application) => application.jobId === job._id)?._id;
    }

    await ctx.db.insert("gamificationEvents", {
      userId: applicantUser._id,
      applicationId: linkedApplicationId,
      type: "task.completed",
      pointsDelta: args.points,
      metadata: {
        taskId: args.taskId,
      },
      createdAt: now,
    });

    const previousXp = applicantUser.xpSummary?.totalXp ?? 0;
    const totalXp = previousXp + args.points;
    const level = computeLevel(totalXp);
    await ctx.db.patch(applicantUser._id, {
      xpSummary: {
        totalXp,
        level,
        badges: applicantUser.xpSummary?.badges ?? [],
      },
      updatedAt: now,
    });

    if (linkedApplicationId) {
      const application = await ctx.db.get(linkedApplicationId);
      if (application) {
        const metadata = (application.metadata ?? {}) as Record<string, unknown>;
        const completedTasks = (metadata.completedTasks as CompletedTask[] | undefined) ?? [];
        const dateCompleted = toDateString(now);
        const nextCompletedTasks = [...completedTasks, { taskId: args.taskId, dateCompleted, pointsEarned: args.points }];
        await ctx.db.patch(linkedApplicationId, {
          metadata: {
            ...metadata,
            completedTasks: nextCompletedTasks,
          },
          updatedAt: now,
        });
      }
    }

    return { ok: true };
  },
});

export const addScorecard = mutation({
  args: {
    scorecard: v.object({
      id: v.string(),
      applicantId: v.string(),
      jobId: v.string(),
      stageId: v.string(),
      interviewerId: v.string(),
      scores: v.array(
        v.object({
          rubricItemId: v.string(),
          score: v.number(),
          notes: v.string(),
        }),
      ),
      feedbackForRecruiter: v.string(),
      feedbackForApplicant: v.string(),
      recommendation: recommendationValidator,
      completedAt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const scorecard = args.scorecard;
    const applicantUser = await resolveApplicantUser(ctx, scorecard.applicantId);
    const interviewerMap = await getUsersBySeedIds(ctx, [scorecard.interviewerId], "seed:team_member:");
    const interviewerUser = interviewerMap.get(scorecard.interviewerId);
    if (!interviewerUser) {
      throw new Error("Interviewer not found");
    }
    const job = await resolveJobByExternalId(ctx, scorecard.jobId);
    const applications = await ctx.db
      .query("applications")
      .withIndex("byApplicantUserId", (q) => q.eq("applicantUserId", applicantUser._id))
      .take(500);
    const application = applications.find((candidateApplication) => candidateApplication.jobId === job._id);
    if (!application) {
      throw new Error("Application not found");
    }

    const existingScorecards = await ctx.db
      .query("scorecards")
      .withIndex("byApplicationId", (q) => q.eq("applicationId", application._id))
      .take(50);
    const existing = existingScorecards.find(
      (existingScorecard) => existingScorecard.interviewerUserId === interviewerUser._id,
    );
    const submittedAt = parseDateToTimestamp(scorecard.completedAt, Date.now());
    const structuredFeedback = {
      seedId: scorecard.id,
      stageId: scorecard.stageId,
      scores: scorecard.scores,
      feedbackForApplicant: scorecard.feedbackForApplicant,
      feedbackForRecruiter: scorecard.feedbackForRecruiter,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        recommendation: scorecard.recommendation,
        structuredFeedback,
        notes: scorecard.feedbackForRecruiter,
        submittedAt,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("scorecards", {
        applicationId: application._id,
        interviewerUserId: interviewerUser._id,
        recommendation: scorecard.recommendation,
        structuredFeedback,
        notes: scorecard.feedbackForRecruiter,
        submittedAt,
        updatedAt: Date.now(),
      });
    }

    return { ok: true };
  },
});
