"use server";

import { revalidatePath } from "next/cache";
import { ServerApiHandler } from "@/lib/server-api";
import { isSuccessApiResponse } from "@/lib/base-api";
import { UserEndpoint } from "@/constants/endpoints";
import {
  UserProfileDto,
  UserSettingsDto,
  ExperienceDto,
  EducationDto,
  SkillDto,
} from "@personalization/shared";

export async function updateProfile(data: UserProfileDto) {
  const response = await ServerApiHandler.patch(UserEndpoint.profile(), data);
  if (isSuccessApiResponse(response)) {
    revalidatePath("/settings");
    return { data: response.data || { success: true }, statusCode: response.status || 200 };
  }
  return { error: response.error || "Failed to update profile", statusCode: response.status || 500 };
}

export async function updateSettings(data: UserSettingsDto) {
  const response = await ServerApiHandler.patch(UserEndpoint.settings(), data);
  if (isSuccessApiResponse(response)) {
    revalidatePath("/settings");
    return { data: response.data || { success: true }, statusCode: response.status || 200 };
  }
  return { error: response.error || "Failed to update settings", statusCode: response.status || 500 };
}

export async function updateExperience(data: ExperienceDto[]) {
  const response = await ServerApiHandler.patch(UserEndpoint.experience(), data);
  if (isSuccessApiResponse(response)) {
    revalidatePath("/settings");
    return { data: response.data || { success: true }, statusCode: response.status || 200 };
  }
  return { error: response.error || "Failed to update experience", statusCode: response.status || 500 };
}

export async function updateEducation(data: EducationDto[]) {
  const response = await ServerApiHandler.patch(UserEndpoint.education(), data);
  if (isSuccessApiResponse(response)) {
    revalidatePath("/settings");
    return { data: response.data || { success: true }, statusCode: response.status || 200 };
  }
  return { error: response.error || "Failed to update education", statusCode: response.status || 500 };
}

export async function updateSkills(data: SkillDto[]) {
  const response = await ServerApiHandler.patch(UserEndpoint.skills(), data);
  if (isSuccessApiResponse(response)) {
    revalidatePath("/settings");
    return { data: response.data || { success: true }, statusCode: response.status || 200 };
  }
  return { error: response.error || "Failed to update skills", statusCode: response.status || 500 };
}
