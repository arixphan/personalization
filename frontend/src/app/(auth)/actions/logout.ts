"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthEndpoint } from "@/constants/endpoints";
import { ServerApiHandler } from "@/lib/server-api";

export async function logout() {
  try {
    const cookieStore = await cookies();

    const { status } = await ServerApiHandler.post(AuthEndpoint.logout, {});

    if (status === 200) {
      cookieStore.delete("refresh_token");
      cookieStore.delete("access_token");
      redirect("/signin");
    }

    return {
      success: false,
      message: "Cannot logout successfully",
    };
  } catch (error) {
    if (error?.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }

    return {
      success: false,
      error: "Server error please try again",
    };
  }
}
