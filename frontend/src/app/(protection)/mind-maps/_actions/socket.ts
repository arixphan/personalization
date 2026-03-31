'use server';

import { cookies } from 'next/headers';
import { AUTH_CONFIG } from '@personalization/shared';

/**
 * Server Action to retrieve the access token from HttpOnly cookies.
 * This is used to pass the token to the WebSocket handshake in cross-origin environments
 * where cookies might not be sent automatically.
 */
export async function getSocketToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAMES.ACCESS_TOKEN);
  
  return token?.value || null;
}
