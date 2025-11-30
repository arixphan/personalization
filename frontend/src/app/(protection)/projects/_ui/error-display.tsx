"use client";

import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/ui/error-message";

interface ErrorDisplayProps {
  message: string;
  statusCode: number;
}

export function ErrorDisplay({ message, statusCode }: ErrorDisplayProps) {
  const router = useRouter();

  const handleRetry = () => {
    router.refresh();
  };

  return (
    <ErrorMessage
      message={message}
      statusCode={statusCode}
      onRetry={handleRetry}
      showHomeButton={true}
    />
  );
}

