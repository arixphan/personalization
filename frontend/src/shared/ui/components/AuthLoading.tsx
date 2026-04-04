"use client";

import React from "react";

export const AuthLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Outer Ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
        {/* Inner Pulsing Dot */}
        <div className="absolute h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]"></div>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground/90">
          Authenticating
        </h2>
        <p className="animate-pulse text-sm text-muted-foreground">
          Safely connecting to your account...
        </p>
      </div>
    </div>
  );
};
