import { pgTable, text, timestamp, uuid, jsonb, index } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  category: text("category").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  userIdIdx: index("events_user_id_idx").on(table.userId),
  startTimeIdx: index("events_start_time_idx").on(table.startTime),
}));

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
  metadata: jsonb("metadata"), // For storing structured data, tool calls, etc.
}, (table) => ({
  userIdIdx: index("chat_messages_user_id_idx").on(table.userId),
  timestampIdx: index("chat_messages_timestamp_idx").on(table.timestamp),
}));

// Type definitions
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;