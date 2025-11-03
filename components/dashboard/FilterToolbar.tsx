"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Calendar, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, isAfter, isBefore, isEqual } from "date-fns"

// Date range interface
export interface DateRange {
  from?: Date
  to?: Date
}

// Filter state interfaces
export interface FilterState {
  search: string
  status: string
  sortBy: string
  sortOrder: "asc" | "desc"
  view: "list" | "kanban"
  dateRange?: DateRange
}

export interface FilterToolbarProps {
  onFiltersChange?: (filters: FilterState) => void
  availableStatuses?: string[]
  availableSortFields?: Array<{ value: string; label: string }>
  className?: string
}

const DEFAULT_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "In Process", label: "In Process" },
  { value: "Completed", label: "Completed" },
  { value: "Pending", label: "Pending" },
  { value: "Cancelled", label: "Cancelled" },
]

const DEFAULT_SORT_OPTIONS = [
  { value: "header", label: "Name" },
  { value: "status", label: "Status" },
  { value: "target", label: "Target" },
  { value: "reviewer", label: "Reviewer" },
]

export function FilterToolbar({
  onFiltersChange,
  availableStatuses = DEFAULT_STATUS_OPTIONS.map(s => s.value),
  availableSortFields = DEFAULT_SORT_OPTIONS,
  className,
}: FilterToolbarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parse date range from URL params
  const parseDateRangeFromURL = (): DateRange | undefined => {
    const fromDate = searchParams.get("dateFrom")
    const toDate = searchParams.get("dateTo")

    if (fromDate || toDate) {
      return {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      }
    }
    return undefined
  }

  // Initialize filter state from URL params
  const [filters, setFilters] = React.useState<FilterState>(() => ({
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "all",
    sortBy: searchParams.get("sortBy") || "header",
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
    view: (searchParams.get("view") as "list" | "kanban") || "list",
    dateRange: parseDateRangeFromURL(),
  }))

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 300)

  // Update URL when filters change
  const updateURL = React.useCallback((newFilters: FilterState) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update or remove search param
    if (newFilters.search) {
      params.set("search", newFilters.search)
    } else {
      params.delete("search")
    }

    // Update or remove status param
    if (newFilters.status && newFilters.status !== "all") {
      params.set("status", newFilters.status)
    } else {
      params.delete("status")
    }

    // Update date range params
    if (newFilters.dateRange?.from) {
      params.set("dateFrom", newFilters.dateRange.from.toISOString().split('T')[0])
    } else {
      params.delete("dateFrom")
    }

    if (newFilters.dateRange?.to) {
      params.set("dateTo", newFilters.dateRange.to.toISOString().split('T')[0])
    } else {
      params.delete("dateTo")
    }

    // Update sort params
    params.set("sortBy", newFilters.sortBy)
    params.set("sortOrder", newFilters.sortOrder)

    // Update view param
    if (newFilters.view !== "list") {
      params.set("view", newFilters.view)
    } else {
      params.delete("view")
    }

    // Update URL without full page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }, [searchParams, router])

  // Handle debounced search update
  React.useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch }
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
    updateURL(newFilters)
  }, [debouncedSearch])

  // Handle filter changes
  const handleFilterChange = React.useCallback((
    key: keyof FilterState,
    value: string | FilterState["view"] | FilterState["sortOrder"] | DateRange
  ) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // For non-search filters, update immediately
    if (key !== "search") {
      onFiltersChange?.(newFilters)
      updateURL(newFilters)
    }
  }, [filters, onFiltersChange, updateURL])

  // Handle date range change
  const handleDateRangeChange = React.useCallback((dateRange: DateRange | undefined) => {
    handleFilterChange("dateRange", dateRange || {})
  }, [handleFilterChange])

  // Reset date range
  const resetDateRange = React.useCallback(() => {
    handleFilterChange("dateRange", undefined)
  }, [handleFilterChange])

  // Format date range for display
  const formatDateRangeDisplay = React.useCallback((): string => {
    if (!filters.dateRange) return "Select date range"

    const { from, to } = filters.dateRange

    if (from && to) {
      return `${format(from, "MMM dd, yyyy")} - ${format(to, "MMM dd, yyyy")}`
    }

    if (from) {
      return `From ${format(from, "MMM dd, yyyy")}`
    }

    if (to) {
      return `Until ${format(to, "MMM dd, yyyy")}`
    }

    return "Select date range"
  }, [filters.dateRange])

  // Handle sort change
  const handleSortChange = React.useCallback((value: string) => {
    const [field, order] = value.split("-")
    handleFilterChange("sortBy", field)
    handleFilterChange("sortOrder", order as "asc" | "desc")
  }, [handleFilterChange])

  // Get current sort value for select
  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`

  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className || ""}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          className="pl-9"
          aria-label="Search events"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
          aria-label="Filter by status"
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {DEFAULT_STATUS_OPTIONS.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Date Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`w-[180px] justify-start text-left font-normal ${
                !filters.dateRange?.from && !filters.dateRange?.to ? "text-muted-foreground" : ""
              }`}
              aria-label="Select date range"
            >
              <Calendar className="mr-2 h-4 w-4" />
              {formatDateRangeDisplay()}
              {filters.dateRange && (
                <X
                  className="ml-auto h-4 w-4 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetDateRange()
                  }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-2">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Date Range</h4>
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: filters.dateRange?.from,
                    to: filters.dateRange?.to,
                  }}
                  onSelect={(range) => {
                    if (range) {
                      // Validate date range
                      if (range.from && range.to && isAfter(range.from, range.to)) {
                        // Swap dates if from is after to
                        handleDateRangeChange({
                          from: range.to,
                          to: range.from,
                        })
                      } else {
                        handleDateRangeChange(range)
                      }
                    } else {
                      handleDateRangeChange(undefined)
                    }
                  }}
                  numberOfMonths={2}
                  defaultMonth={filters.dateRange?.from || new Date()}
                />
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDateRange}
                  className="flex-1"
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    // Set common presets
                    const today = new Date()
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    handleDateRangeChange({
                      from: lastWeek,
                      to: today,
                    })
                  }}
                  className="flex-1"
                >
                  Last 7 Days
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Sort Options */}
        <Select
          value={currentSortValue}
          onValueChange={handleSortChange}
          aria-label="Sort by"
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {availableSortFields.map((field) => (
              <SelectItem key={`${field.value}-asc`} value={`${field.value}-asc`}>
                {field.label} (A-Z)
              </SelectItem>
              <SelectItem key={`${field.value}-desc`} value={`${field.value}-desc`}>
                {field.label} (Z-A)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* View Toggle */}
        <ToggleGroup
          type="single"
          value={filters.view}
          onValueChange={(value) => value && handleFilterChange("view", value as "list" | "kanban")}
          aria-label="View mode"
        >
          <ToggleGroupItem value="list" aria-label="List view">
            List
          </ToggleGroupItem>
          <ToggleGroupItem value="kanban" aria-label="Kanban view">
            Kanban
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  )
}