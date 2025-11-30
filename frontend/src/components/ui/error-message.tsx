
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "./button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

export function ErrorMessage({
  title,
  message,
  statusCode,
  onRetry,
  showHomeButton = false,
  className = "",
}: ErrorMessageProps) {
  // Determine title based on status code if not provided
  const errorTitle =
    title ||
    (statusCode === 404
      ? "Not Found"
      : statusCode === 403
      ? "Access Denied"
      : statusCode === 401
      ? "Unauthorized"
      : statusCode === 500
      ? "Server Error"
      : statusCode && statusCode >= 500
      ? "Server Error"
      : "Something Went Wrong");

  // Determine if it's a retryable error
  const isRetryable =
    !statusCode || statusCode === 500 || statusCode === 502 || statusCode === 503;

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[400px] p-6 ${className}`}
      role="alert"
    >
      <div className="max-w-md w-full text-center space-y-4">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {errorTitle}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">{message}</p>
          {statusCode && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Error code: {statusCode}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          {isRetryable && onRetry && (
            <Button onClick={onRetry} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          {showHomeButton && (
            <Button asChild variant="default" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

