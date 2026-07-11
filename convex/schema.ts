import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    pinHash: v.string(),
    createdAt: v.float64(),
  }).index("by_name", ["name"]),

  backups: defineTable({
    userId: v.id("users"),
    data: v.string(),
    listCount: v.float64(),
    itemCount: v.float64(),
    createdAt: v.float64(),
  })
    .index("by_user", ["userId"])
    .index("by_user_created", ["userId", "createdAt"]),
});
