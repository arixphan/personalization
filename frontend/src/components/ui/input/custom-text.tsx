import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CustomInputProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  id: string;
  label?: string; // Now optional
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  error?: string;
  isCurrency?: boolean;
}

export const CustomInput: React.FC<CustomInputProps> = ({
  id,
  label,
  value,
  onChange,
  className = "",
  icon,
  error,
  required,
  isCurrency,
  ...props
}) => {
  const errorId = `${id}-error`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2 dark:text-gray-300">
          {label} {required && "*"}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </div>
        )}
        <Input
          id={id}
          value={isCurrency && value ? Number(value.toString().replace(/[^0-9-]/g, '')).toLocaleString('en-US') : value}
          onChange={(e) => {
             if (isCurrency) {
                const raw = e.target.value.replace(/[^0-9-]/g, '');
                onChange(raw);
             } else {
                onChange(e.target.value);
             }
          }}
          type={isCurrency ? "text" : props.type}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(icon ? "pl-10" : "", className)}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500 font-medium">
          {error}
        </p>
      )}
    </div>
  );
};
