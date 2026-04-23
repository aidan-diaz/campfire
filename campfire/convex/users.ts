import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";

const roleValidator = v.union(
  v.literal("applicant"),
  v.literal("interviewer"),
  v.literal("hiring_manager"),
);

function normalizeEmailClaim(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  // Guard against unresolved template placeholders from JWT templates.
  if (trimmed.includes("{{") || trimmed.includes("}}")) {
    return null;
  }

  if (!trimmed.includes("@")) {
    return null;
  }

  return trimmed.toLowerCase();
}

function toSafeFallbackEmail(tokenIdentifier: string): string {
  const localPart = tokenIdentifier
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 24);
  return `${localPart || "user"}@users.clerk.local`;
}

function normalizeCompanyName(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveExistingRole(
  existingRole: "applicant" | "interviewer" | "hiring_manager",
  incomingRole: "applicant" | "interviewer" | "hiring_manager" | undefined,
) {
  if (!incomingRole || incomingRole === existingRole) {
    return existingRole;
  }

  // Role changes must happen through explicit admin workflows, not profile sync.
  throw new Error("Unauthorized role change");
}

async function findExistingUserForRead(
  ctx: QueryCtx,
  tokenIdentifier: string,
  email: string | null,
) {
  const byClerkUserId = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", tokenIdentifier))
    .unique();

  if (byClerkUserId) {
    return byClerkUserId;
  }

  const normalizedEmail = normalizeEmailClaim(email);
  if (!normalizedEmail) {
    return null;
  }

  const byEmail = await ctx.db
    .query("users")
    .withIndex("byEmail", (q) => q.eq("email", normalizedEmail))
    .unique();

  if (!byEmail) {
    return null;
  }

  return byEmail;
}

async function findExistingUserForWrite(
  ctx: MutationCtx,
  tokenIdentifier: string,
  email: string | null,
) {
  const byClerkUserId = await ctx.db
    .query("users")
    .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", tokenIdentifier))
    .unique();

  if (byClerkUserId) {
    return byClerkUserId;
  }

  const normalizedEmail = normalizeEmailClaim(email);
  if (!normalizedEmail) {
    return null;
  }

  const byEmail = await ctx.db
    .query("users")
    .withIndex("byEmail", (q) => q.eq("email", normalizedEmail))
    .unique();

  if (!byEmail) {
    return null;
  }

  // Re-link legacy records to the active Clerk identity token.
  await ctx.db.patch(byEmail._id, {
    clerkUserId: tokenIdentifier,
    updatedAt: Date.now(),
  });

  return {
    ...byEmail,
    clerkUserId: tokenIdentifier,
  };
}

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await findExistingUserForRead(ctx, identity.tokenIdentifier, identity.email ?? null);
  },
});

export const getCurrentUserResume = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const user = await findExistingUserForRead(ctx, identity.tokenIdentifier, identity.email ?? null);
    if (!user?.resumeStorageId) return null;
    const resumeUrl = await ctx.storage.getUrl(user.resumeStorageId);
    return {
      resumeUrl,
      resumeFileName: user.resumeFileName ?? null,
      resumeUploadedAt: user.resumeUploadedAt ?? null,
    };
  },
});

export const syncCurrentUser = mutation({
  args: {
    role: v.optional(roleValidator),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    companyName: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const role = args.role ?? "applicant";
    const companyName = normalizeCompanyName(args.companyName);

    const existingUser = await findExistingUserForWrite(ctx, identity.tokenIdentifier, identity.email ?? null);
    const normalizedIdentityEmail = normalizeEmailClaim(identity.email ?? null);
    const normalizedExistingEmail = normalizeEmailClaim(existingUser?.email ?? null);
    const email =
      normalizedIdentityEmail ??
      normalizedExistingEmail ??
      toSafeFallbackEmail(identity.tokenIdentifier);

    if (existingUser) {
      const role = resolveExistingRole(existingUser.role, args.role);
      await ctx.db.patch(existingUser._id, {
        role,
        email,
        firstName: args.firstName ?? existingUser.firstName,
        lastName: args.lastName ?? existingUser.lastName,
        avatar: args.avatar ?? existingUser.avatar,
        companyName: companyName ?? existingUser.companyName,
        onboardingCompleted: args.onboardingCompleted ?? existingUser.onboardingCompleted,
        updatedAt: now,
      });

      return {
        userId: existingUser._id,
        role,
      };
    }

    const userId = await ctx.db.insert("users", {
      clerkUserId: identity.tokenIdentifier,
      role,
      email,
      firstName: args.firstName,
      lastName: args.lastName,
      avatar: args.avatar,
      companyName,
      onboardingCompleted: args.onboardingCompleted ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      userId,
      role,
    };
  },
});

export const createResumeUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveCurrentUserResume = mutation({
  args: {
    storageId: v.id("_storage"),
    fileName: v.string(),
    contentType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    let user = await ctx.db
      .query("users")
      .withIndex("byClerkUserId", (q) => q.eq("clerkUserId", identity.tokenIdentifier))
      .unique();

    if (!user) {
      const now = Date.now();
      const normalizedEmail = normalizeEmailClaim(identity.email ?? null);
      const fallbackEmail = toSafeFallbackEmail(identity.tokenIdentifier);
      const createdUserId = await ctx.db.insert("users", {
        clerkUserId: identity.tokenIdentifier,
        role: "applicant",
        email: normalizedEmail ?? fallbackEmail,
        avatar: identity.pictureUrl ?? undefined,
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      });
      user = await ctx.db.get(createdUserId);
      if (!user) throw new Error("Failed to create user for resume upload");
    }

    const now = Date.now();
    await ctx.db.patch(user._id, {
      resumeStorageId: args.storageId,
      resumeFileName: args.fileName,
      resumeContentType: args.contentType,
      resumeUploadedAt: now,
      updatedAt: now,
    });

    const resumeUrl = await ctx.storage.getUrl(args.storageId);
    return { ok: true, fileName: args.fileName, resumeUrl };
  },
});
