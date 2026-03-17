"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ExperienceDto } from "@personalization/shared";
import { toast } from "sonner";
import { updateExperience } from "../../../_actions/profile";
import { DatePicker } from "@/components/ui/date-picker";
import { CustomInput } from "@/components/ui/input/custom-text";

export function ExperienceList({ initialData }: { initialData?: ExperienceDto[] }) {
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
    description: ""
  });

  const handleDelete = (id: string) => {
    const updated = experiences.filter(exp => exp.id !== id);
    startTransition(async () => {
      const result = await updateExperience(updated);
      if (!result.error) {
        setExperiences(updated);
        toast.success("Experience removed");
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
      toast.error("Please fill in company, position, and start date");
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
        setNewExp({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" });
        toast.success(editingId ? "Experience updated" : "Experience added");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="p-6 rounded-xl bg-card border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Experience</h3>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} size="sm" variant="secondary" className="space-x-1">
            <Plus size={16} />
            <span>Add</span>
          </Button>
        )}
      </div>
      
      {showAdd && (
        <div className="p-5 rounded-lg border bg-muted/20 mb-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              id="company"
              label="Company"
              value={newExp.company}
              onChange={(v) => setNewExp({ ...newExp, company: v })}
              placeholder="e.g. Google"
            />
            <CustomInput
              id="position"
              label="Position"
              value={newExp.position}
              onChange={(v) => setNewExp({ ...newExp, position: v })}
              placeholder="e.g. Senior Developer"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              id="startDate"
              label="Start Date"
              value={newExp.startDate}
              onChange={(v) => setNewExp({ ...newExp, startDate: v })}
            />
            <DatePicker
              id="endDate"
              label="End Date"
              value={newExp.endDate}
              onChange={(v) => setNewExp({ ...newExp, endDate: v })}
            />
          </div>
          <textarea
            placeholder="Description..."
            value={newExp.description}
            onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
            className="w-full p-3 rounded-md border bg-background text-sm h-24 resize-none"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); setNewExp({ company: "", position: "", startDate: "", endDate: "", current: false, description: "" }); }}>
              <X size={16} className="mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isPending}>
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} className="mr-1" />}
              {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="p-5 rounded-lg border bg-muted/10 transition-colors hover:bg-muted/30">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-foreground text-base">{exp.position}</h4>
                <p className="text-sm font-medium text-primary">{exp.company}</p>
                <p className="text-xs text-muted-foreground flex items-center space-x-2">
                  <span>{exp.startDate}</span>
                  <span>—</span>
                  <span>{exp.current ? "Present" : exp.endDate}</span>
                </p>
                {exp.description && (
                  <p className="text-sm mt-3 text-muted-foreground leading-relaxed">{exp.description}</p>
                )}
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(exp)}
                  disabled={isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(exp.id)}
                  disabled={isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {experiences.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No experience added yet.</p>
        )}
      </div>
    </div>
  );
}
