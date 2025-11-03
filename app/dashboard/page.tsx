import { Suspense } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { TaskFilters, type FilterState } from "@/components/dashboard/task-filters"
import { getScheduleEvents, FilterSchema } from "@/lib/actions/scheduleEvents"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for filters
function TaskFiltersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

// Loading component for data table
function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Component to handle the filtered data fetching
async function FilteredScheduleEvents({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  try {
    // Parse and validate search parameters
    const validatedParams = FilterSchema.parse({
      status: searchParams.status,
      priority: searchParams.priority,
      category: searchParams.category,
      search: searchParams.search,
      dateRange: {
        from: searchParams.dateFrom,
        to: searchParams.dateTo,
      },
      sortBy: searchParams.sortBy || "startTime",
      sortOrder: searchParams.sortOrder || "asc",
      page: parseInt(searchParams.page as string) || 1,
      limit: parseInt(searchParams.limit as string) || 20,
    });

    // Mock user ID for now - in a real app, this would come from authentication
    const userId = "user-123"; // This should come from your auth system

    // Fetch filtered schedule events
    const result = await getScheduleEvents(userId, validatedParams);

    // Transform the data to match the expected DataTable format
    const transformedData = result.data.map((event) => ({
      id: event.id,
      header: event.title,
      type: event.category,
      status: event.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      target: format(new Date(event.startTime), "MMM dd, yyyy"),
      limit: event.priority,
      reviewer: event.location || "N/A",
    }));

    return (
      <div className="space-y-6">
        <div className="px-4 lg:px-6">
          <TaskFilters
            onFiltersChange={(filters: FilterState) => {
              // The TaskFilters component already handles URL updates
              // This callback can be used for additional side effects if needed
            }}
          />
        </div>

        <div className="px-4 lg:px-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">
              Schedule Events ({result.pagination.total})
            </h2>
            {result.pagination.total > 0 && (
              <p className="text-sm text-muted-foreground">
                Showing {Math.min(result.pagination.limit, result.data.length)} of {result.pagination.total} events
                {result.pagination.totalPages > 1 && (
                  <> (Page {result.pagination.page} of {result.pagination.totalPages})</>
                )}
              </p>
            )}
          </div>

          {result.data.length > 0 ? (
            <DataTable data={transformedData} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-muted-foreground">No schedule events found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your filters or create a new schedule event.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading schedule events:", error);
    return (
      <div className="px-4 lg:px-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-destructive">Error loading schedule events</h3>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
        </div>
      </div>
    );
  }
}

// Helper function to format dates
function format(date: Date, formatStr: string): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />

        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>

        <Suspense fallback={<TaskFiltersSkeleton />}>
          <FilteredScheduleEvents searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}