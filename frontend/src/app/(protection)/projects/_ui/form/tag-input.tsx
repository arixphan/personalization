"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
          <Button
            type="button"
            onClick={() => addTag(newTag)}
            variant="outline"
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {predefinedTags.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag: string) => (
                <Button
                  key={tag}
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className="px-2 py-1 text-xs h-7"
                >
                  {tag}
                </Button>
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
            className="flex items-center space-x-2 px-3 py-2 rounded-md border border-input bg-card/30"
          >
            <span className="text-sm">{tag}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTag(tag)}
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
