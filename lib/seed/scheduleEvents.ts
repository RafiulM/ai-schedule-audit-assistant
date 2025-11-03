import { db } from "@/db"
import { scheduleEvents } from "@/db/schema"

// Simple mock data generator for development/testing
export async function seedScheduleEvents(count = 20) {
  try {
    const sampleTitles = [
      "Team Meeting", "Code Review", "Project Planning", "Client Presentation",
      "Bug Fix Session", "Feature Development", "Documentation Update",
      "Security Audit", "Performance Testing", "Deployment Planning",
      "User Research", "Design Review", "Sprint Retrospective", "Training Session",
      "Architecture Discussion", "Database Migration", "API Integration",
      "Mobile App Development", "UI/UX Review", "Security Patch"
    ]

    const sampleDescriptions = [
      "Weekly team sync to discuss progress and blockers",
      "Review recent code changes and provide feedback",
      "Plan next sprint and allocate resources",
      "Present project status to key stakeholders",
      "Fix critical bugs reported by QA team",
      "Develop new features based on requirements",
      "Update technical documentation",
      "Conduct security assessment",
      "Test application performance under load",
      "Plan production deployment strategy"
    ]

    const sampleUsers = [
      "John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson",
      "Tom Brown", "Lisa Davis", "Chris Martin", "Amy Taylor",
      "David Lee", "Emma Wilson", "James Taylor", "Olivia Brown"
    ]

    const sampleAudiences = [
      "Development Team", "Product Team", "Stakeholders", "Clients", "All Staff"
    ]

    const sampleLocations = [
      "Conference Room A", "Virtual - Zoom", "Office Space", "Client Office", "Remote"
    ]

    const sampleTags = [
      "important", "urgent", "team", "client", "development", "planning", "review", "testing"
    ]

    const getRandomElement = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
    const getRandomElements = <T,>(arr: T[], min = 1, max = 3) => {
      const count = Math.floor(Math.random() * (max - min + 1)) + min
      const shuffled = [...arr].sort(() => 0.5 - Math.random())
      return shuffled.slice(0, count)
    }

    const mockEvents = Array.from({ length: count }, (_, index) => {
      const hasDueDate = Math.random() > 0.2
      const isCompleted = Math.random() > 0.6
      const daysFromNow = Math.floor(Math.random() * 60) - 15 // -15 to 45 days

      return {
        title: getRandomElement(sampleTitles),
        description: getRandomElement(sampleDescriptions),
        status: getRandomElement(["pending", "in_progress", "completed", "cancelled"]),
        priority: getRandomElement(["low", "medium", "high", "urgent"]),
        assignedTo: getRandomElement(sampleUsers),
        dueDate: hasDueDate ? new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000) : null,
        startDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
        targetAudience: getRandomElement(sampleAudiences),
        location: getRandomElement(sampleLocations),
        tags: getRandomElements(sampleTags),
        isRecurring: Math.random() > 0.8,
        completedAt: isCompleted ? new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000) : null,
      }
    })

    // Insert mock data
    await db.insert(scheduleEvents).values(mockEvents).execute()

    console.log(`✅ Successfully seeded ${count} schedule events`)
    return mockEvents
  } catch (error) {
    console.error("❌ Error seeding schedule events:", error)
    throw error
  }
}

export async function clearScheduleEvents() {
  try {
    await db.delete(scheduleEvents).execute()
    console.log("✅ Cleared all schedule events")
  } catch (error) {
    console.error("❌ Error clearing schedule events:", error)
    throw error
  }
}