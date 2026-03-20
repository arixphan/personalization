import { ReactNode } from "react";
import TradingTabs from "./_ui/components/TradingTabs";

export default function TradingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Tab Navigation */}
      <TradingTabs />

      {/* Page Content */}
      <div className="flex-1 overflow-hidden p-4">
        {children}
      </div>
    </div>
  );
}
