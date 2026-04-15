import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const roleValidator = v.union(
  v.literal("applicant"),
  v.literal("interviewer"),
  v.literal("hiring_manager")
);

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    role: roleValidator,
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    xpSummary: v.optional(
      v.object({
        totalXp: v.number(),
        level: v.number(),
        badges: v.array(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byClerkUserId", ["clerkUserId"])
    .index("byEmail", ["email"])
    .index("byRole", ["role"]),

  jobs: defineTable({
    companyId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    hiringManagerUserId: v.id("users"),
    hiringTeamUserIds: v.array(v.id("users")),
    stageConfig: v.optional(v.any()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byCompanyId", ["companyId"])
    .index("byStatus", ["status"])
    .index("byHiringManagerId", ["hiringManagerUserId"]),

  applications: defineTable({
    applicantUserId: v.id("users"),
    jobId: v.id("jobs"),
    stage: v.string(),
    status: v.optional(v.string()),
    timeline: v.optional(v.any()),
    source: v.optional(v.string()),
    publicFeedback: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("byApplicantUserId", ["applicantUserId"])
    .index("byJobId", ["jobId"])
    .index("byStage", ["stage"]),

  scorecards: defineTable({
    applicationId: v.id("applications"),
    interviewerUserId: v.id("users"),
    recommendation: v.optional(v.string()),
    structuredFeedback: v.optional(v.any()),
    notes: v.optional(v.string()),
    submittedAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("byApplicationId", ["applicationId"])
    .index("byInterviewerUserId", ["interviewerUserId"]),

  tasks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    scope: v.union(v.literal("general"), v.literal("company"), v.literal("role")),
    role: v.optional(roleValidator),
    companyId: v.optional(v.string()),
    points: v.number(),
    metadata: v.optional(v.any()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  gamificationEvents: defineTable({
    userId: v.id("users"),
    applicationId: v.optional(v.id("applications")),
    type: v.string(),
    pointsDelta: v.number(),
    badge: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("byUserId", ["userId"])
    .index("byType", ["type"]),
});
