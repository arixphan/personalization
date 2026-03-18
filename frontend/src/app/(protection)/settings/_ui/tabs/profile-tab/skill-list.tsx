"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type SkillDto } from "@personalization/shared";
import { toast } from "sonner";
import { updateSkills } from "../../../_actions/profile";
import { cn } from "@/lib/utils";
import { CustomInput } from "@/components/ui/input/custom-text";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { useTranslations } from "next-intl";

export function SkillList({ initialData }: { initialData?: SkillDto[] }) {
  const t = useTranslations("Skills");
  const [skills, setSkills] = useState<SkillDto[]>(initialData || []);

  const [isPending, startTransition] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<SkillDto>>({
    name: "",
    level: "Intermediate"
  });

  const handleDelete = (id: string) => {
    const updated = skills.filter(s => s.id !== id);
    startTransition(async () => {
      const result = await updateSkills(updated);
      if (!result.error) {
        setSkills(updated);
        toast.success(t("removed"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleAdd = () => {
    if (!newSkill.name || !newSkill.level) return;
    
    const skillToAdd: SkillDto = {
      id: Math.random().toString(36).substr(2, 9),
      name: newSkill.name!,
      level: newSkill.level!
    };

    const updated = [...skills, skillToAdd];
    startTransition(async () => {
      const result = await updateSkills(updated);
      if (!result.error) {
        setSkills(updated);
        setShowAdd(false);
        setNewSkill({ name: "", level: "Intermediate" });
        toast.success(t("added"));
      } else {
        toast.error(result.error);
      }
    });
  };

  const getLevelColor = (level: SkillDto["level"]) => {
    switch (level) {
      case "Expert": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "Advanced": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "Intermediate": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
      case "Beginner": return "bg-muted text-muted-foreground border-border";
    }
  };

  const levelKeyMap: Record<string, string> = {
    "Beginner": "beginner",
    "Intermediate": "intermediate",
    "Advanced": "advanced",
    "Expert": "expert"
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
              id="skillName"
              label={t("skillName")}
              value={newSkill.name}
              onChange={(v) => setNewSkill({ ...newSkill, name: v })}
              placeholder={t("skillNamePlaceholder")}
            />
            <CustomSelect
              id="skillLevel"
              label={t("level")}
              options={[
                { value: "Beginner", label: t("beginner") },
                { value: "Intermediate", label: t("intermediate") },
                { value: "Advanced", label: t("advanced") },
                { value: "Expert", label: t("expert") }
              ]}
              value={newSkill.level}
              onChange={(v) => setNewSkill({ ...newSkill, level: v as SkillDto["level"] })}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={isPending}>
              {isPending ? <Loader2 size={16} className="animate-spin mr-1" /> : <Check size={16} className="mr-1" />}
              {t("saveSkill")}
            </Button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills.map((skill) => (
          <div key={skill.id} className="group relative p-3 rounded-lg border bg-muted/10 flex justify-between items-center overflow-hidden hover:bg-muted/30 transition-colors">
            <span className="font-medium text-sm text-foreground truncate mr-2">{skill.name}</span>
            <span className={cn(
              "text-xs px-2.5 py-0.5 rounded-full border whitespace-nowrap",
              getLevelColor(skill.level)
            )}>
              {levelKeyMap[skill.level] ? t(levelKeyMap[skill.level]) : skill.level}
            </span>
            
            {/* Hover Actions */}
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background/90 via-background/80 to-transparent opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <button 
                onClick={() => handleDelete(skill.id)}
                disabled={isPending}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
               >
                 {isPending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
