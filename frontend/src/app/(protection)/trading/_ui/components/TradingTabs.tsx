"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Brain, Link as LinkIcon, Newspaper } from "lucide-react";

const tabs = [
  { label: "Logs", href: "/trading", icon: BookOpen },
  { label: "Strategies", href: "/trading/strategies", icon: Brain },
  { label: "Binance", href: "/trading/binance", icon: LinkIcon },
  { label: "News", href: "/trading/news", icon: Newspaper },
];

export default function TradingTabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center space-x-1 border-b dark:border-gray-800 px-4 pt-4 bg-white dark:bg-gray-900 sticky top-0 z-10">
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href || (tab.href !== "/trading" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${isActive
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700"
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
