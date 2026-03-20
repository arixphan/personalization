"use client";

import { useState, useEffect, useCallback } from "react";
import { Newspaper, ExternalLink, Filter, Loader2, BookmarkPlus } from "lucide-react";
import { getMarketNews } from "../_actions/news.actions";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const FILTER_TABS = [
  { label: "All News", value: "" },
  { label: "Bitcoin", value: "BTC" },
  { label: "Ethereum", value: "ETH" },
  { label: "Solana", value: "SOL" },
  { label: "Binance", value: "BNB" },
];

export default function NewsPage() {
  const [activeFilter, setActiveFilter] = useState("");
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMarketNews(activeFilter);
      setNews(data);
    } catch (error) {
      toast.error("Failed to fetch market news.");
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNews();

    // 5-minute auto-refresh polling
    const intervalId = setInterval(() => {
      fetchNews();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchNews]);

  const handleSaveToLog = (article: any) => {
    // In a real implementation, this would open the Log Editor modal
    // and pre-fill it with the article link and a standard template.
    navigator.clipboard.writeText(`${article.title}\n${article.link}`);
    toast.success("Article link and title copied to clipboard! Paste it into your Daily Log.");
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Market News
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time crypto updates curated for your trading edge.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 custom-scrollbar">
        {FILTER_TABS.map((tab) => (
          <Button
            key={tab.label}
            variant={activeFilter === tab.value ? "default" : "outline"}
            onClick={() => setActiveFilter(tab.value)}
            className="whitespace-nowrap rounded-full text-sm font-semibold flex items-center gap-2 px-4 shadow-sm h-9"
          >
            {tab.value === "" && <Filter className="w-3.5 h-3.5" />}
            {tab.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button 
           variant="outline" 
           size="sm" 
           onClick={fetchNews} 
           disabled={isLoading}
           className="h-9 shrink-0"
        >
           {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
           Refresh
        </Button>
      </div>

      {/* News Feed */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
        {isLoading && news.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {news.map((item, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-xl flex flex-col hover:border-primary/50 transition-colors shadow-sm relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-3 text-xs font-semibold">
                  <span className="text-primary bg-primary/10 px-2.5 py-1 rounded">
                    {item.creator}
                  </span>
                  <span className="text-gray-400">
                    {formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 dark:text-white leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    {item.title}
                  </a>
                </h3>
                
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1" dangerouslySetInnerHTML={{ __html: item.contentSnippet }} />

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button 
                     variant="ghost"
                     size="sm"
                     onClick={() => handleSaveToLog(item)}
                     className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors p-1.5 h-8"
                  >
                    <BookmarkPlus className="w-4 h-4" />
                    Copy to Log
                  </Button>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors p-1.5 hover:bg-primary/5 rounded-md"
                  >
                    Read Full
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
             <Newspaper className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
             <p className="text-gray-500 font-medium">No recent news found for the selected filter.</p>
             <p className="text-sm text-gray-400 mt-1">Try selecting 'All News' or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
