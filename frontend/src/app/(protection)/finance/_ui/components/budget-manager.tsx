"use client";

import { useState, useEffect } from "react";
import {
  getBudget,
  updateBudget,
  createBudget,
  getWallets
} from "../../_actions/finance.actions";
import { Loader2, Plus, PiggyBank, Briefcase, Zap, X, Edit2, Calendar, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { TransactionType, AllocationType } from "@personalization/shared";
import { applyAllocation } from "../../_actions/finance.actions";

export function BudgetManager({ refreshKey }: { refreshKey?: number }) {
  const t = useTranslations("Finance.budget");
  const [budget, setBudget] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);

  // Form states
  const [wallets, setWallets] = useState<any[]>([]);

  const [bucketName, setBucketName] = useState("");
  const [bucketLimit, setBucketLimit] = useState("");
  const [bucketTargetWalletId, setBucketTargetWalletId] = useState("");
  const [bucketType, setBucketType] = useState<AllocationType>(AllocationType.EXPENSE);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      const now = new Date();
      const [budgetData, walletData] = await Promise.all([
        getBudget(now.getMonth() + 1, now.getFullYear()),
        getWallets()
      ]);
      setBudget(budgetData);
      setWallets(walletData || []);
    } catch (error) {
      console.error("Failed to fetch budget/wallets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleSaveBucket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors: Record<string, string> = {};
    if (!bucketName.trim()) newErrors.name = "Required";
    if (!bucketLimit) newErrors.limit = "Required";

    if (!bucketTargetWalletId) {
      newErrors.wallet = "Please select a wallet";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    setErrors({});

    try {
      const categoryData = {
        name: bucketName,
        limitAmount: parseFloat(bucketLimit),
        affectsBalance: true, // Defaulting to true as requested to remove toggle
        isAutomationEnabled: bucketType !== AllocationType.SUB_WALLET, // Automated only for non-subwallets? Or as requested
        automationDay: null,
        targetWalletId: bucketTargetWalletId ? parseInt(bucketTargetWalletId) : null,
        type: bucketType,
      };

      let updatedCategories;
      if (editingCategory) {
        updatedCategories = budget.categories.map((c: any) =>
          (c.id === editingCategory.id || (!c.id && c.name === editingCategory.name)) ? { ...c, ...categoryData } : c
        );
      } else {
        updatedCategories = [...(budget?.categories || []), categoryData];
      }

      if (budget?.id) {
        await updateBudget(budget.id, { categories: updatedCategories });
      } else {
        const now = new Date();
        await createBudget({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          categories: updatedCategories,
        });
      }

      toast.success(editingCategory ? "Category updated" : "Category added");
      setIsBucketModalOpen(false);
      resetBucketForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditBucket = (category: any) => {
    setEditingCategory(category);
    setBucketName(category.name);
    setBucketLimit(category.limitAmount.toString());
    setBucketTargetWalletId(category.targetWalletId?.toString() || "");
    setBucketType(category.type || AllocationType.EXPENSE);
    setIsBucketModalOpen(true);
  };

  const handleApplyAllocation = async (id: number) => {
    setIsSubmitting(true);
    try {
      await applyAllocation(id);
      toast.success("Allocation applied successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to apply allocation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBucket = async (categoryId: number | string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;

    setIsSubmitting(true);
    try {
      const updatedCategories = (budget?.categories || []).filter((c: any) =>
        categoryId ? c.id !== categoryId : c.name !== categoryName
      );

      if (budget?.id) {
        await updateBudget(budget.id, { categories: updatedCategories });
        toast.success("Category removed");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to remove category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBucketForm = () => {
    setEditingCategory(null);
    setBucketName("");
    setBucketLimit("");
    setBucketTargetWalletId("");
    setBucketType(AllocationType.EXPENSE);
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
        <div>
          <h3 className="text-xl font-bold dark:text-white uppercase tracking-tighter">{t("title")}</h3>
          <p className="text-sm text-gray-500 font-medium">{t("allocation", { monthYear: format(new Date(), "MMMM yyyy") })}</p>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budget?.categories?.map((c_item: any) => {
          const isOverLimit = (c_item.spentAmount || 0) > c_item.limitAmount;
          return (
            <motion.div
              key={c_item.id || c_item.name}
              whileHover={{ y: -5 }}
              className="p-6 bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative group overflow-hidden"
            >
              {isOverLimit && <div className="absolute top-0 right-0 left-0 h-1 bg-red-500" />}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl shadow-inner ${isOverLimit ? 'bg-red-50 dark:bg-red-900/10 text-red-500' : 'bg-gray-50 dark:bg-gray-900 text-primary'}`}>
                    {c_item.type === AllocationType.SUB_WALLET ? <PiggyBank className="w-5 h-5" /> :
                      c_item.type === AllocationType.INCOME ? <TrendingUp className="w-5 h-5" /> :
                        <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm dark:text-white uppercase tracking-tighter">{c_item.name}</span>
                      {c_item.type === AllocationType.INCOME ? (
                        <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <TrendingDown className={`w-3.5 h-3.5 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`} />
                      )}
                    </div>
                    {c_item.parentId && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        Child of ID: {c_item.parentId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {c_item.type !== AllocationType.SUB_WALLET && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleApplyAllocation(c_item.id)}
                      className="rounded-full hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Apply now"
                    >
                      <Zap className="w-4 h-4 text-green-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditBucket(c_item)}
                    className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBucket(c_item.id, c_item.name)}
                    className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 group/delete"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t("budget")}</p>
                      <p className="text-xl font-black text-primary tracking-tighter">{formatCurrency(c_item.limitAmount)}</p>
                    </div>
                    {c_item.spentAmount !== undefined && (
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isOverLimit ? 'text-red-500' : 'text-gray-400'}`}>Used</p>
                        <p className={`text-lg font-black tracking-tighter ${isOverLimit ? 'text-red-500' : 'dark:text-white'}`}>
                          {formatCurrency(c_item.spentAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{t("lastRun")}</p>
                    <p className="text-xs font-bold dark:text-gray-400 tracking-tight">
                      {c_item.lastRunAt ? format(new Date(c_item.lastRunAt), "dd/MM") : "Never"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (c_item.spentAmount / c_item.limitAmount) * 100)}%` }}
                    className={`h-full ${isOverLimit ? 'bg-red-500' : 'bg-primary'}`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
        <Button
          variant="outline"
          onClick={() => { resetBucketForm(); setIsBucketModalOpen(true); }}
          className="h-full min-h-[160px] rounded-[2rem] border-dashed border-2 flex-col gap-3 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-primary/20 hover:text-primary transition-all group"
        >
          <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-900 group-hover:bg-primary/10 transition-colors">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
          </div>
          <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{t("addBucket")}</span>
        </Button>
      </div>

      {/* Add/Edit Bucket Modal */}
      <AnimatePresence>
        {isBucketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsBucketModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-950 rounded-[3rem] p-10 shadow-2xl border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                  {editingCategory ? t("form.editBucket") : t("form.addBucket")}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setIsBucketModalOpen(false)} className="rounded-full">
                  <X className="w-5 h-5 text-gray-500" />
                </Button>
              </div>
              <form onSubmit={handleSaveBucket} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <CustomInput id="bucket-name" label={t("form.categoryName")} value={bucketName} onChange={setBucketName} error={errors.name} />
                  <CustomInput id="bucket-limit" label={t("form.amount")} isCurrency={true} value={bucketLimit} onChange={setBucketLimit} error={errors.limit} />
                </div>

                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-600">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest dark:text-white leading-tight">Allocation Logic</p>
                      <p className="text-[10px] text-blue-600 font-medium uppercase tracking-tight">Define how this money is tracked</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <CustomSelect
                      id="bucket-type"
                      label="Type"
                      value={bucketType}
                      onChange={(val) => setBucketType(val as AllocationType)}
                      options={[
                        { value: AllocationType.EXPENSE, label: "Expense" },
                        { value: AllocationType.INCOME, label: "Income" },
                        { value: AllocationType.SUB_WALLET, label: "Sub Wallet" },
                      ]}
                    />
                  </div>

                  <CustomSelect
                    id="bucket-target-wallet"
                    label={bucketType === AllocationType.SUB_WALLET ? "Parent Wallet" : t("form.targetWallet")}
                    value={bucketTargetWalletId}
                    onChange={setBucketTargetWalletId}
                    options={wallets.map(w => ({ value: w.id.toString(), label: w.name }))}
                    placeholder="Select Wallet"
                    error={errors.wallet}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCategory ? t("form.save") : t("form.addBucket")}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
