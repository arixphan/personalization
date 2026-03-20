"use client";

import { Button } from "@/components/ui/button";
import { TradingLogSentiment } from "@personalization/shared";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface SentimentSelectorProps {
  value: TradingLogSentiment;
  onChange: (value: TradingLogSentiment) => void;
}

export function SentimentSelector({ value, onChange }: SentimentSelectorProps) {
  const options = [
    {
      label: "Bullish",
      value: TradingLogSentiment.BULLISH,
      icon: TrendingUp,
      activeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/50 dark:text-emerald-400 dark:bg-emerald-400/10",
    },
    {
      label: "Neutral",
      value: TradingLogSentiment.NEUTRAL,
      icon: Minus,
      activeClass: "bg-gray-500/10 text-gray-600 border-gray-500/50 dark:text-gray-400 dark:bg-gray-400/10",
    },
    {
      label: "Bearish",
      value: TradingLogSentiment.BEARISH,
      icon: TrendingDown,
      activeClass: "bg-rose-500/10 text-rose-600 border-rose-500/50 dark:text-rose-400 dark:bg-rose-400/10",
    },
  ];

  return (
    <div className="flex items-center space-x-2">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant="outline"
          size="sm"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-2 px-4 h-9 border-2 transition-all duration-200 ${
            value === opt.value
              ? opt.activeClass
              : "border-transparent bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500"
          }`}
        >
          <opt.icon className="w-4 h-4" />
          <span className="font-semibold">{opt.label}</span>
        </Button>
      ))}
    </div>
  );
}
