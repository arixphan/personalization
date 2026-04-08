"use client";

import { memo } from "react";
import { EnglishRecord, EnglishRecordType } from "../_types/english";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, RotateCcw, Trash2 } from "lucide-react";

interface RecordListProps {
  records: EnglishRecord[];
  viewMode: "grid" | "list";
  onSpeak: (content: string) => void;
  onResetMastery: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (record: EnglishRecord) => void;
}

export const RecordList = memo(({
  records,
  viewMode,
  onSpeak,
  onResetMastery,
  onDelete,
  onEdit,
}: RecordListProps) => {
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
    <div className={viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "space-y-3"
    }>
      {records.map((record) => (
        <div key={record.id} onClick={() => onEdit(record)} className="cursor-pointer">
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
                      onClick={(e) => { e.stopPropagation(); onSpeak(record.content); }}
                    >
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary hover:bg-primary/10 h-8 w-8"
                    title="Re-learn"
                    onClick={(e) => { e.stopPropagation(); onResetMastery(record.id); }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
                      onClick={(e) => { e.stopPropagation(); onSpeak(record.content); }}
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
                    className="text-primary hover:bg-primary/10 h-8 w-8"
                    title="Re-learn"
                    onClick={(e) => { e.stopPropagation(); onResetMastery(record.id); }}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); onDelete(record.id); }}
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
  );
});

RecordList.displayName = "RecordList";
