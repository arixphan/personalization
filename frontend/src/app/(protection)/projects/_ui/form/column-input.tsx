"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          <Button
            type="button"
            onClick={addColumn}
            variant="outline"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {columns.map((column, index) => (
          <Badge
            variant="outline"
            key={index}
            className="flex items-center space-x-2 px-3 py-2 rounded-md border border-input bg-card/30"
          >
            <span className="text-sm">{column}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeColumn(column)}
              className="h-6 w-6"
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
