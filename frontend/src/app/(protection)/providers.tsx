"use client";
import React, { useState } from "react";
import { ApplicationContext } from "@/shared/context/ApplicationContext";
import { ThemeProvider } from "@/shared/context/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Providers: React.FC<{
  children: React.ReactNode;
  initialTheme?: string;
}> = ({ children, initialTheme }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ApplicationContext>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialTheme={initialTheme}>{children}</ThemeProvider>
      </QueryClientProvider>
    </ApplicationContext>
  );
};
