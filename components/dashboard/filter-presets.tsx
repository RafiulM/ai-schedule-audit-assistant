"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusIcon, SaveIcon, TrashIcon, StarIcon } from "lucide-react";
import type { FilterState } from "./task-filters";

export interface FilterPreset {
    id: string;
    name: string;
    description?: string;
    filters: FilterState;
    isDefault?: boolean;
    createdAt: string;
}

interface FilterPresetsProps {
    currentFilters: FilterState;
    onLoadPreset: (preset: FilterPreset) => void;
    onApplyFilters: (filters: FilterState) => void;
}

const STORAGE_KEY = "schedule-filter-presets";

export function FilterPresets({ currentFilters, onLoadPreset, onApplyFilters }: FilterPresetsProps) {
    const [presets, setPresets] = useState<FilterPreset[]>([]);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");
    const [newPresetDescription, setNewPresetDescription] = useState("");

    // Load presets from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsedPresets = JSON.parse(stored);
                setPresets(parsedPresets);
            }
        } catch (error) {
            console.error("Error loading filter presets:", error);
        }
    }, []);

    // Save presets to localStorage whenever they change
    useEffect(() => {
        try {
            if (presets.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
            }
        } catch (error) {
            console.error("Error saving filter presets:", error);
        }
    }, [presets]);

    // Save current filters as a preset
    const savePreset = () => {
        if (!newPresetName.trim()) return;

        const newPreset: FilterPreset = {
            id: crypto.randomUUID(),
            name: newPresetName.trim(),
            description: newPresetDescription.trim() || undefined,
            filters: { ...currentFilters },
            createdAt: new Date().toISOString(),
        };

        setPresets([...presets, newPreset]);
        setNewPresetName("");
        setNewPresetDescription("");
        setIsSaveDialogOpen(false);
    };

    // Delete a preset
    const deletePreset = (presetId: string) => {
        setPresets(presets.filter(p => p.id !== presetId));
    };

    // Set a preset as default
    const setDefaultPreset = (presetId: string) => {
        setPresets(presets.map(p => ({ ...p, isDefault: p.id === presetId })));
    };

    // Get a human-readable description of the filters
    const getFilterDescription = (filters: FilterState): string => {
        const parts = [];

        if (filters.status) parts.push(`Status: ${filters.status}`);
        if (filters.priority) parts.push(`Priority: ${filters.priority}`);
        if (filters.category) parts.push(`Category: ${filters.category}`);
        if (filters.search) parts.push(`Search: "${filters.search}"`);
        if (filters.dateRange?.from || filters.dateRange?.to) {
            const from = filters.dateRange?.from ? new Date(filters.dateRange.from).toLocaleDateString() : "Any";
            const to = filters.dateRange?.to ? new Date(filters.dateRange.to).toLocaleDateString() : "Any";
            parts.push(`Date: ${from} - ${to}`);
        }
        if (filters.sortBy !== "startTime" || filters.sortOrder !== "asc") {
            parts.push(`Sort: ${filters.sortBy} ${filters.sortOrder}`);
        }

        return parts.length > 0 ? parts.join(", ") : "No filters applied";
    };

    // Check if current filters match any preset
    const hasUnsavedChanges = () => {
        return !presets.some(preset => {
            const presetFilters = preset.filters;
            return JSON.stringify(presetFilters) === JSON.stringify(currentFilters);
        });
    };

    return (
        <div className="flex items-center gap-2">
            {/* Load Preset Dropdown */}
            {presets.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1">
                            <StarIcon className="h-4 w-4" />
                            Load Preset
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-80">
                        <DropdownMenuLabel>Saved Filter Presets</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {presets.map((preset) => (
                            <div key={preset.id} className="group">
                                <DropdownMenuItem
                                    onClick={() => onLoadPreset(preset)}
                                    className="flex flex-col items-start p-3 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <span className="font-medium">{preset.name}</span>
                                        {preset.isDefault && (
                                            <Badge variant="secondary" className="text-xs">
                                                Default
                                            </Badge>
                                        )}
                                    </div>
                                    {preset.description && (
                                        <span className="text-sm text-muted-foreground">
                                            {preset.description}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground mt-1">
                                        {getFilterDescription(preset.filters)}
                                    </span>
                                </DropdownMenuItem>
                                <div className="flex gap-1 px-2 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setDefaultPreset(preset.id)}
                                        className="h-6 px-2 text-xs"
                                    >
                                        {preset.isDefault ? "Default" : "Set Default"}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletePreset(preset.id)}
                                        className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                    >
                                        <TrashIcon className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Save Current Filters */}
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        disabled={!hasUnsavedChanges()}
                    >
                        <SaveIcon className="h-4 w-4" />
                        Save Preset
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Save Filter Preset</DialogTitle>
                        <DialogDescription>
                            Save your current filter configuration as a preset for quick access later.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="preset-name" className="text-sm font-medium">
                                Preset Name *
                            </label>
                            <Input
                                id="preset-name"
                                value={newPresetName}
                                onChange={(e) => setNewPresetName(e.target.value)}
                                placeholder="e.g., High Priority Tasks"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label htmlFor="preset-description" className="text-sm font-medium">
                                Description (optional)
                            </label>
                            <Input
                                id="preset-description"
                                value={newPresetDescription}
                                onChange={(e) => setNewPresetDescription(e.target.value)}
                                placeholder="Brief description of this filter preset"
                                className="mt-1"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            <strong>Current filters:</strong>
                            <div className="mt-1">{getFilterDescription(currentFilters)}</div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={savePreset}
                                disabled={!newPresetName.trim()}
                            >
                                Save Preset
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Quick Apply Common Presets */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                        Quick Filters
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Quick Filters</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onApplyFilters({
                        ...currentFilters,
                        status: "pending",
                        priority: "high",
                        sortBy: "startTime",
                        sortOrder: "asc"
                    })}>
                        High Priority Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplyFilters({
                        ...currentFilters,
                        status: "in_progress",
                        sortBy: "startTime",
                        sortOrder: "asc"
                    })}>
                        In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplyFilters({
                        ...currentFilters,
                        dateRange: {
                            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                            to: new Date().toISOString()
                        },
                        sortBy: "startTime",
                        sortOrder: "desc"
                    })}>
                        This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplyFilters({
                        ...currentFilters,
                        dateRange: {
                            from: new Date().toISOString(),
                            to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        },
                        sortBy: "startTime",
                        sortOrder: "asc"
                    })}>
                        Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onApplyFilters({
                        ...currentFilters,
                        category: "deadline",
                        status: "pending",
                        sortBy: "startTime",
                        sortOrder: "asc"
                    })}>
                        Upcoming Deadlines
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}