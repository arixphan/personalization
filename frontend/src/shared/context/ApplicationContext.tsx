"use client";

import { ReactNode } from "react";
import { useRefreshAccessToken } from "../hooks/useRefreshAccessToken";

interface ApplicationContextProps {
  children: ReactNode;
}

export const ApplicationContext = ({ children }: ApplicationContextProps) => {
  // Silently refreshes the session in the background every 5 minutes
  useRefreshAccessToken();

  return <>{children}</>;
};
