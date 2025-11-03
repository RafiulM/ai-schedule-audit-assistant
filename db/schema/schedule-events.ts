import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  varchar,
  pgEnum,
  index
} from "drizzle-orm/pg-core"

// Enums for status and priority
export const scheduleEventStatusEnum = pgEnum("schedule_event_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled"
])

export const scheduleEventPriorityEnum = pgEnum("schedule_event_priority", [
  "low",
  "medium",
  "high",
  "urgent"
])

export const scheduleEvents = pgTable("schedule_events", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Basic event information
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  // Status and priority
  status: scheduleEventStatusEnum("status").notNull().default("pending"),
  priority: scheduleEventPriorityEnum("priority").notNull().default("medium"),

  // Assignment
  assignedTo: text("assigned_to"),
  reviewer: text("reviewer"),

  // Dates
  dueDate: timestamp("due_date", { withTimezone: true }),
  startDate: timestamp("start_date", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),

  // Additional fields
  targetAudience: varchar("target_audience", { length: 255 }),
  location: varchar("location", { length: 255 }),
  tags: text("tags").array(),

  // Flags
  isRecurring: boolean("is_recurring").default(false).notNull(),

  // Metadata
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Indexes for performance
  statusIdx: index("schedule_events_status_idx").on(table.status),
  priorityIdx: index("schedule_events_priority_idx").on(table.priority),
  assignedToIdx: index("schedule_events_assigned_to_idx").on(table.assignedTo),
  dueDateIdx: index("schedule_events_due_date_idx").on(table.dueDate),
  createdAtIdx: index("schedule_events_created_at_idx").on(table.createdAt),

  // Composite indexes for common queries
  statusPriorityIdx: index("schedule_events_status_priority_idx").on(table.status, table.priority),
  statusDueDateIdx: index("schedule_events_status_due_date_idx").on(table.status, table.dueDate),

  // Full text search index
  titleSearchIdx: index("schedule_events_title_search_idx").on(table.title),
}))

export type ScheduleEvent = typeof scheduleEvents.$inferSelect
export type NewScheduleEvent = typeof scheduleEvents.$inferInsert