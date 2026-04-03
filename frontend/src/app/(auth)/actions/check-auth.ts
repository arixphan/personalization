"use server";

import { verifyToken } from "@/lib/token";

export async function checkAuthAction() {
  const { isAuth, error, userId } = await verifyToken();
  return { isAuth, error, userId };
}
