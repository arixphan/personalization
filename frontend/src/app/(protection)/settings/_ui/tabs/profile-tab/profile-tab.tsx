"use client";

import { useState, useTransition } from "react";
import { Upload, MapPin, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input/custom-text";
import { toast } from "sonner";
import { type ExperienceDto, type EducationDto, type SkillDto } from "@personalization/shared";
import { ExperienceList } from "./experience-list";
import { EducationList } from "./education-list";
import { SkillList } from "./skill-list";
import { updateProfile } from "../../../_actions/profile";

export function ProfileTab({ initialData }: { initialData?: any }) {
  const [displayName, setDisplayName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  
  // Use real avatar if available, fallback for UI demo
  const profileImage = initialData?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300";

  let initialExperience: ExperienceDto[] = [];
  let initialEducation: EducationDto[] = [];
  let initialSkills: SkillDto[] = [];

  try { if (initialData?.experience) initialExperience = JSON.parse(initialData.experience); } catch (e) {}
  try { if (initialData?.education) initialEducation = JSON.parse(initialData.education); } catch (e) {}
  try { if (initialData?.skills) initialSkills = JSON.parse(initialData.skills); } catch (e) {}

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateProfile({
        location,
        website,
        bio,
      });
      if (result.error) {
        toast.error(result.error);
        console.error("Save failed:", result.error);
      } else {
        toast.success("Profile saved successfully");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group cursor-pointer shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileImage}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-sm"
            />
            <button className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-md transition-transform group-hover:scale-110">
              <Upload size={16} />
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {displayName}
            </h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border text-sm w-full sm:w-auto">
                <MapPin size={16} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
                  placeholder="Location"
                />
              </div>
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border text-sm w-full sm:w-auto">
                <Globe size={16} className="text-muted-foreground shrink-0" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
                  placeholder="Website URL"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / About */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">About Me</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
          placeholder="Tell us about yourself..."
        />
      </div>

      {/* Experience, Education, Skills */}
      <ExperienceList initialData={initialExperience} />
      <EducationList initialData={initialEducation} />
      <SkillList initialData={initialSkills} />

      {/* Save Button */}
      <div className="flex justify-end mt-8">
        <Button onClick={handleSave} disabled={isPending} variant="default" className="gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}
