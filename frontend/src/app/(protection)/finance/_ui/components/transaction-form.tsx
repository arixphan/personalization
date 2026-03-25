"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, ArrowUpRight, ArrowDownLeft, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { motion, AnimatePresence } from "motion/react";
import { TransactionType } from "@personalization/shared";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { getWallets, getLoans, getBudget } from "../../_actions/finance.actions";

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
}: TransactionFormProps) {
  const t = useTranslations("Finance.transactionForm");
  const [wallets, setWallets] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [category, setCategory] = useState("");
  const [sourceType, setSourceType] = useState<"GENERAL" | "LOAN">("GENERAL");
  const [loanId, setLoanId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const now = new Date();
          const [w, l, b] = await Promise.all([
            getWallets(),
            getLoans(),
            getBudget(now.getMonth() + 1, now.getFullYear())
          ]);
          setWallets(w || []);
          setLoans(l || []);
          setBudget(b);
          
          if (w && w.length > 0 && !walletId) setWalletId(w[0].id.toString());
          
          const incomeCats = b?.categories?.filter((c: any) => c.type === "INCOME").map((c: any) => c.name) || [];
          const expenseCats = b?.categories?.filter((c: any) => c.type === "EXPENSE").map((c: any) => c.name) || [];
          const currentCats = type === TransactionType.INCOME ? incomeCats : expenseCats;
          if (currentCats.length > 0 && !category) setCategory(currentCats[0]);
        } catch (error) {
          console.error("Failed to fetch form data", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!amount) newErrors.amount = "Required";
    if (!walletId) newErrors.wallet = "Required";
    if (type === TransactionType.TRANSFER) {
      if (!toWalletId) newErrors.toWallet = "Required";
      if (toWalletId === walletId) newErrors.toWallet = "Must be a different wallet";
    } else {
      if (!category) newErrors.category = "Required";
    }
    if (!date) newErrors.date = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      const result = await onSubmit({
        type,
        amount: parseFloat(amount),
        walletId: parseInt(walletId),
        toWalletId: type === TransactionType.TRANSFER ? parseInt(toWalletId) : null,
        category: type === TransactionType.TRANSFER ? undefined : category,
        loanId: sourceType === "LOAN" && loanId ? parseInt(loanId) : null,
        note,
        date: new Date(date).toISOString(),
      });

      if (result?.success === false) {
        toast.error(result.error || "Failed to record transaction");
        return;
      }

      onClose();
      // Reset
      setAmount("");
      setNote("");
      setToWalletId("");
      setLoanId("");
      setSourceType("GENERAL");
      setErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeCategories = budget?.categories
    ?.filter((c: any) => c.type === "INCOME")
    ?.map((c: any) => c.name) || ["Salary", "Bonus", "Gift", "Interest", "Dividend", "Other"];

  const expenseCategories = budget?.categories
    ?.filter((c: any) => c.type === "EXPENSE")
    ?.map((c: any) => c.name) || ["Food", "Chill", "Saving", "Investment", "Other"];

  const currentCategories = type === TransactionType.INCOME ? incomeCategories : expenseCategories;
  const activeReceivableLoans = loans.filter(l => l.type === 'RECEIVABLE' && l.status === 'ACTIVE');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                  {t("title")}
                </h2>
                <p className="text-sm text-gray-500 font-medium">{t("addTransaction")}</p>
              </div>
              <Button 
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5 text-gray-500" />
              </Button>
            </div>

            {isLoading ? (
               <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">Synchronizing Data...</p>
               </div>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Type Switcher */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setType(TransactionType.EXPENSE); setCategory(expenseCategories[0]); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-6 rounded-xl font-bold text-sm transition-all",
                    type === TransactionType.EXPENSE 
                      ? "bg-white dark:bg-gray-800 shadow-sm text-red-500 hover:text-red-500 hover:bg-white dark:hover:bg-gray-800" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent"
                  )}
                >
                  <ArrowDownLeft className="w-4 h-4" /> {t("expense")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setType(TransactionType.INCOME); setCategory(incomeCategories[0]); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-6 rounded-xl font-bold text-sm transition-all",
                    type === TransactionType.INCOME 
                      ? "bg-white dark:bg-gray-800 shadow-sm text-green-500 hover:text-green-500 hover:bg-white dark:hover:bg-gray-800" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent"
                  )}
                >
                   <ArrowUpRight className="w-4 h-4" /> {t("income")}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setType(TransactionType.TRANSFER)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-6 rounded-xl font-bold text-sm transition-all",
                    type === TransactionType.TRANSFER 
                      ? "bg-white dark:bg-gray-800 shadow-sm text-blue-500 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-800" 
                      : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-transparent"
                  )}
                >
                   <ArrowRightLeft className="w-4 h-4" /> {t("transfer")}
                </Button>
              </div>

              {/* Amount */}
              <div className="relative">
                <CustomInput
                  id="tx-amount"
                  label={`${t("amount")} (VND)`}
                  isCurrency={true}
                  value={amount}
                  onChange={setAmount}
                  placeholder={t("amountPlaceholder")}
                  error={errors.amount}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <CustomSelect
                    id="wallet-select"
                    label={t("wallet")}
                    value={walletId}
                    onChange={(val) => setWalletId(val)}
                    options={wallets.map(w => ({ value: w.id.toString(), label: w.name }))}
                    error={errors.wallet}
                  />
                </div>

                {/* Category or Target Wallet Select */}
                <div className="space-y-2">
                  {type === TransactionType.TRANSFER ? (
                    <CustomSelect
                      id="target-wallet-select"
                      label={t("targetWallet")}
                      value={toWalletId}
                      onChange={(val) => setToWalletId(val)}
                      options={wallets.map(w => ({ value: w.id.toString(), label: w.name }))}
                      error={errors.toWallet}
                    />
                  ) : (
                    <CustomSelect
                      id="category-select"
                      label={t("category")}
                      value={category}
                      onChange={(val) => setCategory(val)}
                      options={(() => {
                        const baseOptions = currentCategories.length > 0 ? currentCategories : [];
                        const uniqueOptions = Array.from(new Set([...baseOptions, "Other"]));
                        return uniqueOptions;
                      })()}
                      error={errors.category}
                    />
                  )}
                </div>
              </div>

              {/* Income Source Toggle */}
              {type === TransactionType.INCOME && (
                <div className="space-y-4">
                   <div className="flex p-1 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSourceType("GENERAL")}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all",
                          sourceType === "GENERAL" ? "bg-white dark:bg-gray-800 shadow-sm text-primary" : "text-gray-400"
                        )}
                      >
                        General Income
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSourceType("LOAN")}
                        className={cn(
                          "flex-1 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all",
                          sourceType === "LOAN" ? "bg-white dark:bg-gray-800 shadow-sm text-primary" : "text-gray-400"
                        )}
                      >
                        Loan Retrieval
                      </Button>
                   </div>

                   {sourceType === "LOAN" && (
                     <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <CustomSelect
                          id="loan-select"
                          label="Select Receivable Loan"
                          value={loanId}
                          onChange={(val) => setLoanId(val)}
                          options={activeReceivableLoans.map(l => ({ value: l.id.toString(), label: `${l.counterparty} (${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(l.remaining)})` }))}
                          error={errors.loan}
                        />
                     </motion.div>
                   )}
                </div>
              )}

              {/* Date & Note */}
              <div className="grid grid-cols-2 gap-4">
                 <DatePicker
                   id="tx-date"
                   label={t("date")}
                   value={date}
                   onChange={setDate}
                   error={errors.date}
                 />
                 <CustomInput
                   id="tx-note"
                   label={t("note")}
                   value={note}
                   onChange={setNote}
                   placeholder={t("notePlaceholder")}
                 />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !amount}
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl mt-4"
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {t("save")}
                  </>
                )}
              </Button>
            </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
