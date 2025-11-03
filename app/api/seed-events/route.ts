import { NextRequest, NextResponse } from "next/server"
import { seedScheduleEvents, clearScheduleEvents } from "@/lib/seed/scheduleEvents"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, count = 20 } = body

    if (action === "seed") {
      await seedScheduleEvents(count)
      return NextResponse.json({
        success: true,
        message: `Successfully seeded ${count} schedule events`
      })
    } else if (action === "clear") {
      await clearScheduleEvents()
      return NextResponse.json({
        success: true,
        message: "Successfully cleared all schedule events"
      })
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action. Use 'seed' or 'clear'." },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error in seed API:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}