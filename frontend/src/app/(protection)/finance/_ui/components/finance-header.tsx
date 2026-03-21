import { Plus, LayoutDashboard, Landmark, HandCoins, Target, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

export type FinanceTab = "dashboard" | "assets" | "loans" | "budget" | "history";

interface FinanceHeaderProps {
  activeTab: FinanceTab;
  setActiveTab: (tab: FinanceTab) => void;
  onQuickEntry: () => void;
}

export function FinanceHeader({ activeTab, setActiveTab, onQuickEntry }: FinanceHeaderProps) {
  const t = useTranslations("Finance");

  const tabs = [
    { id: "dashboard", label: t("tabs.dashboard"), icon: LayoutDashboard },
    { id: "assets", label: t("tabs.assets"), icon: Landmark },
    { id: "loans", label: t("tabs.loans"), icon: HandCoins },
    { id: "budget", label: t("tabs.budget"), icon: Target },
    { id: "history", label: t("tabs.history"), icon: History },
  ];

  return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tighter dark:text-white uppercase">Finance <span className="text-primary">Ops</span></h1>
          <p className="text-gray-500 text-sm font-medium">{t("subtitle")}</p>
        </div>
        
        {/* Tab Switcher - Premium Design */}
        <div className="flex p-1.5 bg-gray-100 dark:bg-gray-900 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-inner">
           {tabs.map((tab) => {
             const Icon = tab.icon;
             return (
               <Button
                 key={tab.id}
                 variant="ghost"
                 onClick={() => setActiveTab(tab.id as FinanceTab)}
                 className={cn(
                   "relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-transparent",
                   activeTab === tab.id 
                     ? "text-primary dark:text-white" 
                     : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                 )}
               >
                 {activeTab === tab.id && (
                   <motion.div 
                     layoutId="activeTab" 
                     className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700" 
                     transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                   />
                 )}
                 <Icon className="w-4 h-4 relative z-10" />
                 <span className="relative z-10">{tab.label}</span>
               </Button>
             );
           })}
        </div>

        <Button 
          onClick={onQuickEntry}
          className="rounded-full px-8 h-12 shadow-xl bg-primary hover:bg-primary/90 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("quickEntry")}
        </Button>
      </div>
  );
}
