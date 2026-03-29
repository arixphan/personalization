"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { TradingLogSentiment } from "@personalization/shared";
import { TradingViewChart } from "./_ui/components/tradingview-chart";
import { MarkdownEditor } from "@/components/ui/input";
import { MonthCalendar } from "./_ui/components/month-calendar";
import { SentimentSelector } from "./_ui/components/sentiment-selector";
import { LogStreak } from "./_ui/components/log-streak";
import { getTradingLogByDate, getTradingLogsByMonth, upsertTradingLog } from "./_actions/trading-log.actions";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LogsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<TradingLogSentiment>(TradingLogSentiment.NEUTRAL);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [streak, setStreak] = useState(0);

  const fetchMonthLogs = useCallback(async () => {
    try {
      const monthStr = format(selectedDate, "yyyy-MM");
      const data = await getTradingLogsByMonth(monthStr);
      setLogs(data || []);
      
      // Calculate streak (simplified version for now)
      setStreak(data?.length || 0);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    }
  }, [selectedDate]);

  const fetchDayLog = useCallback(async () => {
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const log = await getTradingLogByDate(dateStr);
      if (log) {
        setContent(log.content || "");
        setSentiment(log.sentiment || TradingLogSentiment.NEUTRAL);
      } else {
        setContent("");
        setSentiment(TradingLogSentiment.NEUTRAL);
      }
    } catch (error) {
      console.error("Failed to fetch day log", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthLogs();
  }, [fetchMonthLogs]);

  useEffect(() => {
    fetchDayLog();
  }, [fetchDayLog]);

  const handleSave = async (overrideSentiment?: TradingLogSentiment) => {
    setIsSaving(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const sentimentToSave = overrideSentiment ?? sentiment;
      await upsertTradingLog(dateStr, content, sentimentToSave);
      toast.success("Log saved successfully");
      fetchMonthLogs(); // Refresh calendar dots
    } catch (error) {
      toast.error("Failed to save log");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSentimentChange = (newSentiment: TradingLogSentiment) => {
    setSentiment(newSentiment);
    handleSave(newSentiment);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
      {/* Chart Section - Left (Desktop) */}
      <div className="flex-1 min-h-[400px] lg:h-full">
        <TradingViewChart symbol="BINANCE:BTCUSDT" />
      </div>

      {/* Editor Section - Right (Desktop) */}
      <div className="w-full lg:w-[450px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        {/* Top Header/Action Area */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold dark:text-white">
              {format(selectedDate, "EEEE, MMMM do")}
            </h1>
            <LogStreak streak={streak} />
          </div>
          <div className="flex items-center text-sm text-gray-500 font-medium h-10">
            {isSaving && (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Saving...
              </>
            )}
          </div>
        </div>

        {/* Sentiment Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">
            Market Sentiment
          </label>
          <SentimentSelector value={sentiment} onChange={handleSentimentChange} />
        </div>

        {/* Calendar Picker */}
        <MonthCalendar
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          logs={logs}
        />

        {/* Rich Text Editor */}
        <div className="flex-1 min-h-[300px]">
           <label className="text-xs font-bold uppercase text-gray-500 tracking-wider mb-2 block">
            Analysis & Log
          </label>
          {isLoading ? (
            <div className="h-[300px] w-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <MarkdownEditor 
              id="trading-log-editor"
              value={content} 
              onChange={setContent}
              onBlur={() => handleSave()}
              placeholder="Write today's market analysis and trade details..." 
            />
          )}
        </div>
      </div>
    </div>
  );
}
