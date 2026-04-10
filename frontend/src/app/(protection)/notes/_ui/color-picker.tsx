"use client";

import { cn } from "@/lib/utils";

const PALETTE = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Violet" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Emerald" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#ef4444", label: "Red" },
  { value: "#64748b", label: "Slate" },
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PALETTE.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.label}
          onClick={() => onChange(color.value)}
          className={cn(
            "w-6 h-6 rounded-full transition-all duration-200 ring-offset-2 ring-offset-background hover:scale-110",
            value === color.value
              ? "ring-2 scale-110"
              : "ring-0 opacity-70 hover:opacity-100",
          )}
          style={{
            backgroundColor: color.value,
          }}
        />
      ))}
    </div>
  );
};
