"use client";

import { useEffect, useState } from "react";
import { fetchEnglishRecords, deleteEnglishRecord } from "./_lib/dal";
import { EnglishRecord, EnglishRecordType } from "./_types/english";
import { Button } from "@/components/ui/button";
import { Plus, Search, Brain, Volume2, Trash2, LayoutGrid, List, PenLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AddRecordModal } from "./_ui/AddRecordModal";
import { SettingsModal } from "./_ui/SettingsModal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

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
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteEnglishRecord(id);
      toast.success("Deleted successfully");
      loadRecords();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const getTypeColor = (type: EnglishRecordType) => {
    switch (type) {
      case EnglishRecordType.WORD: return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case EnglishRecordType.PHRASE: return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case EnglishRecordType.GRAMMAR: return "bg-violet-500/10 text-violet-500 border-violet-500/20";
      case EnglishRecordType.SENTENCE: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default: return "";
    }
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
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
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
        <div className={viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-3"
        }>
          {records.map((record) => (
            <div key={record.id}>
              {viewMode === "grid" ? (
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-primary/5 h-full flex flex-col">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="space-y-1.5">
                      <Badge variant="outline" className={getTypeColor(record.type)}>
                        {record.type}
                      </Badge>
                      <CardTitle className="text-xl font-bold leading-tight line-clamp-2 flex items-center gap-2">
                        {record.content}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-primary/60 hover:text-primary transition-colors hover:bg-transparent"
                          onClick={(e) => { e.stopPropagation(); speak(record.content); }}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(record.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow">
                    {record.translation && (
                      <p className="font-medium text-primary/80">{record.translation}</p>
                    )}
                    {record.example && (
                      <div className="p-3 rounded-lg bg-muted/30 italic text-sm text-foreground/80 relative">
                        "{record.example}"
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                      {record.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary">#{tag}</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="group relative overflow-hidden border-primary/5 hover:bg-muted/30 transition-colors">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center p-4 gap-4">
                    <Badge variant="outline" className={`w-24 justify-center shrink-0 ${getTypeColor(record.type)}`}>
                      {record.type}
                    </Badge>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 group/title">
                        <h3 className="font-bold text-lg truncate">{record.content}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-primary/60 hover:text-primary transition-all hover:bg-transparent"
                          onClick={(e) => { e.stopPropagation(); speak(record.content); }}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        {record.translation && (
                          <span className="text-muted-foreground text-sm truncate">— {record.translation}</span>
                        )}
                      </div>
                      {record.example && (
                        <p className="text-xs text-muted-foreground italic truncate mt-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          "{record.example}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden md:flex flex-wrap gap-1 justify-end mr-2">
                        {record.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary/5 text-primary lowercase">#{tag}</span>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>
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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
