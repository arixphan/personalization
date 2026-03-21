"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  id?: string
  label?: string
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
}

export function DatePicker({ id, label, value, onChange, placeholder = "Pick a date", error }: DatePickerProps) {
  // We assume the incoming value is "yyyy-MM" or "yyyy-MM-dd" or empty
  // We'll append "-01" if it's just "YYYY-MM" so Date object parses correctly in local time
  const parseValue = (val?: string) => {
    if (!val) return undefined;
    if (val.length === 7) { 
      // "YYYY-MM"
      const [year, month] = val.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const dateValue = parseValue(value);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"))
    } else {
      onChange("")
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal bg-background h-10 px-3",
              !dateValue && "text-muted-foreground",
              error ? "border-destructive focus-visible:ring-destructive/20" : "border-gray-300 dark:border-gray-800"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? format(dateValue, "MMMM yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0" 
          align="start"
        >
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={handleSelect}
            initialFocus
            className="w-full"
            classNames={{
              root: "w-full",
            }}
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm font-medium text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}
