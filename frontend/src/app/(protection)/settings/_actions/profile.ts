"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ServerApiHandler } from "@/lib/server-api";
import { isSuccessApiResponse } from "@/lib/base-api";
import { UserEndpoint } from "@/constants/endpoints";
import { AUTH_CONFIG } from "@personalization/shared";
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

export async function uploadAvatar(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN)?.value;

    const headers = new Headers();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const baseUrl = process.env.SERVER_BASE_URL || "http://localhost:3000/api";
    
    const response = await fetch(`${baseUrl}/upload/avatar`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      console.error("Upload failed", response.status, await response.text());
      return { error: "Failed to upload avatar", statusCode: response.status };
    }

    const data = await response.json();
    return { data, statusCode: response.status };
  } catch (error) {
    console.error("Upload avatar exception:", error);
    return { error: "Failed to upload avatar", statusCode: 500 };
  }
}
