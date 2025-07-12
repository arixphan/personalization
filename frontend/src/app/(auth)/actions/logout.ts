"use server";

import { AuthEndpoint } from "@/constants/endpoints";
import { Fetcher } from "@/lib/fetcher";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  try {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get("access_token");

    const response = await Fetcher.post(
      AuthEndpoint.logout,
      {},
      accessToken?.value
    );

    if (response.ok) {
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
