"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Edit2, Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { motion, AnimatePresence } from "motion/react";
import { createWallet, updateWallet, deleteWallet, getWallets } from "../../_actions/finance.actions";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface WalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  refreshKey?: number;
}

export function WalletManager({
  isOpen,
  onClose,
  onRefresh,
  refreshKey
}: WalletManagerProps) {
  const t = useTranslations("Finance.walletManager");
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);

  const fetchWallets = async () => {
    setIsLoading(true);
    try {
      const data = await getWallets();
      setWallets(data || []);
    } catch (error) {
      console.error("Failed to fetch wallets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWallets();
    }
  }, [isOpen, refreshKey]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrors({ newName: "Required" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await createWallet({ name, balance: parseFloat(balance) || 0, currency: "VND" });
      toast.success("Wallet created");
      setName("");
      setBalance("");
      setShowAddForm(false);
      onRefresh();
    } catch (error) {
      toast.error("Failed to create wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!name.trim()) {
      setErrors({ editName: "Required" });
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      await updateWallet(id, { name, balance: parseFloat(balance) });
      toast.success("Wallet updated");
      setIsEditing(null);
      setName("");
      setBalance("");
      onRefresh();
    } catch (error) {
      toast.error("Failed to update wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? This will delete all transactions associated with this wallet.")) return;
    try {
      await deleteWallet(id);
      toast.success("Wallet deleted");
      onRefresh();
    } catch (error) {
      toast.error("Failed to delete wallet");
    }
  };

  const startEdit = (wallet: any) => {
    setIsEditing(wallet.id);
    setName(wallet.name);
    setBalance(wallet.balance.toString());
    setErrors({});
  };

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
          className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col">
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                  {t("title")}
                </h2>
                <p className="text-sm text-gray-500 font-medium">{t("subtitle")}</p>
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

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {isLoading ? (
                  <div className="py-12 flex justify-center">
                     <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
               ) : wallets.map(wallet => (
                 <div key={wallet.id} className="p-4 rounded-3xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 group">
                    {isEditing === wallet.id ? (
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
                            <CustomInput id="name" label="Name" value={name} onChange={setName} error={errors.editName} />
                            <CustomInput id="balance" label="Balance" isCurrency={true} value={balance} onChange={setBalance} />
                         </div>
                         <div className="flex gap-2">
                            <Button onClick={() => handleUpdate(wallet.id)} disabled={isSubmitting} className="flex-1 rounded-xl">
                               {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("save")}
                            </Button>
                            <Button variant="ghost" onClick={() => setIsEditing(null)} className="rounded-xl">{t("cancel")}</Button>
                         </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm text-primary">
                               <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="font-bold dark:text-white uppercase tracking-tight">{wallet.name}</p>
                               <p className="text-xs text-gray-500 font-black">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(wallet.balance)}</p>
                            </div>
                         </div>
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => startEdit(wallet)} className="rounded-full">
                               <Edit2 className="w-4 h-4 text-gray-400" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(wallet.id)} className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                               <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                         </div>
                      </div>
                    )}
                 </div>
               ))}

               {showAddForm ? (
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleCreate} 
                    className="p-6 rounded-3xl bg-primary/5 border-2 border-dashed border-primary/20 space-y-4"
                    noValidate
                  >
                     <div className="grid grid-cols-2 gap-4">
                        <CustomInput id="new-name" label="Name" value={name} onChange={setName} error={errors.newName} />
                        <CustomInput id="new-balance" label="Initial Balance" isCurrency={true} value={balance} onChange={setBalance} />
                     </div>
                     <div className="flex gap-2">
                        <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl">
                           {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : t("addWallet")}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowAddForm(false)} className="rounded-xl">{t("cancel")}</Button>
                     </div>
                  </motion.form>
               ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => { setShowAddForm(true); setName(""); setBalance(""); setErrors({}); }}
                    className="w-full h-16 rounded-3xl border-dashed border-2 flex items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase">{t("addNew")}</span>
                  </Button>
               )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
