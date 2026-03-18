"use client";

import { useState, useTransition, useRef } from "react";
import { Upload, MapPin, Globe, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input/custom-text";
import { toast } from "sonner";
import { type ExperienceDto, type EducationDto, type SkillDto } from "@personalization/shared";
import { ExperienceList } from "./experience-list";
import { EducationList } from "./education-list";
import { SkillList } from "./skill-list";
import { updateProfile, uploadAvatar } from "../../../_actions/profile";
import { useTranslations } from "next-intl";

export function ProfileTab({ initialData }: { initialData?: any }) {
  const t = useTranslations("Profile");
  const [displayName, setDisplayName] = useState(initialData?.name || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [website, setWebsite] = useState(initialData?.website || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  
  // Use real avatar if available, fallback for UI demo
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        toast.success(t("success"));
      }
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadAvatar(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.data?.url) {
        // Construct full URL since backend returns relative path /uploads/...
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3000";
        const fullUrl = `${baseUrl}${result.data.url}`;
        setAvatarUrl(fullUrl);
        
        const saveResult = await updateProfile({ avatar: fullUrl });
        if (saveResult.error) {
          toast.error(t("avatarSaveFailed"));
        } else {
          toast.success(t("avatarUpdated"));
        }
      }
    } catch (error) {
      toast.error(t("uploadFailed"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Info */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group cursor-pointer shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt="Profile"
              className={`w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-sm ${isUploading ? 'opacity-50' : ''}`}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-1 right-1 p-2 rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
            >
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
                  placeholder={t("location")}
                />
              </div>
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border text-sm w-full sm:w-auto">
                <Globe size={16} className="text-muted-foreground shrink-0" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="bg-transparent border-none outline-none text-foreground placeholder-muted-foreground w-full"
                  placeholder={t("websiteUrl")}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio / About */}
      <div className="p-6 rounded-xl bg-card border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-card-foreground">{t("aboutMe")}</h3>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all placeholder:text-muted-foreground"
          placeholder={t("aboutMePlaceholder")}
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
          {isPending ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
