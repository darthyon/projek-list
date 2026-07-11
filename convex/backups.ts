import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const push = mutation({
  args: {
    userId: v.id("users"),
    data: v.string(),
    listCount: v.float64(),
    itemCount: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("backups", {
      userId: args.userId,
      data: args.data,
      listCount: args.listCount,
      itemCount: args.itemCount,
      createdAt: Date.now(),
    });
  },
});

export const latest = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("backups")
      .withIndex("by_user_created", (q) =>
        q.eq("userId", args.userId),
      )
      .order("desc")
      .first();
  },
});
