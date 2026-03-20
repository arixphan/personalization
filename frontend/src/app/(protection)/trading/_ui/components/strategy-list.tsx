"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { StrategyCard } from "./strategy-card";
import { reorderStrategies } from "../../_actions/strategy.actions";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface StrategyListProps {
  initialStrategies: any[];
  onEdit: (s: any) => void;
  onDelete: (id: number) => void;
  onView: (s: any) => void;
}

export function StrategyList({
  initialStrategies,
  onEdit,
  onDelete,
  onView,
}: StrategyListProps) {
  const [items, setItems] = useState(initialStrategies);

  useEffect(() => {
    setItems(initialStrategies);
  }, [initialStrategies]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        await reorderStrategies({ ids: newItems.map((i) => i.id) });
      } catch (error) {
        toast.error("Failed to save new order");
        setItems(items); // Revert
      }
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
        <p className="text-gray-500">No trading strategies yet.</p>
        <p className="text-sm text-gray-400">Add your first one to get started.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {items.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
