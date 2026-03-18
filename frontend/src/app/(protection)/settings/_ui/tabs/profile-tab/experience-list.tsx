"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ExperienceDto } from "@personalization/shared";
import { toast } from "sonner";
import { updateExperience } from "../../../_actions/profile";
import { DatePicker } from "@/components/ui/date-picker";
import { CustomInput } from "@/components/ui/input/custom-text";
import { type ProjectExperienceDto } from "@personalization/shared";
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

function SortableExperienceItem({ 
  exp, 
  onEdit, 
  onDelete, 
  isPending,
  t
}: { 
  exp: ExperienceDto, 
  onEdit: (e: ExperienceDto) => void, 
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
  } = useSortable({ id: exp.id });

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
          <h4 className="font-semibold text-foreground text-base">{exp.position}</h4>
          <p className="text-sm font-medium text-primary">{exp.company}</p>
          <p className="text-xs text-muted-foreground flex items-center space-x-2">
            <span>{exp.startDate}</span>
            <span>—</span>
            <span>{exp.current ? t("present") : exp.endDate}</span>
          </p>
          {exp.description && (
            <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{exp.description}</p>
          )}

          {/* Nested Projects Display */}
          {exp.projects && exp.projects.length > 0 && (
            <div className="mt-4 space-y-3">
              <h5 className="text-sm font-semibold text-foreground">{t("projects")}</h5>
              <div className="space-y-3 border-l-2 border-primary/20 pl-4 py-1">
                {exp.projects.map((proj) => (
                  <div key={proj.id} className="space-y-1">
                    <h6 className="text-sm font-medium text-foreground">{proj.project} <span className="text-xs text-muted-foreground font-normal ml-2">({proj.position})</span></h6>
                    {proj.detail && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{proj.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onEdit(exp)}
            disabled={isPending}
            className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Edit2 size={14} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onDelete(exp.id)}
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

function SortableProjectFormItem({
  proj,
  index,
  onUpdate,
  onRemove,
  t
}: {
  proj: ProjectExperienceDto;
  index: number;
  onUpdate: (index: number, field: keyof ProjectExperienceDto, value: string) => void;
  onRemove: (index: number) => void;
  t: (key: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: proj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 5 : 1,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} className="space-y-3 bg-background border rounded-lg p-4 pl-10 relative group">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-2 top-1/2 -translate-y-1/2 flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical size={20} />
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(index)}
      >
        <Trash2 size={12} />
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <CustomInput
          id={`proj-${proj.id}-name`}
          label={t("projectName")}
          value={proj.project}
          onChange={(v) => onUpdate(index, "project", v)}
          placeholder={t("projectNamePlaceholder")}
        />
        <CustomInput
          id={`proj-${proj.id}-role`}
          label={t("rolePosition")}
          value={proj.position}
          onChange={(v) => onUpdate(index, "position", v)}
          placeholder={t("rolePlaceholder")}
        />
      </div>
      <textarea
        placeholder={t("projectDetails")}
        value={proj.detail || ""}
        onChange={(e) => onUpdate(index, "detail", e.target.value)}
        className="w-full p-3 rounded-md border bg-muted/20 text-sm h-20 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

export function ExperienceList({ initialData }: { initialData?: ExperienceDto[] }) {
  const t = useTranslations("Experience");
  const [experiences, setExperiences] = useState<ExperienceDto[]>(initialData || []);

  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newExp, setNewExp] = useState<Partial<ExperienceDto>>({
    company: "",
    position: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
    projects: []
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
      const oldIndex = experiences.findIndex((item) => item.id === active.id);
      const newIndex = experiences.findIndex((item) => item.id === over.id);
      
      const updated = arrayMove(experiences, oldIndex, newIndex);
      
      // Optimitically update UI
      setExperiences(updated);
      
      startTransition(async () => {
        const result = await updateExperience(updated);
        if (result.error) {
          toast.error(result.error);
          // Revert optimistic update if needed, but for simplicity showing error is ok
        } else {
          toast.success(t("orderSaved"));
        }
      });
    }
  };

  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const projects = newExp.projects || [];
      const oldIndex = projects.findIndex((item) => item.id === active.id);
      const newIndex = projects.findIndex((item) => item.id === over.id);
      
      const updatedProjects = arrayMove(projects, oldIndex, newIndex);
      setNewExp({ ...newExp, projects: updatedProjects });
    }
  };

  const updateProjectField = (index: number, field: keyof ProjectExperienceDto, value: string) => {
    const currentProjects = [...(newExp.projects || [])];
    currentProjects[index] = { ...currentProjects[index], [field]: value };
    setNewExp({ ...newExp, projects: currentProjects });
  };

  const removeProjectField = (index: number) => {
    const currentProjects = [...(newExp.projects || [])];
    currentProjects.splice(index, 1);
    setNewExp({ ...newExp, projects: currentProjects });
  };

  const handleDelete = (id: string) => {
    const updated = experiences.filter(exp => exp.id !== id);
    startTransition(async () => {
      const result = await updateExperience(updated);
      if (!result.error) {
        setExperiences(updated);
        toast.success(t("removed"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleEdit = (exp: ExperienceDto) => {
    setEditingId(exp.id);
    setNewExp({ ...exp });
    setShowAdd(true);
  };

  const handleAdd = () => {
    if (!newExp.company || !newExp.position || !newExp.startDate) {
      toast.error(t("fillRequired"));
      return;
    }
    
    let updated: ExperienceDto[];
    if (editingId) {
      updated = experiences.map(exp => 
        exp.id === editingId ? { ...exp, ...newExp } as ExperienceDto : exp
      );
    } else {
      const expToAdd: ExperienceDto = {
        id: Math.random().toString(36).substr(2, 9),
        company: newExp.company!,
        position: newExp.position!,
        startDate: newExp.startDate!,
        endDate: newExp.endDate || "",
        current: !!newExp.current,
        description: newExp.description || ""
      };
      updated = [...experiences, expToAdd];
    }
    
    startTransition(async () => {
      const result = await updateExperience(updated);
      if (!result.error) {
        setExperiences(updated);
        setShowAdd(false);
        setEditingId(null);
        setNewExp({ company: "", position: "", startDate: "", endDate: "", current: false, description: "", projects: [] });
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
              id="company"
              label={t("company")}
              value={newExp.company}
              onChange={(v) => setNewExp({ ...newExp, company: v })}
              placeholder={t("companyPlaceholder")}
            />
            <CustomInput
              id="position"
              label={t("position")}
              value={newExp.position}
              onChange={(v) => setNewExp({ ...newExp, position: v })}
              placeholder={t("positionPlaceholder")}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              id="startDate"
              label={t("startDate")}
              value={newExp.startDate}
              onChange={(v) => setNewExp({ ...newExp, startDate: v })}
            />
            <DatePicker
              id="endDate"
              label={t("endDate")}
              value={newExp.endDate}
              onChange={(v) => setNewExp({ ...newExp, endDate: v })}
            />
          </div>
          <textarea
            placeholder={t("descriptionPlaceholder")}
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            className="w-full p-3 rounded-md border bg-background text-sm h-24 resize-none"
          />

          {/* Nested Projects Form */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-sm font-semibold text-card-foreground">{t("keyProjects")}</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const currentProjects = newExp.projects || [];
                  setNewExp({
                    ...newExp,
                    projects: [
                      ...currentProjects,
                      { id: Math.random().toString(36).substr(2, 9), project: "", position: "", detail: "" }
                    ]
                  });
                }}
                className="h-8 text-xs space-x-1"
              >
                <Plus size={14} /> <span>{t("addProject")}</span>
              </Button>
            </div>

            {newExp.projects && newExp.projects.length > 0 ? (
              <div className="space-y-4 border-l-2 border-primary/20 pl-4 py-2">
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleProjectDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext 
                    items={newExp.projects.map(proj => proj.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {newExp.projects.map((proj, index) => (
                      <SortableProjectFormItem
                        key={proj.id}
                        proj={proj}
                        index={index}
                        onUpdate={updateProjectField}
                        onRemove={removeProjectField}
                        t={t}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic mb-2">{t("noProjects")}</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); setNewExp({ company: "", position: "", startDate: "", endDate: "", current: false, description: "", projects: [] }); }}>
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
            items={experiences.map(exp => exp.id)}
            strategy={verticalListSortingStrategy}
          >
            {experiences.map((exp) => (
              <SortableExperienceItem 
                key={exp.id} 
                exp={exp} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                isPending={isPending}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>
        {experiences.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">{t("noExperience")}</p>
        )}
      </div>
    </div>
  );
}
