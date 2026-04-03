"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useRefreshAccessToken } from "@/shared/hooks/useRefreshAccessToken";
import { AuthLoading } from "@/shared/ui/components/AuthLoading";

function AuthRefreshContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useRefreshAccessToken();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    const handleRefresh = async () => {
      const success = await refresh();
      router.replace(success ? callbackUrl : "/signin");
    };

    handleRefresh();
  }, [refresh, router, callbackUrl]);

  return <AuthLoading />;
}

export default function AuthRefreshPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthRefreshContent />
    </Suspense>
  );
}
