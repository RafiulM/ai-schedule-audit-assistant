"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    FilterIcon,
    XIcon,
    SortAscIcon,
    SortDescIcon
} from "lucide-react";

// TypeScript interfaces for filter state
export interface FilterState {
    status: string;
    priority: string;
    category: string;
    search: string;
    dateRange?: DateRange;
    sortBy: string;
    sortOrder: "asc" | "desc";
}

export interface TaskFiltersProps {
    initialFilters?: Partial<FilterState>;
    onFiltersChange?: (filters: FilterState) => void;
    className?: string;
}

// Filter options
const STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "postponed", label: "Postponed" },
];

const PRIORITY_OPTIONS = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];

const CATEGORY_OPTIONS = [
    { value: "meeting", label: "Meeting" },
    { value: "task", label: "Task" },
    { value: "appointment", label: "Appointment" },
    { value: "reminder", label: "Reminder" },
    { value: "deadline", label: "Deadline" },
    { value: "other", label: "Other" },
];

const SORT_OPTIONS = [
    { value: "startTime", label: "Start Time" },
    { value: "title", label: "Title" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
    { value: "category", label: "Category" },
    { value: "createdAt", label: "Created Date" },
];

// Helper function to convert filters to URL params
const filtersToSearchParams = (filters: FilterState): URLSearchParams => {
    const params = new URLSearchParams();

    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.category) params.set("category", filters.category);
    if (filters.search) params.set("search", filters.search);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters.dateRange?.from) {
        params.set("dateFrom", filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
        params.set("dateTo", filters.dateRange.to.toISOString());
    }

    return params;
};

// Helper function to parse URL params to filters
const searchParamsToFilters = (searchParams: URLSearchParams): FilterState => {
    return {
        status: searchParams.get("status") || "",
        priority: searchParams.get("priority") || "",
        category: searchParams.get("category") || "",
        search: searchParams.get("search") || "",
        sortBy: searchParams.get("sortBy") || "startTime",
        sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "asc",
        dateRange: searchParams.get("dateFrom") || searchParams.get("dateTo")
            ? {
                from: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
                to: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
            }
            : undefined,
    };
};

export function TaskFilters({ initialFilters, onFiltersChange, className }: TaskFiltersProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(true);
    const [filters, setFilters] = useState<FilterState>(() => {
        const urlFilters = searchParamsToFilters(searchParams);
        return { ...urlFilters, ...initialFilters };
    });

    // Debounced search function
    const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filters.search !== debouncedSearch) {
                updateFilters({ ...filters, search: debouncedSearch });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Update URL and call onFiltersChange
    const updateFilters = useCallback((newFilters: FilterState) => {
        setFilters(newFilters);

        // Update URL
        const params = filtersToSearchParams(newFilters);
        const queryString = params.toString();
        const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
        router.push(newUrl, { scroll: false });

        // Call callback
        onFiltersChange?.(newFilters);
    }, [router, pathname, onFiltersChange]);

    // Clear all filters
    const clearFilters = () => {
        const clearedFilters: FilterState = {
            status: "",
            priority: "",
            category: "",
            search: "",
            sortBy: "startTime",
            sortOrder: "asc",
            dateRange: undefined,
        };
        updateFilters(clearedFilters);
        setDebouncedSearch("");
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.status) count++;
        if (filters.priority) count++;
        if (filters.category) count++;
        if (filters.search) count++;
        if (filters.dateRange?.from || filters.dateRange?.to) count++;
        if (filters.sortBy !== "startTime" || filters.sortOrder !== "asc") count++;
        return count;
    };

    // Handle individual filter updates
    const handleStatusChange = (value: string) => {
        updateFilters({ ...filters, status: value });
    };

    const handlePriorityChange = (value: string) => {
        updateFilters({ ...filters, priority: value });
    };

    const handleCategoryChange = (value: string) => {
        updateFilters({ ...filters, category: value });
    };

    const handleSearchChange = (value: string) => {
        setDebouncedSearch(value);
    };

    const handleDateRangeChange = (dateRange: DateRange | undefined) => {
        updateFilters({ ...filters, dateRange });
    };

    const handleSortChange = (sortBy: string, sortOrder: "asc" | "desc") => {
        updateFilters({ ...filters, sortBy, sortOrder });
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <div className={className}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between mb-4"
                        aria-label="Toggle filter visibility"
                    >
                        <div className="flex items-center gap-2">
                            <FilterIcon className="h-4 w-4" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </div>
                        {isOpen ? (
                            <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4">
                    {/* Search Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="search-input">
                            Search
                        </label>
                        <Input
                            id="search-input"
                            placeholder="Search title, description, or location..."
                            value={debouncedSearch}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            aria-label="Search events"
                        />
                    </div>

                    <Separator />

                    {/* Filter Row - Desktop */}
                    <div className="hidden lg:grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="status-select">
                                Status
                            </label>
                            <Select value={filters.status} onValueChange={handleStatusChange}>
                                <SelectTrigger id="status-select" aria-label="Select status">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All statuses</SelectItem>
                                    {STATUS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="priority-select">
                                Priority
                            </label>
                            <Select value={filters.priority} onValueChange={handlePriorityChange}>
                                <SelectTrigger id="priority-select" aria-label="Select priority">
                                    <SelectValue placeholder="All priorities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All priorities</SelectItem>
                                    {PRIORITY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="category-select">
                                Category
                            </label>
                            <Select value={filters.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger id="category-select" aria-label="Select category">
                                    <SelectValue placeholder="All categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All categories</SelectItem>
                                    {CATEGORY_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Filter Row - Mobile */}
                    <div className="lg:hidden space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="status-select-mobile">
                                    Status
                                </label>
                                <Select value={filters.status} onValueChange={handleStatusChange}>
                                    <SelectTrigger id="status-select-mobile" aria-label="Select status">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All statuses</SelectItem>
                                        {STATUS_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="priority-select-mobile">
                                    Priority
                                </label>
                                <Select value={filters.priority} onValueChange={handlePriorityChange}>
                                    <SelectTrigger id="priority-select-mobile" aria-label="Select priority">
                                        <SelectValue placeholder="All priorities" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All priorities</SelectItem>
                                        {PRIORITY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="category-select-mobile">
                                    Category
                                </label>
                                <Select value={filters.category} onValueChange={handleCategoryChange}>
                                    <SelectTrigger id="category-select-mobile" aria-label="Select category">
                                        <SelectValue placeholder="All categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All categories</SelectItem>
                                        {CATEGORY_OPTIONS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Date Range and Sort Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Date Range Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Date Range
                            </label>
                            <DatePickerWithRange
                                value={filters.dateRange}
                                onChange={handleDateRangeChange}
                                placeholder="Select date range"
                            />
                        </div>

                        {/* Sort Dropdown */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Sort By
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        aria-label="Sort options"
                                    >
                                        <span>
                                            {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label ||
                                             "Start Time"}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            {filters.sortOrder === "asc" ? (
                                                <SortAscIcon className="h-4 w-4" />
                                            ) : (
                                                <SortDescIcon className="h-4 w-4" />
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="start">
                                    <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {SORT_OPTIONS.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => handleSortChange(option.value, filters.sortOrder)}
                                            className="flex justify-between"
                                        >
                                            <span>{option.label}</span>
                                            {filters.sortBy === option.value && (
                                                <span className="text-muted-foreground">
                                                    {filters.sortOrder === "asc" ? "↑" : "↓"}
                                                </span>
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => handleSortChange(filters.sortBy, filters.sortOrder === "asc" ? "desc" : "asc")}
                                    >
                                        Toggle Sort Direction
                                        <span className="ml-auto">
                                            {filters.sortOrder === "asc" ? "↓" : "↑"}
                                        </span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Separator />

                    {/* Active Filters and Clear Button */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-wrap gap-2 flex-1">
                            {filters.status && (
                                <Badge variant="default" className="gap-1">
                                    Status: {STATUS_OPTIONS.find(opt => opt.value === filters.status)?.label}
                                    <button
                                        onClick={() => handleStatusChange("")}
                                        className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                        aria-label="Remove status filter"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.priority && (
                                <Badge variant="default" className="gap-1">
                                    Priority: {PRIORITY_OPTIONS.find(opt => opt.value === filters.priority)?.label}
                                    <button
                                        onClick={() => handlePriorityChange("")}
                                        className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                        aria-label="Remove priority filter"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.category && (
                                <Badge variant="default" className="gap-1">
                                    Category: {CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label}
                                    <button
                                        onClick={() => handleCategoryChange("")}
                                        className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                        aria-label="Remove category filter"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.search && (
                                <Badge variant="default" className="gap-1">
                                    Search: "{filters.search}"
                                    <button
                                        onClick={() => handleSearchChange("")}
                                        className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                        aria-label="Remove search filter"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                            {filters.dateRange && (
                                <Badge variant="default" className="gap-1">
                                    Date: {filters.dateRange.from ? format(filters.dateRange.from, "MMM dd") : ""}
                                    {filters.dateRange.from && filters.dateRange.to && " - "}
                                    {filters.dateRange.to ? format(filters.dateRange.to, "MMM dd") : ""}
                                    <button
                                        onClick={() => handleDateRangeChange(undefined)}
                                        className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                                        aria-label="Remove date range filter"
                                    >
                                        <XIcon className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>

                        {activeFilterCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="gap-1"
                                aria-label="Clear all filters"
                            >
                                <XIcon className="h-4 w-4" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}