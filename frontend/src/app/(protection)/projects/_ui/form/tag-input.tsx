"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  predefinedTags?: string[];
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const TagInput = ({
  tags,
  onTagsChange,
  predefinedTags = [],
  placeholder = "Add tag",
  maxLength = 100,
  className = "",
}: TagInputProps) => {
  const [newTag, setNewTag] = useState("");

  const addTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      onTagsChange([...tags, tag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <div className="flex space-x-2 mb-3">
          <Input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder={placeholder}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), addTag(newTag))
            }
            maxLength={maxLength}
          />
          <button
            type="button"
            onClick={() => addTag(newTag)}
            className="px-4 py-2 border rounded-md transition-colors border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {predefinedTags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className="px-2 py-1 text-xs rounded border transition-colors border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800 disabled:opacity-50"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Badge
            variant="outline"
            key={index}
            className="flex items-center space-x-2 px-3 py-2 rounded-md border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800"
          >
            <span className="text-sm">{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-xs hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};
