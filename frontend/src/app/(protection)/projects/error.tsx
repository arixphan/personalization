"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import { useTranslations } from "next-intl";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Projects");

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
        error.message || t("error.defaultMessage")
      }
      onRetry={reset}
      showHomeButton={true}
    />
  );
}
