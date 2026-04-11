"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApplicationContext } from "@/shared/context/ApplicationContext";
import { ThemeProvider } from "@/shared/context/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const GlobalVocabularyService = dynamic(
  () => import("@/shared/ui/english/GlobalVocabularyService"),
  { ssr: false }
);

export const Providers: React.FC<{
  children: React.ReactNode;
  initialTheme?: string;
}> = ({ children, initialTheme }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <ApplicationContext>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider initialTheme={initialTheme}>
          {children}
          <GlobalVocabularyService />
        </ThemeProvider>
      </QueryClientProvider>
    </ApplicationContext>
  );
};
