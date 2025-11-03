"use server"

import { db } from "@/db"
import { scheduleEvents, type ScheduleEvent } from "@/db/schema"
import { and, desc, asc, ilike, gte, lte, or, isNull, eq } from "drizzle-orm"
import { z } from "zod"

// Zod schema for validating filter parameters
const FilterParamsSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export type FilterParams = z.infer<typeof FilterParamsSchema>

export type ScheduleEventsResult = {
  events: ScheduleEvent[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Fetches schedule events with dynamic filtering, sorting, and pagination
 *
 * @param params - Filter and pagination parameters
 * @returns Promise resolving to filtered events and pagination info
 */
export async function getScheduleEvents(params: FilterParams): Promise<ScheduleEventsResult> {
  try {
    // Validate and parse input parameters
    const validatedParams = FilterParamsSchema.parse(params)

    // Build where conditions dynamically
    const whereConditions = []

    // Text search (searches in title and description)
    if (validatedParams.search && validatedParams.search.trim()) {
      const searchTerm = `%${validatedParams.search.trim()}%`
      whereConditions.push(
        or(
          ilike(scheduleEvents.title, searchTerm),
          ilike(scheduleEvents.description, searchTerm)
        )
      )
    }

    // Status filter
    if (validatedParams.status && validatedParams.status !== "all") {
      whereConditions.push(eq(scheduleEvents.status, validatedParams.status))
    }

    // Priority filter
    if (validatedParams.priority && validatedParams.priority !== "all") {
      whereConditions.push(eq(scheduleEvents.priority, validatedParams.priority))
    }

    // Assigned to filter
    if (validatedParams.assignedTo && validatedParams.assignedTo !== "all") {
      whereConditions.push(eq(scheduleEvents.assignedTo, validatedParams.assignedTo))
    }

    // Date range filter
    if (validatedParams.dateFrom || validatedParams.dateTo) {
      const dateConditions = []

      if (validatedParams.dateFrom) {
        dateConditions.push(gte(scheduleEvents.dueDate, new Date(validatedParams.dateFrom)))
      }

      if (validatedParams.dateTo) {
        dateConditions.push(lte(scheduleEvents.dueDate, new Date(validatedParams.dateTo)))
      }

      // If either date is specified, include events with null due dates OR those matching the criteria
      if (dateConditions.length > 0) {
        whereConditions.push(
          or(
            isNull(scheduleEvents.dueDate),
            ...dateConditions
          )
        )
      }
    }

    // Combine all conditions
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined

    // Build order by clause dynamically
    let orderByClause
    const sortField = validatedParams.sortBy
    const sortDirection = validatedParams.sortOrder === "asc" ? asc : desc

    // Map sort field to database column
    switch (sortField) {
      case "title":
        orderByClause = sortDirection(scheduleEvents.title)
        break
      case "status":
        orderByClause = sortDirection(scheduleEvents.status)
        break
      case "priority":
        orderByClause = sortDirection(scheduleEvents.priority)
        break
      case "dueDate":
        orderByClause = sortDirection(scheduleEvents.dueDate)
        break
      case "assignedTo":
        orderByClause = sortDirection(scheduleEvents.assignedTo)
        break
      case "createdAt":
      default:
        orderByClause = sortDirection(scheduleEvents.createdAt)
        break
    }

    // Calculate pagination
    const offset = (validatedParams.page - 1) * validatedParams.pageSize

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: scheduleEvents.id })
      .from(scheduleEvents)
      .where(whereClause)
      .execute()

    // Fetch paginated results
    const events = await db
      .select()
      .from(scheduleEvents)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(validatedParams.pageSize)
      .offset(offset)
      .execute()

    // Calculate pagination metadata
    const total = Number(count)
    const totalPages = Math.ceil(total / validatedParams.pageSize)

    const pagination = {
      page: validatedParams.page,
      pageSize: validatedParams.pageSize,
      total,
      totalPages,
      hasNext: validatedParams.page < totalPages,
      hasPrev: validatedParams.page > 1,
    }

    return {
      events,
      pagination,
    }
  } catch (error) {
    console.error("Error fetching schedule events:", error)

    // Return empty result on error
    return {
      events: [],
      pagination: {
        page: 1,
        pageSize: validatedParams?.pageSize || 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    }
  }
}

/**
 * Get distinct values for filter dropdowns (e.g., status, priority, assignedTo)
 *
 * @returns Promise resolving to available filter options
 */
export async function getScheduleEventFilters() {
  try {
    // Get distinct statuses
    const statuses = await db
      .selectDistinct({ status: scheduleEvents.status })
      .from(scheduleEvents)
      .execute()

    // Get distinct priorities
    const priorities = await db
      .selectDistinct({ priority: scheduleEvents.priority })
      .from(scheduleEvents)
      .execute()

    // Get distinct assigned users
    const assignedUsers = await db
      .selectDistinct({ assignedTo: scheduleEvents.assignedTo })
      .from(scheduleEvents)
      .where(scheduleEvents.assignedTo.isNotNull())
      .execute()

    return {
      statuses: statuses.map(s => s.status).filter(Boolean),
      priorities: priorities.map(p => p.priority).filter(Boolean),
      assignedUsers: assignedUsers.map(u => u.assignedTo).filter(Boolean),
    }
  } catch (error) {
    console.error("Error fetching schedule event filters:", error)
    return {
      statuses: [],
      priorities: [],
      assignedUsers: [],
    }
  }
}

/**
 * Get a single schedule event by ID
 *
 * @param id - The event ID
 * @returns Promise resolving to the event or null if not found
 */
export async function getScheduleEventById(id: string): Promise<ScheduleEvent | null> {
  try {
    const [event] = await db
      .select()
      .from(scheduleEvents)
      .where(eq(scheduleEvents.id, id))
      .execute()

    return event || null
  } catch (error) {
    console.error("Error fetching schedule event:", error)
    return null
  }
}