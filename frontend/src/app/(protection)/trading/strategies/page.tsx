"use client";

import { useState, useEffect } from "react";
import { TradingViewChart } from "../_ui/components/tradingview-chart";
import { StrategyList } from "../_ui/components/strategy-list";
import { StrategyForm } from "../_ui/components/strategy-form";
import { StrategyDetail } from "../_ui/components/strategy-detail";
import { getStrategies, createStrategy, updateStrategy, deleteStrategy } from "../_actions/strategy.actions";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null);

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    setIsLoading(true);
    try {
      const data = await getStrategies();
      setStrategies(data);
    } catch (error) {
      toast.error("Failed to load strategies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    try {
      await createStrategy(data);
      toast.success("Strategy created successfully");
      fetchStrategies();
    } catch (error) {
      toast.error("Failed to create strategy");
      throw error;
    }
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateStrategy(selectedStrategy.id, data);
      toast.success("Strategy updated successfully");
      fetchStrategies();
    } catch (error) {
      toast.error("Failed to update strategy");
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this strategy?")) return;
    try {
      await deleteStrategy(id);
      toast.success("Strategy deleted");
      fetchStrategies();
    } catch (error) {
      toast.error("Failed to delete strategy");
    }
  };

  const openEdit = (s: any) => {
    setSelectedStrategy(s);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setSelectedStrategy(null);
    setIsFormOpen(true);
  };

  const openView = (s: any) => {
    setSelectedStrategy(s);
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Section: TradingView Chart */}
      <div className="h-[300px] shrink-0">
        <TradingViewChart symbol="BINANCE:BTCUSDT" />
      </div>

      {/* Bottom Section: Strategy Management */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">Trading Strategies</h1>
            <p className="text-sm text-gray-500">Document and reorder your market rules.</p>
          </div>
          <Button onClick={openCreate} className="font-bold shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            New Strategy
          </Button>
        </div>

        {/* Scrollable List Area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <StrategyList 
              initialStrategies={strategies} 
              onEdit={openEdit} 
              onDelete={handleDelete}
              onView={openView}
            />
          )}
        </div>
      </div>

      {/* Modals & Panels */}
      <StrategyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={selectedStrategy ? handleUpdate : handleCreate}
        initialData={selectedStrategy}
      />

      <StrategyDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        strategy={selectedStrategy}
      />
    </div>
  );
}
