"use client";

import { ReactNode } from "react";
import { useRefreshAccessToken } from "../hooks/useRefreshAccessToken";

interface ApplicationContextProps {
  children: ReactNode;
}
export const ApplicationContext = ({ children }: ApplicationContextProps) => {
  useRefreshAccessToken();
  return <>{children}</>;
};
