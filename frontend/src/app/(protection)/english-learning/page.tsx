"use client";

import { useEffect, useState } from "react";
import { fetchEnglishRecords, deleteEnglishRecord, resetMastery } from "./_lib/dal";
import { EnglishRecord, EnglishRecordType } from "./_types/english";
import { Button } from "@/components/ui/button";
import { Plus, Search, Brain, LayoutGrid, List, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddRecordModal } from "./_ui/AddRecordModal";
import { RecordDetailModal } from "./_ui/RecordDetailModal";
import { SettingsModal } from "./_ui/SettingsModal";
import { RecordList } from "./_ui/RecordList";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import Link from "next/link";
import { toast } from "sonner";

export default function EnglishLearningPage() {
  const [records, setRecords] = useState<EnglishRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"learning" | "mastered" | "all">("learning");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EnglishRecord | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await fetchEnglishRecords({ search, type: filterType || undefined, status: statusFilter, page, limit: 15 });
      setRecords(res.data);
      setTotalPages(res.totalPages || 1);
      setTotalRecords(res.total || 0);
    } catch (error) {
      toast.error("Failed to load vocabulary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterType, statusFilter, page]);

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleDelete = async (id: number) => {
    setRecordToDelete(id);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteEnglishRecord(recordToDelete);
      toast.success("Deleted successfully");
      loadRecords();
    } catch (error) {
      toast.error("Delete failed");
    } finally {
      setRecordToDelete(null);
    }
  };

  const handleResetMastery = async (id: number) => {
    try {
      await resetMastery(id);
      toast.success("Moved back to learning list");
      loadRecords();
    } catch (error) {
      toast.error("Reset failed");
    }
  };

  const handleEdit = (record: EnglishRecord) => {
    setEditingRecord(record);
    setIsDetailModalOpen(true);
  };

  const handleAddOpen = () => {
    setEditingRecord(null);
    setIsAddModalOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            English Learning
          </h1>
          <p className="text-muted-foreground mt-2">
            Store your vocabulary, phrases, and grammar. Practice anytime.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/english-learning/writing">
            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
              <PenLine className="w-4 h-4 text-primary" />
              Writing Corner
            </Button>
          </Link>
          <Link href="/english-learning/practice">
            <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
              <Brain className="w-4 h-4 text-primary" />
              Practice Now
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 shadow-sm" onClick={() => setIsSettingsOpen(true)}>
            <Brain className="w-4 h-4" />
            Settings
          </Button>
          <Button onClick={handleAddOpen} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-9 bg-muted/30 focus-visible:ring-primary/30"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex bg-muted/20 p-1 rounded-lg border border-primary/5 shrink-0">
            {(["learning", "mastered", "all"] as const).map(status => (
              <Button
                key={status}
                variant={statusFilter === status ? "secondary" : "ghost"}
                size="sm"
                className="h-8 capitalize"
                onClick={() => { setStatusFilter(status); setPage(1); }}
              >
                {status}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 w-full overflow-x-auto pb-1 no-scrollbar border-l pl-4 border-primary/10">
            <Button
              variant={filterType === null ? "default" : "outline"}
              size="sm"
              onClick={() => { setFilterType(null); setPage(1); }}
            >
              All
            </Button>
            {Object.values(EnglishRecordType).map((type) => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilterType(type); setPage(1); }}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex bg-muted/20 p-1 rounded-lg border border-primary/5 shrink-0">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse"
          : "space-y-4 animate-pulse"
        }>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={viewMode === "grid" ? "h-40 bg-muted/20 rounded-xl" : "h-20 bg-muted/20 rounded-xl"} />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 font-medium italic">
          No items found.
        </div>
      ) : (
        <RecordList
          records={records}
          viewMode={viewMode}
          onSpeak={speak}
          onResetMastery={handleResetMastery}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      <div className="flex justify-between items-center pt-6 border-t border-primary/10 mt-6">
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{records.length}</span> of <span className="font-medium text-foreground">{totalRecords}</span> words
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm px-2 font-medium">Page {page} of {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <AddRecordModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadRecords}
      />
      <RecordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setEditingRecord(null);
        }}
        onSuccess={loadRecords}
        record={editingRecord}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ConfirmModal
        isOpen={recordToDelete !== null}
        onClose={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Word?"
        description="This will permanently delete this word from your vocabulary list."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
