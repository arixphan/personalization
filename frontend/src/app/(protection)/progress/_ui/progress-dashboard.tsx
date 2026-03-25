"use client";

import { useState, useEffect } from "react";
import { fetchProgressTrackers, ProgressFilter } from "../_lib/dal";
import { ProgressTracker } from "../_types/progress";
import ProgressCard from "./progress-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, X, LayoutGrid, List, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDebouncedValue } from "@tanstack/react-pacer";
import AddProgressModal from "./add-progress-modal";
import ProgressDetailModal from "./progress-detail-modal";
import ProgressRow from "./progress-row";

export default function ProgressDashboard() {
  const [trackers, setTrackers] = useState<ProgressTracker[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProgressFilter>({ title: "", tags: [] });
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTracker, setSelectedTracker] = useState<ProgressTracker | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [debouncedTitle] = useDebouncedValue(filter.title, { wait: 400 });

  const loadAllTags = async () => {
    try {
      const data = await fetchProgressTrackers({});
      const tags = Array.from(new Set(data.flatMap(t => t.tags || []))).sort();
      setAvailableTags(tags);
    } catch (error) {
      console.error("Failed to load tags", error);
    }
  };

  const loadTrackers = async () => {
    setLoading(true);
    try {
      const data = await fetchProgressTrackers({
        ...filter,
        title: debouncedTitle
      });
      setTrackers(data);
      
      // Update selected tracker if it's currently open in the detail modal
      if (selectedTracker) {
        const updated = data.find(t => t.id === selectedTracker.id);
        if (updated) setSelectedTracker(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTags();
  }, []);

  useEffect(() => {
    loadTrackers();
  }, [debouncedTitle, filter.tags]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTrackers();
  };

  const toggleTag = (tag: string) => {
    setFilter((prev) => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }));
  };

  const handleViewDetails = (tracker: ProgressTracker) => {
    setSelectedTracker(tracker);
    setIsDetailModalOpen(true);
  };

  const handleUpdateEntry = (id: number, data: Partial<ProgressTracker>) => {
    setTrackers(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
    if (selectedTracker?.id === id) {
      setSelectedTracker(prev => prev ? { ...prev, ...data } : null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title..."
            className="pl-10"
            value={filter.title}
            onChange={(e) => setFilter({ ...filter, title: e.target.value })}
          />
        </form>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
            <Button 
              variant={view === 'grid' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-md"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === 'list' ? 'secondary' : 'ghost'} 
              size="icon" 
              className="h-8 w-8 rounded-md"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="hidden md:flex gap-2">
                <Filter className="h-4 w-4" />
                Filter
                {filter.tags && filter.tags.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-5 justify-center rounded-full">
                    {filter.tags.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Filter by Tags
                </p>
                {availableTags.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto custom-scrollbar">
                    {availableTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <span>{tag}</span>
                        {filter.tags?.includes(tag) && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                    No tags available
                  </p>
                )}
                {filter.tags && filter.tags.length > 0 && (
                  <>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => setFilter({ ...filter, tags: [] })}
                      className="w-full text-center px-2 py-1.5 text-xs text-primary hover:underline"
                    >
                      Clear all filters
                    </button>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <Button onClick={() => setIsAddModalOpen(true)} className="flex-1 md:flex-none">
            <Plus className="mr-2 h-4 w-4" />
            Add Tracker
          </Button>
        </div>
      </div>

      {filter.tags && filter.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filter.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="px-3 py-1">
              {tag}
              <X
                className="ml-2 h-3 w-3 cursor-pointer"
                onClick={() => toggleTag(tag)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilter({ ...filter, tags: [] })}
            className="h-7 px-2 text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {loading ? (
        <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={view === 'grid' ? "h-64 w-full rounded-xl" : "h-20 w-full rounded-xl"} />
          ))}
        </div>
      ) : trackers.length > 0 ? (
        <div className={view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {trackers.map((tracker) => (
            view === 'grid' ? (
              <ProgressCard 
                key={tracker.id} 
                tracker={tracker} 
                onRefresh={loadTrackers}
                onUpdateEntry={handleUpdateEntry}
                onViewDetails={() => handleViewDetails(tracker)}
              />
            ) : (
              <ProgressRow 
                key={tracker.id} 
                tracker={tracker} 
                onRefresh={loadTrackers}
                onUpdateEntry={handleUpdateEntry}
                onViewDetails={() => handleViewDetails(tracker)}
              />
            )
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">No tracking items found.</p>
          <Button variant="link" onClick={() => setIsAddModalOpen(true)}>
            Create your first tracker
          </Button>
        </div>
      )}

      <AddProgressModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSuccess={() => {
          loadTrackers();
          loadAllTags();
        }}
      />

      <ProgressDetailModal
        tracker={selectedTracker}
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onRefresh={loadTrackers}
        onUpdateEntry={handleUpdateEntry}
      />
    </div>
  );
}
