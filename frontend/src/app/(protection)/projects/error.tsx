"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { ErrorMessage } from "@/components/ui/error-message";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Projects page error:", error);
    
    // You can integrate with error tracking services here:
    // Sentry.captureException(error);
    // LogRocket.captureException(error);
  }, [error]);

  return (
    <ErrorMessage
      message={
        error.message || "An unexpected error occurred while loading projects."
      }
      onRetry={reset}
      showHomeButton={true}
    />
  );
}
