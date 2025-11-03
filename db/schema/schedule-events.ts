import {
    pgTable,
    text,
    timestamp,
    integer,
    varchar,
    enum as pgEnum,
    pgIndex,
    index
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";

// Enums for status, priority, and category
export const scheduleEventStatusEnum = pgEnum("schedule_event_status", [
    "pending",
    "in_progress",
    "completed",
    "cancelled",
    "postponed"
]);

export const scheduleEventPriorityEnum = pgEnum("schedule_event_priority", [
    "low",
    "medium",
    "high",
    "urgent"
]);

export const scheduleEventCategoryEnum = pgEnum("schedule_event_category", [
    "meeting",
    "task",
    "appointment",
    "reminder",
    "deadline",
    "other"
]);

// Main schedule_events table
export const scheduleEvents = pgTable("schedule_events", {
    id: text("id").primaryKey(),

    // Basic event information
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),

    // Event timing
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),

    // Categorization fields (filterable)
    status: scheduleEventStatusEnum("status").notNull().default("pending"),
    priority: scheduleEventPriorityEnum("priority").notNull().default("medium"),
    category: scheduleEventCategoryEnum("category").notNull().default("other"),

    // Additional metadata
    location: varchar("location", { length: 255 }),
    isVirtual: boolean("is_virtual").notNull().default(false),

    // Relationship to user
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    // System timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .$defaultFn(() => new Date())
        .notNull(),
}, (table) => ({
    // Indexes for performance optimization on frequently queried columns
    userIdIdx: pgIndex("idx_schedule_events_user_id").on(table.userId),
    statusIdx: pgIndex("idx_schedule_events_status").on(table.status),
    priorityIdx: pgIndex("idx_schedule_events_priority").on(table.priority),
    categoryIdx: pgIndex("idx_schedule_events_category").on(table.category),
    startTimeIdx: pgIndex("idx_schedule_events_start_time").on(table.startTime),
    createdAtIdx: pgIndex("idx_schedule_events_created_at").on(table.createdAt),

    // Composite indexes for common query patterns
    userStatusIdx: pgIndex("idx_schedule_events_user_status").on(table.userId, table.status),
    userStartTimeIdx: pgIndex("idx_schedule_events_user_start_time").on(table.userId, table.startTime),
    statusPriorityIdx: pgIndex("idx_schedule_events_status_priority").on(table.status, table.priority),
}));

// Relations for the schedule events table
export const scheduleEventsRelations = relations(scheduleEvents, ({ one }) => ({
    user: one(user, {
        fields: [scheduleEvents.userId],
        references: [user.id],
    }),
}));

// Type exports for TypeScript usage
export type ScheduleEvent = typeof scheduleEvents.$inferSelect;
export type NewScheduleEvent = typeof scheduleEvents.$inferInsert;