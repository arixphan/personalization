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

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  wallets: any[];
  budgetBuckets: string[];
}

export function TransactionForm({
  isOpen,
  onClose,
  onSubmit,
  wallets,
  budgetBuckets,
}: TransactionFormProps) {
  const t = useTranslations("Finance.transactionForm");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (wallets.length > 0 && !walletId) setWalletId(wallets[0].id.toString());
      if (budgetBuckets.length > 0 && !category) setCategory(budgetBuckets[0]);
    }
  }, [isOpen, wallets, budgetBuckets, walletId, category]);

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
      setErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

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

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Type Switcher */}
              <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setType(TransactionType.EXPENSE)}
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
                  onClick={() => setType(TransactionType.INCOME)}
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
                      options={budgetBuckets.length > 0 ? [...budgetBuckets, "Other"] : ["Other"]}
                      error={errors.category}
                    />
                  )}
                </div>
              </div>

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
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
