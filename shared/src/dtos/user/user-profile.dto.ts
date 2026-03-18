import { z } from "zod";

export const UserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["en", "vn"]).optional(),
  timezone: z.string().optional(),
});
export type UserSettingsDto = z.infer<typeof UserSettingsSchema>;

export const ProjectExperienceSchema = z.object({
  id: z.string(),
  project: z.string(),
  position: z.string(),
  detail: z.string().optional(),
});
export type ProjectExperienceDto = z.infer<typeof ProjectExperienceSchema>;

export const ExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  position: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  current: z.boolean().default(false),
  projects: z.array(ProjectExperienceSchema).optional(),
});
export type ExperienceDto = z.infer<typeof ExperienceSchema>;

export const EducationSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});
export type EducationDto = z.infer<typeof EducationSchema>;

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
});
export type SkillDto = z.infer<typeof SkillSchema>;

export const UserProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
});
export type UserProfileDto = z.infer<typeof UserProfileSchema>;

export const UpdateUserExperienceSchema = z.array(ExperienceSchema);
export type UpdateUserExperienceDto = z.infer<typeof UpdateUserExperienceSchema>;

export const UpdateUserEducationSchema = z.array(EducationSchema);
export type UpdateUserEducationDto = z.infer<typeof UpdateUserEducationSchema>;

export const UpdateUserSkillSchema = z.array(SkillSchema);
export type UpdateUserSkillDto = z.infer<typeof UpdateUserSkillSchema>;
