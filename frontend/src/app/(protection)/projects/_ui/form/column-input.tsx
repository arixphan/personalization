"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { Badge } from "@/components/ui/badge";

interface ColumnInputProps {
  columns: string[];
  onColumnsChange: (columns: string[]) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const ColumnInput = ({
  columns,
  onColumnsChange,
  placeholder = "Add new column",
  maxLength = 100,
  className = "",
}: ColumnInputProps) => {
  const [newColumn, setNewColumn] = useState("");

  const addColumn = () => {
    if (newColumn.trim() && !columns.includes(newColumn.trim())) {
      onColumnsChange([...columns, newColumn.trim()]);
      setNewColumn("");
    }
  };

  const removeColumn = (columnToRemove: string) => {
    onColumnsChange(columns.filter((col) => col !== columnToRemove));
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newColumn}
            onChange={(e) => setNewColumn(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addColumn())
            }
            maxLength={maxLength}
          />
          <button
            type="button"
            onClick={addColumn}
            className="px-4 py-2 border rounded-md transition-colors border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {columns.map((column, index) => (
          <Badge
            variant="outline"
            key={index}
            className="flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800"
          >
            <span className="text-sm">{column}</span>
            <button
              type="button"
              onClick={() => removeColumn(column)}
              className="text-xs dark:hover:text-gray-300 hover:text-gray-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
