"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ProgressType, CreateProgressDto } from "../_types/progress";
import { createProgressTracker } from "../_lib/dal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Book, CheckSquare, BarChart2, Hash } from "lucide-react";
import { toast } from "sonner";

interface AddProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddProgressModal({
  open,
  onOpenChange,
  onSuccess,
}: AddProgressModalProps) {
  const [type, setType] = useState<ProgressType>("GENERIC");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [items, setItems] = useState<{ title: string; dueDate?: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<CreateProgressDto>({
    defaultValues: {
      type: "GENERIC",
      unit: "unit",
    },
  });

  const onSubmit = async (data: CreateProgressDto) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        type,
        tags,
        items: type === "LEARNING_PLAN" ? items : undefined,
      };
      await createProgressTracker(payload);
      toast.success("Progress tracker created successfully!");
      reset();
      setTags([]);
      setItems([]);
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create progress tracker");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addItem = () => {
    setItems([...items, { title: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="h-6 w-6 text-primary" />
            Create New Tracker
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Tracker Type</Label>
              <Select
                value={type}
                onValueChange={(v: ProgressType) => setType(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERIC">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="h-4 w-4" /> Generic
                    </div>
                  </SelectItem>
                  <SelectItem value="BOOK">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4" /> Book
                    </div>
                  </SelectItem>
                  <SelectItem value="NOVEL">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-orange-500" /> Novel
                    </div>
                  </SelectItem>
                  <SelectItem value="LEARNING_PLAN">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" /> Learning Plan
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label>Unit (e.g., pages, chapters, %)</Label>
              <Input
                {...register("unit")}
                disabled={type === "LEARNING_PLAN"}
                placeholder={type === "BOOK" ? "pages" : type === "NOVEL" ? "chapters" : "unit"}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title", { required: true })} placeholder="Reading Clean Code..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" {...register("description")} placeholder="My goal for this month..." />
          </div>

          {type !== "LEARNING_PLAN" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starting Value</Label>
                <Input type="number" {...register("currentValue")} />
              </div>
              <div className="space-y-2">
                <Label>Goal / Total Value</Label>
                <Input type="number" {...register("totalValue")} />
              </div>
            </div>
          )}

          {type === "LEARNING_PLAN" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Checklist Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Task description..."
                      value={item.title}
                      className="flex-1"
                      onChange={(e) => updateItem(index, "title", e.target.value)}
                    />
                    <Input
                      type="date"
                      className="w-40"
                      value={item.dueDate || ""}
                      onChange={(e) => updateItem(index, "dueDate", e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-10 w-10 flex-shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No items added yet.</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags (Press Enter to add)</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              {tags.map((tag) => (
                <Badge key={tag} className="gap-1 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                  <Hash className="h-3 w-3" />
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
              <input
                className="flex-1 outline-none bg-transparent min-w-[100px] text-sm"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Tracker"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
