"use client";

import { useState, useEffect } from "react";
import { 
  getLoans, 
  createLoan,
  updateLoan,
  deleteLoan,
  getWallets
} from "../../_actions/finance.actions";
import { Loader2, Plus, Calendar, ArrowRight, ArrowLeft, MoreVertical, X, Save, Trash2, Edit2, CheckCircle, HandCoins, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { LoanType, LoanStatus } from "@personalization/shared";
import { toast } from "sonner";

export function LoanModule({ refreshKey }: { refreshKey?: number }) {
  const t = useTranslations("Finance.loans");
  const [loans, setLoans] = useState<any[]>([]);
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [type, setType] = useState<LoanType>(LoanType.PAYABLE);
  const [counterparty, setCounterparty] = useState("");
  const [principal, setPrincipal] = useState("");
  const [remaining, setRemaining] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [walletId, setWalletId] = useState("");

  const fetchData = async () => {
    try {
      const [loansData, walletsData] = await Promise.all([
        getLoans(),
        getWallets()
      ]);
      setLoans(loansData || []);
      setWallets(walletsData || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!counterparty.trim()) newErrors.counterparty = "Required";
    if (!principal) newErrors.principal = "Required";
    if (!remaining) newErrors.remaining = "Required";

    if (parseFloat(remaining) > parseFloat(principal)) {
      newErrors.remaining = "Remaining amount cannot exceed principal";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const dto = {
        type,
        counterparty,
        principal: parseFloat(principal),
        remaining: parseFloat(remaining),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        note,
        walletId: walletId ? parseInt(walletId) : null,
        status: parseFloat(remaining) === 0 ? LoanStatus.PAID_OFF : LoanStatus.ACTIVE
      };

      if (editingLoan) {
        await updateLoan(editingLoan.id, dto);
        toast.success("Loan updated");
      } else {
        await createLoan(dto);
        toast.success("Loan recorded");
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save loan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteLoan(id);
      toast.success("Loan deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete loan");
    }
  };

  const handleMarkAsPaid = async (loan: any) => {
    try {
      await updateLoan(loan.id, { remaining: 0, status: LoanStatus.PAID_OFF });
      toast.success("Loan marked as paid off");
      fetchData();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const openEdit = (loan: any) => {
    setEditingLoan(loan);
    setType(loan.type);
    setCounterparty(loan.counterparty);
    setPrincipal(loan.principal.toString());
    setRemaining(loan.remaining.toString());
    setDueDate(loan.dueDate ? loan.dueDate.split("T")[0] : "");
    setNote(loan.note || "");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingLoan(null);
    setType(LoanType.PAYABLE);
    setCounterparty("");
    setPrincipal("");
    setRemaining("");
    setDueDate("");
    setNote("");
    setWalletId("");
    setErrors({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold dark:text-white">{t("title")}</h3>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-xl shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> {t("newLoan")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loans.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
             <HandCoins className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-medium">{t("noLoans")}</p>
          </div>
        ) : (
          loans.map((loan) => (
            <motion.div 
               key={loan.id}
               className="p-6 bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-3 rounded-2xl ${loan.type === LoanType.PAYABLE ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      {loan.type === LoanType.PAYABLE ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                   </div>
                   <div>
                      <p className="font-bold dark:text-white uppercase tracking-tight">{loan.counterparty}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">
                        {loan.type === LoanType.PAYABLE ? t("type.payable") : t("type.receivable")}
                      </p>
                   </div>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleMarkAsPaid(loan)} className="rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20" title="Mark as Paid">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(loan)} className="rounded-full hover:bg-gray-100">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loan.id)} className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">{t("totalLoan")}</p>
                    <p className="text-lg font-bold dark:text-gray-300">{formatCurrency(loan.principal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">{t("remaining")}</p>
                    <p className="text-2xl font-black text-primary">{formatCurrency(loan.remaining)}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                   <div 
                     className={`h-full transition-all duration-1000 ${loan.type === LoanType.PAYABLE ? 'bg-red-500' : 'bg-emerald-500'}`} 
                     style={{ width: `${Math.max(0, Math.min(100, (1 - loan.remaining / loan.principal) * 100))}%` }} 
                   />
                </div>

                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5" />
                      {loan.dueDate ? format(new Date(loan.dueDate), "MMM dd, yyyy") : t("noDueDate")}
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${loan.status === LoanStatus.PAID_OFF ? 'bg-gray-400' : 'bg-orange-500 animate-pulse'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{loan.status}</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Loan Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-md" 
               onClick={() => setIsModalOpen(false)}
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-[2.5rem] p-8 shadow-2xl border border-gray-200 dark:border-gray-800"
             >
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                      {editingLoan ? t("form.editLoan") : t("form.addLoan")}
                   </h2>
                   <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                   </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                   <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                      <button
                        type="button"
                        onClick={() => setType(LoanType.PAYABLE)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === LoanType.PAYABLE ? 'bg-white dark:bg-gray-800 shadow-sm text-red-500' : 'text-gray-500'}`}
                      >
                         Payable
                      </button>
                      <button
                        type="button"
                        onClick={() => setType(LoanType.RECEIVABLE)}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${type === LoanType.RECEIVABLE ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-500' : 'text-gray-500'}`}
                      >
                         Receivable
                      </button>
                   </div>

                   <CustomInput id="counterparty" label={t("form.counterparty")} value={counterparty} onChange={setCounterparty} error={errors.counterparty} />
                   
                   <div className="grid grid-cols-2 gap-4">
                      <CustomInput id="principal" label={t("form.principal")} isCurrency={true} value={principal} onChange={(v) => { setPrincipal(v); if(!editingLoan) setRemaining(v); }} error={errors.principal} />
                      <CustomInput id="remaining" label={t("form.remaining")} isCurrency={true} value={remaining} onChange={setRemaining} error={errors.remaining} />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <DatePicker id="due-date" label={t("form.dueDate")} value={dueDate} onChange={setDueDate} />
                      <CustomInput id="note" label={t("form.note")} value={note} onChange={setNote} />
                   </div>

                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                         <Wallet className="w-3.5 h-3.5" />
                         {t("form.wallet")}
                      </div>
                      <CustomSelect 
                        id="wallet-select" 
                        label={t("form.selectWallet")} 
                        value={walletId} 
                        onChange={setWalletId} 
                        options={wallets.map(w => ({ value: w.id.toString(), label: w.name }))} 
                      />
                   </div>

                   <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-bold shadow-xl">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          {t("form.save")}
                        </>
                      )}
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
