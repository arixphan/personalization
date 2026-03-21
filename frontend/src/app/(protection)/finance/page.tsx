"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  getNetWorth, 
  getCashFlow, 
  getWallets, 
  getTransactions,
  getBudget,
  createTransaction,
  deleteTransaction
} from "./_actions/finance.actions";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import { TransactionForm } from "./_ui/components/transaction-form";
import { LoanModule } from "./_ui/components/loan-module";
import { BudgetManager } from "./_ui/components/budget-manager";
import { WalletManager } from "./_ui/components/wallet-manager";
import { AssetManager } from "./_ui/components/asset-manager";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FinanceHeader, FinanceTab } from "./_ui/components/finance-header";
import { DashboardTab } from "./_ui/components/dashboard-tab";
import { HistoryTab } from "./_ui/components/history-tab";

export default function FinancePage() {
  const t = useTranslations("Finance");
  const [activeTab, setActiveTab] = useState<FinanceTab>("dashboard");
  const [netWorthData, setNetWorthData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTxFormOpen, setIsTxFormOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const now = new Date();
      const [nw, cf, w, t_data, b] = await Promise.all([
        getNetWorth(),
        getCashFlow(),
        getWallets(),
        getTransactions(),
        getBudget(now.getMonth() + 1, now.getFullYear())
      ]);
      setNetWorthData(nw);
      setCashFlowData(cf);
      setWallets(w);
      setTransactions(t_data);
      setBudget(b);
    } catch (error) {
      console.error("Failed to fetch finance data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTxSubmit = async (data: any) => {
    const result = await createTransaction(data);
    if (result.success) {
      toast.success("Transaction recorded");
      fetchData();
      return { success: true };
    } else {
      return { success: false, error: result.error };
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    setTxToDelete(id);
  };

  const confirmDeleteTransaction = async () => {
    if (txToDelete === null) return;
    try {
      await deleteTransaction(txToDelete);
      toast.success("Transaction deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    } finally {
      setTxToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const budgetBuckets = budget?.categories?.map((c: any) => c.name) || ["Food", "Chill", "Saving", "Investment"];

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl mx-auto overflow-y-auto custom-scrollbar h-full">
      <FinanceHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onQuickEntry={() => setIsTxFormOpen(true)} 
      />

      <TransactionForm 
        isOpen={isTxFormOpen}
        onClose={() => setIsTxFormOpen(false)}
        onSubmit={handleTxSubmit}
        wallets={wallets}
        budgetBuckets={budgetBuckets}
      />

      <WalletManager 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        wallets={wallets}
        onRefresh={fetchData}
      />

      {/* Content Area with Transitions */}
      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === "dashboard" && (
            <DashboardTab 
              netWorthData={netWorthData}
              wallets={wallets}
              cashFlowData={cashFlowData}
              transactions={transactions}
              formatCurrency={formatCurrency}
              setIsWalletModalOpen={setIsWalletModalOpen}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "assets" && <AssetManager />}
          {activeTab === "loans" && <LoanModule />}
          {activeTab === "budget" && <BudgetManager />}
          {activeTab === "history" && (
            <HistoryTab 
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
              formatCurrency={formatCurrency}
            />
          )}
        </motion.div>
      </AnimatePresence>

      <AlertDialog open={txToDelete !== null} onOpenChange={(open: boolean) => !open && setTxToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl uppercase tracking-tighter">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              This action cannot be undone. This will permanently delete the transaction and update your balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white">
              Delete Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
