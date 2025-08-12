"use client";
import { ApplicationContext } from "@/shared/context/ApplicationContext";
import { ThemeContext } from "@/shared/context/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const queryClient = new QueryClient();

  return (
    <ApplicationContext>
      <QueryClientProvider client={queryClient}>
        <ThemeContext>{children}</ThemeContext>
      </QueryClientProvider>
    </ApplicationContext>
  );
};
