"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type EducationDto } from "@personalization/shared";
import { toast } from "sonner";
import { updateEducation } from "../../../_actions/profile";
import { DatePicker } from "@/components/ui/date-picker";
import { CustomInput } from "@/components/ui/input/custom-text";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableEducationItem({ 
  edu, 
  onEdit, 
  onDelete, 
  isPending,
  t
}: { 
  edu: EducationDto, 
  onEdit: (e: EducationDto) => void, 
  onDelete: (id: string) => void, 
  isPending: boolean,
  t: (key: string) => string
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: edu.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="p-5 rounded-lg border bg-muted/10 transition-colors hover:bg-muted/30 flex items-start gap-3">
      <div 
        {...attributes} 
        {...listeners} 
        className="mt-1 flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical size={20} />
      </div>
      <div className="flex-1 flex justify-between items-start">
        <div className="flex-1 space-y-1">
          <h4 className="font-semibold text-foreground text-base">
            {edu.degree} <span className="text-muted-foreground font-normal">{t("in")}</span> {edu.field}
          </h4>
          <p className="text-sm font-medium text-primary">{edu.institution}</p>
          <p className="text-xs text-muted-foreground flex items-center space-x-2">
            <span>{edu.startDate}</span>
            <span>—</span>
            <span>{edu.current ? t("present") : edu.endDate}</span>
          </p>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(edu)}
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Edit2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(edu.id)}
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EducationList({ initialData }: { initialData?: EducationDto[] }) {
  const t = useTranslations("Education");
  const [education, setEducation] = useState<EducationDto[]>(initialData || []);

  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEdu, setNewEdu] = useState<Partial<EducationDto>>({
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    current: false
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = education.findIndex((item) => item.id === active.id);
      const newIndex = education.findIndex((item) => item.id === over.id);
      
      const updated = arrayMove(education, oldIndex, newIndex);
      
      setEducation(updated);
      
      startTransition(async () => {
        const result = await updateEducation(updated);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t("orderSaved"));
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
    startTransition(async () => {
      const result = await updateEducation(updated);
      if (!result.error) {
        setEducation(updated);
        toast.success(t("removed"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEdit = (edu: EducationDto) => {
    setEditingId(edu.id);
    setNewEdu({ ...edu });
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!newEdu.institution || !newEdu.degree || !newEdu.field || !newEdu.startDate) {
      toast.error(t("fillRequired"));
      return;
    }
    
    let updated: EducationDto[];
    if (editingId) {
      updated = education.map(edu => 
        edu.id === editingId ? { ...edu, ...newEdu } as EducationDto : edu
      );
    } else {
      const eduToAdd: EducationDto = {
        id: Math.random().toString(36).substr(2, 9),
        institution: newEdu.institution!,
        degree: newEdu.degree!,
        field: newEdu.field!,
        startDate: newEdu.startDate!,
        endDate: newEdu.endDate || "",
        current: !!newEdu.current
      };
      updated = [...education, eduToAdd];
    }

    startTransition(async () => {
      const result = await updateEducation(updated);
      if (!result.error) {
        setEducation(updated);
        setShowAdd(false);
        setEditingId(null);
        setNewEdu({ institution: "", degree: "", field: "", startDate: "", endDate: "", current: false });
        toast.success(editingId ? t("updated") : t("added"));
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="p-6 rounded-xl bg-card border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">{t("title")}</h3>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} size="sm" variant="secondary" className="space-x-1">
            <Plus size={16} />
            <span>{t("add")}</span>
          </Button>
        )}
      </div>
      
      {showAdd && (
        <div className="p-5 rounded-lg border bg-muted/20 mb-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              id="institution"
              label={t("institution")}
              value={newEdu.institution}
              onChange={(v) => setNewEdu({ ...newEdu, institution: v })}
              placeholder={t("institutionPlaceholder")}
            />
            <CustomInput
              id="degree"
              label={t("degree")}
              value={newEdu.degree}
              onChange={(v) => setNewEdu({ ...newEdu, degree: v })}
              placeholder={t("degreePlaceholder")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              id="field"
              label={t("fieldOfStudy")}
              value={newEdu.field}
              onChange={(v) => setNewEdu({ ...newEdu, field: v })}
              placeholder={t("fieldPlaceholder")}
            />
            <DatePicker
              id="eduStartDate"
              label={t("startDate")}
              value={newEdu.startDate}
              onChange={(v) => setNewEdu({ ...newEdu, startDate: v })}
            />
            <DatePicker
              id="eduEndDate"
              label={t("endDate")}
              value={newEdu.endDate}
              onChange={(v) => setNewEdu({ ...newEdu, endDate: v })}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); setNewEdu({ institution: "", degree: "", field: "", startDate: "", endDate: "", current: false }); }}>
              <X size={16} className="mr-1" /> {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isPending}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="mr-1" />}
              {editingId ? t("update") : t("save")}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext 
            items={education.map(edu => edu.id)}
            strategy={verticalListSortingStrategy}
          >
            {education.map((edu) => (
              <SortableEducationItem 
                key={edu.id} 
                edu={edu} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                isPending={isPending}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>
        {education.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t("noEducation")}</p>
        )}
      </div>
    </div>
  );
}
