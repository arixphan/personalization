"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, Plus, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { CustomSelect, CustomTextarea } from "@/components/ui/input";
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
  const t_ = useTranslations("Finance.common");
  const [wallets, setWallets] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<TransactionType | "ADJUSTMENT">(TransactionType.EXPENSE);
  const [amount, setAmount] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [sourceType, setSourceType] = useState<"GENERAL" | "LOAN">("GENERAL");
  const [loanId, setLoanId] = useState("");
  const [allocationId, setAllocationId] = useState<string>("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [newBalance, setNewBalance] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentWallet = wallets.find(w => w.id.toString() === walletId);
  const adjustmentDiff = parseFloat(newBalance) - (currentWallet?.balance || 0);

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
    if (type !== TransactionType.ADJUSTMENT && !amount) newErrors.amount = "Required";
    if (type === TransactionType.ADJUSTMENT && !newBalance) newErrors.amount = "Required";
    if (!walletId) newErrors.wallet = "Required";
    if (type === TransactionType.TRANSFER) {
      if (!toWalletId) newErrors.toWallet = "Required";
      if (toWalletId === walletId) newErrors.toWallet = "Must be a different wallet";
    }
    if (!date) newErrors.date = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    
    try {
      let finalAmount = parseFloat(amount);
      let finalType = type;

      if (type === TransactionType.ADJUSTMENT) {
        const selectedWallet = wallets.find(w => w.id.toString() === walletId);
        if (!selectedWallet) return;
        const target = parseFloat(newBalance);
        if (isNaN(target)) return;
        finalAmount = target - selectedWallet.balance;
        finalType = TransactionType.ADJUSTMENT;
      }

      const result = await onSubmit({
        walletId: parseInt(walletId),
        toWalletId: type === TransactionType.TRANSFER ? parseInt(toWalletId) : null,
        allocationId: allocationId && allocationId !== "none" ? parseInt(allocationId) : null,
        loanId: sourceType === "LOAN" && loanId ? parseInt(loanId) : null,
        amount: finalAmount,
        type: finalType,
        note,
        date: new Date(date).toISOString(),
      });

      if (result?.success === false) {
        toast.error(result.error || "Failed to record transaction");
        return;
      }

      onClose();
      setAmount("");
      setNewBalance("");
      setNote("");
      setToWalletId("");
      setLoanId("");
      setAllocationId("");
      setSourceType("GENERAL");
      setErrors({});
    } catch (error: any) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeReceivableLoans = loans.filter(l => l.type === 'RECEIVABLE' && l.status === 'ACTIVE');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md" 
          onClick={onClose}
        />
        
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
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-2xl border border-gray-200 dark:border-gray-800">
                {[TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.TRANSFER, TransactionType.ADJUSTMENT].map((t_type) => (
                  <button
                    key={t_type}
                    type="button"
                    onClick={() => setType(t_type as any)}
                    className={cn(
                      "flex-1 py-3 px-2 rounded-xl text-[11px] font-black transition-all uppercase tracking-tight flex items-center justify-center gap-2",
                      type === t_type
                        ? "bg-white dark:bg-gray-800 shadow-md text-primary scale-[1.02]"
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    )}
                  >
                    {t_type === TransactionType.ADJUSTMENT ? <Settings2 className="w-3 h-3" /> : null}
                    {t_type === TransactionType.ADJUSTMENT ? "Adjust" : t_.raw(t_type.toLowerCase())}
                  </button>
                ))}
              </div>

              <div className="relative">
                  {type !== TransactionType.ADJUSTMENT ? (
                    <CustomInput
                      id="amount"
                      label={t("amount")}
                      isCurrency={true}
                      value={amount}
                      onChange={setAmount}
                      placeholder={t("amountPlaceholder")}
                      error={errors.amount}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex justify-between items-center">
                        <span className="text-sm font-bold text-primary/60 uppercase tracking-wider">Current Balance</span>
                        <span className="text-lg font-black">{currentWallet ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currentWallet.balance) : "---"}</span>
                      </div>
                      <CustomInput
                        id="new-balance"
                        label="New Balance"
                        isCurrency={true}
                        value={newBalance}
                        onChange={setNewBalance}
                        placeholder="Enter target balance"
                      />
                      {newBalance && (
                        <div className={cn(
                          "text-center font-bold text-sm transition-colors",
                          adjustmentDiff > 0 ? "text-green-500" : adjustmentDiff < 0 ? "text-red-500" : "text-gray-500"
                        )}>
                          Adjustment: {adjustmentDiff > 0 ? "+" : ""}{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(adjustmentDiff)}
                        </div>
                      )}
                    </div>
                  )}
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
                  ) : type === TransactionType.EXPENSE ? (
                    <div className="space-y-4">
                      {walletId && (
                        <CustomSelect
                          id="allocation-select"
                          label="Sub Wallet (Optional)"
                          value={allocationId}
                          onChange={(val) => {
                            setAllocationId(val);
                          }}
                          options={[
                            { value: "none", label: "None" },
                            ...(budget?.categories
                              ?.filter((c: any) => c.targetWalletId === parseInt(walletId) && c.type === "SUB_WALLET")
                              ?.map((c: any) => ({ value: c.id.toString(), label: c.name })) || [])
                          ]}
                          placeholder="Select Sub Wallet"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

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
              <div className="space-y-6">
                 <DatePicker
                   id="tx-date"
                   label={t("date")}
                   value={date}
                   onChange={setDate}
                   error={errors.date}
                 />
                 <CustomTextarea
                   id="tx-note"
                   label={t("note")}
                   value={note}
                   rows={3}
                   onChange={setNote}
                   placeholder={t("notePlaceholder")}
                 />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || (type === TransactionType.ADJUSTMENT ? !newBalance : !amount)}
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
