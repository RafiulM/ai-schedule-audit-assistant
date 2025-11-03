export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  // Additional fields that might be needed
  targetAudience?: string
  location?: string
  isRecurring?: boolean
}

export interface ScheduleEventFilters {
  search: string
  status: string
  priority?: string
  assignedTo?: string
  dateRange?: {
    start?: string
    end?: string
  }
  sortBy: string
  sortOrder: "asc" | "desc"
  view: "list" | "kanban"
}

export interface ScheduleEventFormData {
  title: string
  description?: string
  status: ScheduleEvent["status"]
  priority: ScheduleEvent["priority"]
  assignedTo?: string
  dueDate?: string
  tags?: string[]
  targetAudience?: string
  location?: string
  isRecurring?: boolean
}