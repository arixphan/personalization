"use client";

import { useEffect, useState } from "react";
import { X, Calendar as CalendarIcon, CheckSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { getCalendarMeta } from "../_types/calendar-event";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  initialData?: any;
}

export const CalendarModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialData,
}: CalendarModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"event" | "task">("event");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [duration, setDuration] = useState("60");
  const [recurrence, setRecurrence] = useState("NONE");
  const [color, setColor] = useState("#6366f1");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    if (isOpen && initialData) {
      const meta = getCalendarMeta(initialData);
      setTitle(meta.title ?? "");
      setDescription("");
      setType(meta.isTask ? "task" : "event");
      
      const start = initialData.start ? new Date(initialData.start) : new Date();
      setDate(format(start, "yyyy-MM-dd"));
      setStartTime(format(start, "HH:mm"));
      
      if (initialData.duration) {
        setDuration(initialData.duration.toString());
        const end = new Date(start.getTime() + initialData.duration * 60000);
        setEndTime(format(end, "HH:mm"));
      }
      
      setRecurrence((initialData.metadata?.recurrence as string) ?? "NONE");
      setColor((meta.color as string) ?? "#6366f1");
    }
  }, [isOpen, initialData]);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    try {
      setIsSaving(true);
      const startDateTime = parseISO(`${date}T${startTime}`);
      
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        color,
      };

      if (type === "event") {
        const endDateTime = parseISO(`${date}T${endTime}`);
        data.start = startDateTime.toISOString();
        data.end = endDateTime.toISOString();
        data.isTask = false;
      } else {
        data.startTime = startDateTime.toISOString();
        data.duration = parseInt(duration);
        data.recurrence = recurrence;
        data.isTask = true;
      }

      await onSave(data);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {initialData?.id ? "Edit" : "Create"} {type === "event" ? "Event" : "Task"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            {type === "event" ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="end">End Time</Label>
                <Input
                  id="end"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            )}
          </div>

          {type === "task" && (
            <div className="flex flex-col gap-2">
              <Label>Recurrence</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">No Recurrence</SelectItem>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                className="w-12 h-9 p-1"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#hexcolor"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            {initialData?.id && onDelete && (
              <Button 
                variant="destructive" 
                onClick={() => setIsConfirmOpen(true)}
                disabled={isSaving}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? "Saving..." : initialData?.id ? "Save Changes" : "Create"}
            </Button>
          </div>
        </DialogFooter>

        <ConfirmModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title={`Delete ${type === "event" ? "Event" : "Task"}`}
          description={`Are you sure you want to delete this ${type}? This action cannot be undone.`}
        />
      </DialogContent>
    </Dialog>
  );
};
