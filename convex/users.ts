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

export const syncCurrentUser = mutation({
  args: {
    role: v.optional(roleValidator),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatar: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const role = args.role ?? "applicant";

    const existingUser = await findExistingUserForWrite(ctx, identity.tokenIdentifier, identity.email ?? null);
    const normalizedIdentityEmail = normalizeEmailClaim(identity.email ?? null);
    const normalizedExistingEmail = normalizeEmailClaim(existingUser?.email ?? null);
    // Prefer the signed JWT email claim. If it's missing, keep the existing email
    // or derive a stable placeholder from the identity token.
    const email =
      normalizedIdentityEmail ??
      normalizedExistingEmail ??
      `${identity.tokenIdentifier}@users.clerk.local`;

    if (existingUser) {
      const role = resolveExistingRole(existingUser.role, args.role);
      await ctx.db.patch(existingUser._id, {
        role,
        email,
        firstName: args.firstName ?? existingUser.firstName,
        lastName: args.lastName ?? existingUser.lastName,
        avatar: args.avatar ?? existingUser.avatar,
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
