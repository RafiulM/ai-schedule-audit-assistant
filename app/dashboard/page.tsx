import { Suspense } from "react"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { FilterToolbar, type FilterState } from "@/components/dashboard/FilterToolbar"
import { ScheduleEventsList } from "@/components/dashboard/ScheduleEventsList"
import { ScheduleEventsPagination } from "@/components/dashboard/ScheduleEventsPagination"
import { getScheduleEvents } from "@/lib/actions/scheduleEvents"
import data from "@/app/dashboard/data.json"

// Server component for the main dashboard content
async function ScheduleEventsContent({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Convert searchParams to proper filter format
  const filters = {
    search: searchParams.search as string || "",
    status: searchParams.status as string || "all",
    priority: searchParams.priority as string || "all",
    assignedTo: searchParams.assignedTo as string || "all",
    dateFrom: searchParams.dateFrom as string || "",
    dateTo: searchParams.dateTo as string || "",
    sortBy: searchParams.sortBy as string || "createdAt",
    sortOrder: (searchParams.sortOrder as string) || "desc",
    page: parseInt(searchParams.page as string) || 1,
    pageSize: parseInt(searchParams.pageSize as string) || 10,
  }

  try {
    const result = await getScheduleEvents(filters)

    return (
      <div className="space-y-6">
        {/* Results summary */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Schedule Events {result.pagination.total > 0 && `(${result.pagination.total})`}
          </h2>
        </div>

        {/* Events list */}
        <ScheduleEventsList events={result.events} />

        {/* Pagination */}
        <ScheduleEventsPagination pagination={result.pagination} />
      </div>
    )
  } catch (error) {
    console.error("Error loading schedule events:", error)
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error loading events
        </h3>
        <p className="text-muted-foreground max-w-md">
          There was a problem loading the schedule events. Please try again later.
        </p>
      </div>
    )
  }
}

// Loading component for Suspense
function ScheduleEventsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
      </div>
      <ScheduleEventsList isLoading />
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>

        {/* Schedule Events Section */}
        <div className="px-4 lg:px-6 space-y-6">
          {/* Filter Toolbar */}
          <FilterToolbar />

          {/* Schedule Events Content with Suspense for loading states */}
          <Suspense fallback={<ScheduleEventsLoading />}>
            <ScheduleEventsContent searchParams={searchParams} />
          </Suspense>
        </div>

        {/* Legacy DataTable for demonstration */}
        {/* <DataTable data={data} /> */}
      </div>
    </div>
  )
}