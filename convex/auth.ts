import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const register = mutation({
  args: {
    name: v.string(),
    pinHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      throw new Error("Name already taken. Pick another.");
    }

    const userId = await ctx.db.insert("users", {
      name: args.name,
      pinHash: args.pinHash,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const login = mutation({
  args: {
    name: v.string(),
    pinHash: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!user || user.pinHash !== args.pinHash) {
      return null;
    }

    return { id: user._id, name: user.name };
  },
});
