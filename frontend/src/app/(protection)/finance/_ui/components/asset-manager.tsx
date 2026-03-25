"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Trash2, Edit2, Loader2, Landmark, Briefcase, Car, Home, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/input/custom-select";
import { motion, AnimatePresence } from "motion/react";
import { getAssets, createAsset, updateAsset, deleteAsset } from "../../_actions/finance.actions";
import { AssetType } from "@personalization/shared";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function AssetManager({ refreshKey }: { refreshKey?: number }) {
  const t = useTranslations("Finance.assets");
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<AssetType>(AssetType.OTHER);
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchAssets = async () => {
    try {
      const data = await getAssets();
      setAssets(data || []);
    } catch (error) {
      console.error("Failed to fetch assets", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Required";
    if (!value) newErrors.value = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const dto = { name, type, value: parseFloat(value), description };
      if (editingAsset) {
        await updateAsset(editingAsset.id, dto);
        toast.success("Asset updated");
      } else {
        await createAsset(dto);
        toast.success("Asset added");
      }
      setIsModalOpen(false);
      resetForm();
      fetchAssets();
    } catch (error) {
      toast.error("Failed to save asset");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      await deleteAsset(id);
      toast.success("Asset deleted");
      fetchAssets();
    } catch (error) {
      toast.error("Failed to delete asset");
    }
  };

  const openEdit = (asset: any) => {
    setEditingAsset(asset);
    setName(asset.name);
    setType(asset.type);
    setValue(asset.value.toString());
    setDescription(asset.description || "");
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAsset(null);
    setName("");
    setType(AssetType.OTHER);
    setValue("");
    setDescription("");
    setErrors({});
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.PROPERTY: return <Home className="w-5 h-5" />;
      case AssetType.VEHICLE: return <Car className="w-5 h-5" />;
      case AssetType.INVESTMENT: return <Briefcase className="w-5 h-5" />;
      default: return <Landmark className="w-5 h-5" />;
    }
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
          <h3 className="text-xl font-bold dark:text-white">{t("title")}</h3>
          <p className="text-sm text-gray-500 font-medium">{t("subtitle")}</p>
        </div>
        <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="rounded-xl shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> {t("addAsset")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800">
             <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
             <p className="text-gray-500 font-medium">{t("noAssets")}</p>
          </div>
        ) : (
          assets.map(asset => (
            <motion.div 
               key={asset.id}
               whileHover={{ y: -5 }}
               className="p-6 bg-white dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm relative group"
            >
               <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-primary/5 text-primary`}>
                     {getIcon(asset.type)}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon" onClick={() => openEdit(asset)} className="rounded-full">
                        <Edit2 className="w-4 h-4 text-gray-400" />
                     </Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)} className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-4 h-4 text-red-400" />
                     </Button>
                  </div>
               </div>
               
               <div className="space-y-1">
                  <p className="text-xs text-gray-500 font-black uppercase tracking-widest">{asset.type}</p>
                  <h4 className="text-xl font-black dark:text-white uppercase tracking-tighter">{asset.name}</h4>
                  <p className="text-2xl font-black text-primary mt-4">{formatCurrency(asset.value)}</p>
                  {asset.description && <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{asset.description}</p>}
               </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">
                    {editingAsset ? t("editAsset") : t("addAsset")}
                  </h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                   <CustomInput id="asset-name" label={t("form.name")} value={name} onChange={setName} error={errors.name} />
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <CustomSelect
                          id="asset-type"
                          label={t("form.type")}
                          value={type}
                          onChange={(val) => setType(val as AssetType)}
                          options={[
                            { value: AssetType.PROPERTY, label: "Property" },
                            { value: AssetType.VEHICLE, label: "Vehicle" },
                            { value: AssetType.INVESTMENT, label: "Investment" },
                            { value: AssetType.OTHER, label: "Other" }
                          ]}
                          error={errors.type}
                        />
                      </div>
                      <CustomInput id="asset-value" label={t("form.value")} isCurrency={true} value={value} onChange={setValue} error={errors.value} />
                   </div>

                   <CustomInput id="asset-desc" label={t("form.description")} value={description} onChange={setDescription} />

                   <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-bold shadow-xl">
                      {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          {t("form.save")}
                        </>
                      )}
                   </Button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
