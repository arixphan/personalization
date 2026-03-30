"use client";

import { useState, useEffect } from "react";
import { format, startOfWeek, startOfMonth } from "date-fns";
import { Loader2, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateMarketAnalysis, getMarketAnalysis } from "../../_actions/trading-api.actions";

type Interval = "DAILY" | "WEEKLY" | "MONTHLY";

interface AiMarketAnalysisProps {
  selectedDate: Date;
}

export function AiMarketAnalysis({ selectedDate }: AiMarketAnalysisProps) {
  const [interval, setInterval] = useState<Interval>("DAILY");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const fetchAnalysis = async (currentInterval: Interval) => {
    setIsLoading(true);
    try {
      let dateToFetch = selectedDate;
      if (currentInterval === "WEEKLY") dateToFetch = startOfWeek(selectedDate);
      if (currentInterval === "MONTHLY") dateToFetch = startOfMonth(selectedDate);

      const dateStr = format(dateToFetch, "yyyy-MM-dd");
      
      const result = await getMarketAnalysis({ interval: currentInterval, date: dateStr });
      if (result && result.data) {
        setAnalysis(result.data);
      } else {
        setAnalysis(null);
      }
    } catch (error) {
      console.error(error);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(interval);
  }, [selectedDate, interval]);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      let dateToGenerate = selectedDate;
      if (interval === "WEEKLY") dateToGenerate = startOfWeek(selectedDate);
      if (interval === "MONTHLY") dateToGenerate = startOfMonth(selectedDate);

      const dateStr = format(dateToGenerate, "yyyy-MM-dd");
      const result = await generateMarketAnalysis({ interval, date: dateStr });
      
      if (result && result.data) {
        setAnalysis(result.data);
        toast.success(`${interval} analysis generated successfully!`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to generate analysis");
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "BULLISH": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "BEARISH": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          AI Market Context
        </label>
        
        <div className="flex bg-gray-200/50 dark:bg-gray-800 rounded-lg p-0.5">
          {(["DAILY", "WEEKLY", "MONTHLY"] as Interval[]).map((int) => (
            <button
              key={int}
              onClick={() => setInterval(int)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                interval === int 
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-sm text-gray-500">Analyzing BTCUSDT...</span>
          </div>
        ) : analysis ? (
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded-lg text-sm border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-2">
                 <span className="font-semibold text-gray-700 dark:text-gray-300">Sentiment:</span>
                 <div className="flex items-center gap-1">
                   {getSentimentIcon(analysis.sentiment)}
                   <span className={`font-bold ${
                     analysis.sentiment === "BULLISH" ? "text-green-500" : 
                     analysis.sentiment === "BEARISH" ? "text-red-500" : "text-gray-500"
                   }`}>{analysis.sentiment}</span>
                 </div>
               </div>
               
               <Button 
                 variant="ghost" 
                 size="sm" 
                 className="h-8 px-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"
                 onClick={() => setIsExpanded(!isExpanded)}
               >
                 {isExpanded ? (
                   <><ChevronUp className="w-4 h-4 mr-1"/> Hide Analysis</>
                 ) : (
                   <><ChevronDown className="w-4 h-4 mr-1"/> View Analysis</>
                 )}
               </Button>
             </div>
             
             {/* Analysis Content Viewer */}
             {isExpanded && (
               <div className="mt-1 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800">
                 <div className="prose prose-sm dark:prose-invert max-w-none">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>
                     {analysis.content}
                   </ReactMarkdown>
                 </div>
               </div>
             )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center gap-2">
            <span className="text-sm text-gray-500">No {interval.toLowerCase()} analysis for this date.</span>
            <Button size="sm" onClick={handleGenerate} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate {interval} Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
