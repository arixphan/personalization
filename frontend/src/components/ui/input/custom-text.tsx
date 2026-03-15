import { Input } from "./input";

interface CustomInputProps {
  id: string;
  label?: string; // Now optional
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string; // Optional className for additional styling
}

export const CustomInput: React.FC<CustomInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "",
}) => {
  const errorId = `${id}-error`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-2">
          {label} {required && "*"}
        </label>
      )}
      <Input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={className}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
