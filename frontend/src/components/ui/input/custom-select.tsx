import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust import based on your actual setup
import { useMemo } from "react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export interface CustomSelectProps {
  id: string;
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  options: SelectOption[] | string[]; // Accepts both string arrays and objects with value/label
  error?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  options,
  error,
}) => {
  const errorId = `${id}-error`;

  const formattedOptions = useMemo(() => {
    if (
      Array.isArray(options) &&
      options.length > 0 &&
      typeof options[0] === "object"
    ) {
      // If options are objects with value/label
      return (options as SelectOption[]).map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ));
    }
    // If options are string[]
    return (options as string[]).map((option) => (
      <SelectItem key={option} value={option}>
        {option}
      </SelectItem>
    ));
  }, [options]);

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label} {required && "*"}
        </label>
      )}
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "w-full px-3 py-2 rounded-md border transition-colors text-md focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
            error ? "border-destructive focus-visible:ring-destructive/20" : "border-gray-300 dark:border-gray-800"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {formattedOptions}
        </SelectContent>
      </Select>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
