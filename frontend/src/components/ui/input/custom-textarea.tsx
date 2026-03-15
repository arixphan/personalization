import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea"; // adjust import if needed

interface CustomTextareaProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  required?: boolean;
  error?: string;
}

export const CustomTextarea: React.FC<CustomTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  required = false,
  error,
}) => {
  const errorId = `${id}-error`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label} {required && "*"}
        </label>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={cn("resize-none", error && "border-destructive focus-visible:ring-destructive/20")}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
