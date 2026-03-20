"use client";

import { Flame } from "lucide-react";

interface LogStreakProps {
  streak: number;
}

export function LogStreak({ streak }: LogStreakProps) {
  if (streak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full border border-orange-500/20">
      <Flame className="w-4 h-4 fill-current" />
      <span className="text-sm font-bold">{streak}-day streak</span>
    </div>
  );
}
