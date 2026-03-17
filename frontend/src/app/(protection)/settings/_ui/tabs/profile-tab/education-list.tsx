"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type EducationDto } from "@personalization/shared";
import { toast } from "sonner";
import { updateEducation } from "../../../_actions/profile";
import { CustomInput } from "@/components/ui/input/custom-text";

export function EducationList({ initialData }: { initialData?: EducationDto[] }) {
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

  const handleDelete = (id: string) => {
    const updated = education.filter(edu => edu.id !== id);
    startTransition(async () => {
      const result = await updateEducation(updated);
      if (!result.error) {
        setEducation(updated);
        toast.success("Education removed");
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
    if (!newEdu.institution || !newEdu.degree || !newEdu.field || !newEdu.startDate) return;
    
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
        toast.success(editingId ? "Education updated" : "Education added");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="p-6 rounded-xl bg-card border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Education</h3>
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
              id="institution"
              label="Institution"
              value={newEdu.institution}
              onChange={(v) => setNewEdu({ ...newEdu, institution: v })}
              placeholder="e.g. University of Tokyo"
            />
            <CustomInput
              id="degree"
              label="Degree"
              value={newEdu.degree}
              onChange={(v) => setNewEdu({ ...newEdu, degree: v })}
              placeholder="e.g. Bachelor"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomInput
              id="field"
              label="Field of Study"
              value={newEdu.field}
              onChange={(v) => setNewEdu({ ...newEdu, field: v })}
              placeholder="e.g. Computer Science"
            />
            <CustomInput
              id="eduStartDate"
              label="Start Date"
              type="month"
              value={newEdu.startDate}
              onChange={(v) => setNewEdu({ ...newEdu, startDate: v })}
            />
            <CustomInput
              id="eduEndDate"
              label="End Date"
              type="month"
              value={newEdu.endDate}
              onChange={(v) => setNewEdu({ ...newEdu, endDate: v })}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="ghost" size="sm" onClick={() => { setShowAdd(false); setEditingId(null); setNewEdu({ institution: "", degree: "", field: "", startDate: "", endDate: "", current: false }); }}>
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
        {education.map((edu) => (
          <div key={edu.id} className="p-5 rounded-lg border bg-muted/10 transition-colors hover:bg-muted/30">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-foreground text-base">
                  {edu.degree} <span className="text-muted-foreground font-normal">in</span> {edu.field}
                </h4>
                <p className="text-sm font-medium text-primary">{edu.institution}</p>
                <p className="text-xs text-muted-foreground flex items-center space-x-2">
                  <span>{edu.startDate}</span>
                  <span>—</span>
                  <span>{edu.current ? "Present" : edu.endDate}</span>
                </p>
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(edu)}
                  disabled={isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Edit2 size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(edu.id)}
                  disabled={isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {education.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No education added yet.</p>
        )}
      </div>
    </div>
  );
}
