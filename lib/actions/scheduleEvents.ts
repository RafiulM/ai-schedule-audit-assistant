"use server";

import { db } from "@/db";
import { scheduleEvents } from "@/db/schema";
import { and, desc, asc, eq, like, gte, lte, sql, count, or } from "drizzle-orm";
import { z } from "zod";
import type { NewScheduleEvent } from "@/db/schema";

// Zod schemas for type safety and validation
export const FilterSchema = z.object({
    status: z.enum(["pending", "in_progress", "completed", "cancelled", "postponed"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    category: z.enum(["meeting", "task", "appointment", "reminder", "deadline", "other"]).optional(),
    search: z.string().optional(),
    dateRange: z.object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
    }).optional(),
    sortBy: z.enum(["title", "startTime", "endTime", "priority", "status", "category", "createdAt"]).default("startTime"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
});

export type FilterParams = z.infer<typeof FilterSchema>;

// Response types
export interface ScheduleEventsResponse {
    data: ScheduleEvent[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filters: FilterParams;
}

export interface ScheduleEvent {
    id: string;
    title: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    status: "pending" | "in_progress" | "completed" | "cancelled" | "postponed";
    priority: "low" | "medium" | "high" | "urgent";
    category: "meeting" | "task" | "appointment" | "reminder" | "deadline" | "other";
    location: string | null;
    isVirtual: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Get filtered and paginated schedule events
export async function getScheduleEvents(
    userId: string,
    filters: FilterParams
): Promise<ScheduleEventsResponse> {
    try {
        // Validate filters
        const validatedFilters = FilterSchema.parse(filters);

        // Build base query conditions
        const conditions = [eq(scheduleEvents.userId, userId)];

        // Add filter conditions
        if (validatedFilters.status) {
            conditions.push(eq(scheduleEvents.status, validatedFilters.status));
        }

        if (validatedFilters.priority) {
            conditions.push(eq(scheduleEvents.priority, validatedFilters.priority));
        }

        if (validatedFilters.category) {
            conditions.push(eq(scheduleEvents.category, validatedFilters.category));
        }

        if (validatedFilters.search) {
            const searchTerm = `%${validatedFilters.search}%`;
            conditions.push(
                or(
                    like(scheduleEvents.title, searchTerm),
                    like(scheduleEvents.description, searchTerm || ""),
                    like(scheduleEvents.location, searchTerm || "")
                )
            );
        }

        if (validatedFilters.dateRange) {
            if (validatedFilters.dateRange.from) {
                conditions.push(gte(scheduleEvents.startTime, new Date(validatedFilters.dateRange.from)));
            }
            if (validatedFilters.dateRange.to) {
                conditions.push(lte(scheduleEvents.startTime, new Date(validatedFilters.dateRange.to)));
            }
        }

        // Combine all conditions
        const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

        // Get total count for pagination
        const totalCountResult = await db
            .select({ count: count() })
            .from(scheduleEvents)
            .where(whereCondition);

        const total = totalCountResult[0]?.count || 0;

        // Calculate pagination
        const offset = (validatedFilters.page - 1) * validatedFilters.limit;
        const totalPages = Math.ceil(total / validatedFilters.limit);

        // Build sorting
        const orderByColumn = getOrderByColumn(validatedFilters.sortBy);
        const orderDirection = validatedFilters.sortOrder === "desc" ? desc : asc;
        const orderBy = orderDirection(orderByColumn);

        // Fetch paginated data
        const data = await db
            .select()
            .from(scheduleEvents)
            .where(whereCondition)
            .orderBy(orderBy)
            .limit(validatedFilters.limit)
            .offset(offset);

        return {
            data,
            pagination: {
                page: validatedFilters.page,
                limit: validatedFilters.limit,
                total,
                totalPages,
                hasNext: validatedFilters.page < totalPages,
                hasPrev: validatedFilters.page > 1,
            },
            filters: validatedFilters,
        };
    } catch (error) {
        console.error("Error fetching schedule events:", error);
        throw new Error("Failed to fetch schedule events");
    }
}

// Helper function to get the appropriate column for sorting
function getOrderByColumn(sortBy: string) {
    switch (sortBy) {
        case "title":
            return scheduleEvents.title;
        case "startTime":
            return scheduleEvents.startTime;
        case "endTime":
            return scheduleEvents.endTime;
        case "priority":
            return scheduleEvents.priority;
        case "status":
            return scheduleEvents.status;
        case "category":
            return scheduleEvents.category;
        case "createdAt":
            return scheduleEvents.createdAt;
        default:
            return scheduleEvents.startTime;
    }
}

// Get filter options and counts
export async function getScheduleEventFilters(userId: string) {
    try {
        // Get counts by status
        const statusCounts = await db
            .select({
                status: scheduleEvents.status,
                count: count(),
            })
            .from(scheduleEvents)
            .where(eq(scheduleEvents.userId, userId))
            .groupBy(scheduleEvents.status);

        // Get counts by priority
        const priorityCounts = await db
            .select({
                priority: scheduleEvents.priority,
                count: count(),
            })
            .from(scheduleEvents)
            .where(eq(scheduleEvents.userId, userId))
            .groupBy(scheduleEvents.priority);

        // Get counts by category
        const categoryCounts = await db
            .select({
                category: scheduleEvents.category,
                count: count(),
            })
            .from(scheduleEvents)
            .where(eq(scheduleEvents.userId, userId))
            .groupBy(scheduleEvents.category);

        return {
            status: statusCounts,
            priority: priorityCounts,
            category: categoryCounts,
        };
    } catch (error) {
        console.error("Error fetching schedule event filters:", error);
        throw new Error("Failed to fetch schedule event filters");
    }
}

// Create a new schedule event
export async function createScheduleEvent(
    userId: string,
    data: Omit<NewScheduleEvent, "id" | "userId" | "createdAt" | "updatedAt">
) {
    try {
        const id = crypto.randomUUID();
        const now = new Date();

        const newEvent = {
            id,
            userId,
            ...data,
            createdAt: now,
            updatedAt: now,
        };

        const [createdEvent] = await db
            .insert(scheduleEvents)
            .values(newEvent)
            .returning();

        return createdEvent;
    } catch (error) {
        console.error("Error creating schedule event:", error);
        throw new Error("Failed to create schedule event");
    }
}

// Update a schedule event
export async function updateScheduleEvent(
    userId: string,
    eventId: string,
    data: Partial<Omit<ScheduleEvent, "id" | "userId" | "createdAt" | "updatedAt">>
) {
    try {
        const updatedEvent = {
            ...data,
            updatedAt: new Date(),
        };

        const [event] = await db
            .update(scheduleEvents)
            .set(updatedEvent)
            .where(and(eq(scheduleEvents.id, eventId), eq(scheduleEvents.userId, userId)))
            .returning();

        return event;
    } catch (error) {
        console.error("Error updating schedule event:", error);
        throw new Error("Failed to update schedule event");
    }
}

// Delete a schedule event
export async function deleteScheduleEvent(userId: string, eventId: string) {
    try {
        await db
            .delete(scheduleEvents)
            .where(and(eq(scheduleEvents.id, eventId), eq(scheduleEvents.userId, userId)));

        return { success: true };
    } catch (error) {
        console.error("Error deleting schedule event:", error);
        throw new Error("Failed to delete schedule event");
    }
}