import { useState, useEffect } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { getTransactions } from "../../_actions/finance.actions";
import { TransactionType } from "@personalization/shared";

interface HistoryTabProps {
  onDeleteTransaction: (id: number) => void;
  formatCurrency: (amount: number) => string;
  refreshKey?: number;
}

export function HistoryTab({
  onDeleteTransaction,
  formatCurrency,
  refreshKey
}: HistoryTabProps) {
  const t = useTranslations("Finance");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data || []);
    } catch (error) {
      console.error("Failed to fetch history transactions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-950 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 shadow-xl">
      <h3 className="text-xl font-bold dark:text-white mb-6">{t("history.title")}</h3>
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 text-gray-500 font-black uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">{t("history.date")}</th>
              <th className="px-6 py-4">{t("history.wallet")}</th>
              <th className="px-6 py-4">{t("history.category")}</th>
              <th className="px-6 py-4">{t("history.note")}</th>
              <th className="px-6 py-4 text-right">{t("history.amount")}</th>
              <th className="px-6 py-4 text-right">{t("history.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {transactions.map(t_item => (
              <tr key={t_item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 font-medium dark:text-gray-300">{format(new Date(t_item.date), "yyyy-MM-dd")}</td>
                <td className="px-6 py-4 dark:text-gray-400">{t_item.wallet?.name}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold uppercase">
                    {t_item.allocation?.name || (t_item.type === 'TRANSFER' ? 'Transfer' : t_item.type === TransactionType.ADJUSTMENT ? 'Adjustment' : '-')}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 italic">{t_item.note || "-"}</td>
                <td className={cn("px-6 py-4 text-right font-bold", t_item.type === 'INCOME' ? 'text-green-500' : 'dark:text-white')}>
                  {t_item.type === 'INCOME' ? '+' : '-'}{formatCurrency(t_item.amount)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => onDeleteTransaction(t_item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
