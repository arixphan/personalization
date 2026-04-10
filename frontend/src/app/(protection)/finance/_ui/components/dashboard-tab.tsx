import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownLeft, Wallet, Landmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { getNetWorth, getWallets, getCashFlow, getTransactions, getBudget } from "../../_actions/finance.actions";
import { AllocationType } from "@personalization/shared";

interface DashboardTabProps {
  formatCurrency: (amount: number) => string;
  setIsWalletModalOpen: (open: boolean) => void;
  setActiveTab: (tab: any) => void;
  refreshKey?: number;
}

export function DashboardTab({
  formatCurrency,
  setIsWalletModalOpen,
  setActiveTab,
  refreshKey
}: DashboardTabProps) {
  const t = useTranslations("Finance");
  const [netWorthData, setNetWorthData] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const now = new Date();
      const [nw, w, cf, t_data, b_data] = await Promise.all([
        getNetWorth(),
        getWallets(),
        getCashFlow(),
        getTransactions(),
        getBudget(now.getMonth() + 1, now.getFullYear())
      ]);
      setNetWorthData(nw);
      setWallets(w);
      setCashFlowData(cf);
      setTransactions(t_data);
      setBudget(b_data);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Net Worth card */}
                <motion.div 
                  className="lg:col-span-2 bg-gradient-to-br from-gray-900 to-black dark:from-indigo-950 dark:to-black p-8 rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Landmark className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-indigo-400 text-sm font-semibold uppercase tracking-wider">{t("netWorth")}</span>
                    <h2 className="text-5xl font-black text-white mt-2 mb-8">
                      {formatCurrency(netWorthData?.netWorth || 0)}
                    </h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-gray-800">
                       <div>
                         <p className="text-gray-500 text-xs font-bold uppercase">{t("wallets")}</p>
                         <p className="text-xl font-bold text-white">{formatCurrency(netWorthData?.totalCash || 0)}</p>
                       </div>
                       <div>
                         <p className="text-gray-500 text-xs font-bold uppercase">{t("totalProperties")}</p>
                         <p className="text-xl font-bold text-white">{formatCurrency(netWorthData?.totalAssets || 0)}</p>
                       </div>
                       <div>
                         <p className="text-gray-500 text-xs font-bold uppercase">{t("totalLoans")}</p>
                         <p className={`text-xl font-bold ${(netWorthData?.totalReceivables || 0) - (netWorthData?.totalPayables || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                           {formatCurrency((netWorthData?.totalReceivables || 0) - (netWorthData?.totalPayables || 0))}
                         </p>
                       </div>
                    </div>
                  </div>
                </motion.div>

                {/* Wallets List */}
                <div className="bg-white dark:bg-gray-950 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-lg dark:text-white uppercase tracking-tighter">{t("wallets")}</h3>
                    <Wallet className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                    {wallets.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4">{t("noWallets")}</p>
                    ) : wallets.map((w_item: any) => {
                      const subWallets = budget?.categories?.filter((c: any) => c.type === AllocationType.SUB_WALLET && c.targetWalletId === w_item.id);
                      return (
                        <div key={w_item.id} className="space-y-2">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <span className="font-black text-sm dark:text-gray-200 uppercase tracking-tighter">{w_item.name}</span>
                            <span className="font-black dark:text-white">{formatCurrency(w_item.balance)}</span>
                          </div>
                          {subWallets?.length > 0 && (
                            <div className="pl-6 space-y-2 border-l-2 border-primary/20 ml-4 pb-2">
                              {subWallets.map((sw: any) => {
                                const isOverLimit = (sw.spentAmount || 0) > sw.limitAmount;
                                return (
                                  <div key={sw.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-gray-950 border border-gray-50 dark:border-gray-900 shadow-sm relative overflow-hidden group">
                                    {isOverLimit && <div className="absolute inset-y-0 left-0 w-1 bg-red-500" />}
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold dark:text-gray-400 uppercase tracking-tight">{sw.name}</span>
                                      <span className={`text-[10px] font-black tracking-widest ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>
                                        {formatCurrency(sw.spentAmount || 0)} / {formatCurrency(sw.limitAmount)}
                                      </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${isOverLimit ? 'bg-red-500' : 'bg-primary'}`} 
                                          style={{ width: `${Math.min(100, ((sw.spentAmount || 0) / sw.limitAmount) * 100)}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-auto rounded-xl border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-900"
                    onClick={() => setIsWalletModalOpen(true)}
                  >
                    {t("manageWallets")}
                  </Button>
                </div>
              </div>

              {/* Cash Flow & Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-950 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg">
                   <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-lg dark:text-white uppercase tracking-tighter">{t("cashFlow.title")}</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5 text-xs font-black text-green-500 uppercase">
                        <ArrowUpRight className="w-3 h-3" /> {t("cashFlow.income")}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase">
                        <ArrowDownLeft className="w-3 h-3" /> {t("cashFlow.expense")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between h-[180px] gap-2 px-2">
                    {cashFlowData.map((d_item: any, i_idx: number) => {
                      const max_val = Math.max(...cashFlowData.map(cd => Math.max(cd.income, cd.expense)), 1);
                      const incomeHeight = (d_item.income / max_val) * 100;
                      const expenseHeight = (d_item.expense / max_val) * 100;
                      return (
                        <div key={i_idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="w-full flex justify-center items-end gap-1 h-[140px]">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${incomeHeight}%` }}
                              className="w-2 md:w-3 bg-green-500/80 rounded-t-sm transition-all group-hover:bg-green-400" 
                              title={`${t("cashFlow.income")}: ${formatCurrency(d_item.income)}`}
                            />
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${expenseHeight}%` }}
                              className="w-2 md:w-3 bg-red-500/80 rounded-t-sm transition-all group-hover:bg-red-400" 
                              title={`${t("cashFlow.expense")}: ${formatCurrency(d_item.expense)}`}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold">M{d_item.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-950 p-6 rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="font-black text-lg dark:text-white uppercase tracking-tighter">{t("recentLogs")}</h3>
                     <Button variant="link" className="text-primary p-0 font-bold" onClick={() => setActiveTab('history')}>{t("viewAll")}</Button>
                  </div>
                  <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {transactions.length === 0 ? (
                      <p className="text-center py-12 text-gray-500 italic text-sm">{t("noMovement")}</p>
                    ) : transactions.slice(0, 10).map((t_item: any) => (
                      <div key={t_item.id} className="py-4 flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${t_item.type === 'INCOME' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {t_item.type === 'INCOME' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white group-hover:text-primary transition-colors uppercase tracking-tight">{t_item.category || "General"}</p>
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                              {format(new Date(t_item.date), "MMM d")} • {t_item.wallet?.name}
                            </p>
                          </div>
                        </div>
                        <p className={`font-black tracking-tighter ${t_item.type === 'INCOME' ? 'text-green-500' : 'text-gray-900 dark:text-white'}`}>
                          {t_item.type === 'INCOME' ? '+' : '-'}{formatCurrency(t_item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  );
}
