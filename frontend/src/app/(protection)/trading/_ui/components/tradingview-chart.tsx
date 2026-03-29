"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface TradingViewChartProps {
  symbol?: string; // e.g. 'BINANCE:BTCUSDT'
  autosize?: boolean;
}

export function TradingViewChart({
  symbol = "BINANCE:BTCUSDT",
  autosize = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, resolvedTheme } = useTheme();
  
  // Use resolvedTheme if available, fallback to theme or 'dark'
  const currentTheme = (resolvedTheme || theme || "dark") as "light" | "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear existing content
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      interval: "1H",
      timezone: "Etc/UTC",
      theme: currentTheme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
      autosize,
      hide_side_toolbar: false,
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, currentTheme, autosize]);

  return (
    <div className="tradingview-widget-container h-full w-full bg-gray-50 dark:bg-gray-950 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
      <div ref={containerRef} className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

