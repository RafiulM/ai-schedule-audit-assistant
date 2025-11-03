"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, XCircle, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const multiSelectVariants = cva(
    "m-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-foreground/10 bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted-colors"
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface MultiSelectProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof multiSelectVariants> {
    options: {
        label: string;
        value: string;
    }[];
    selected: string[];
    onSelectedChange: (selected: string[]) => void;
    placeholder?: string;
    maxCount?: number;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onSelectedChange,
    placeholder = "Select options",
    maxCount,
    variant,
    className,
    ...props
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onSelectedChange(selected.filter((i) => i !== item));
    };

    const handleSelect = (value: string) => {
        const isAlreadySelected = selected.includes(value);

        if (isAlreadySelected) {
            onSelectedChange(selected.filter((item) => item !== value));
        } else {
            if (maxCount && selected.length >= maxCount) {
                // Remove the first item if max count is reached
                const newSelected = [...selected.slice(1), value];
                onSelectedChange(newSelected);
            } else {
                onSelectedChange([...selected, value]);
            }
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    {...props}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 ? (
                            <span className="text-muted-foreground">{placeholder}</span>
                        ) : (
                            selected.map((item) => (
                                <Badge
                                    key={item}
                                    variant={variant}
                                    className={multiSelectVariants({ variant })}
                                >
                                    {options.find((option) => option.value === item)?.label || item}
                                    <XCircle
                                        className="ml-2 h-3 w-3 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(item);
                                        }}
                                    />
                                </Badge>
                            ))
                        )}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search options..." />
                    <CommandList>
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        value={option.value}
                                        onSelect={() => handleSelect(option.value)}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {option.label}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}