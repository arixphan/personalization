"use client";

import { useEffect, useState } from "react";
import { fetchRandomRecord, updateEnglishRecord } from "../_lib/dal";
import { EnglishRecord, EnglishRecordType } from "../_types/english";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Brain, Check, ChevronRight, X, Volume2, Info, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

export default function PracticePage() {
  const [record, setRecord] = useState<EnglishRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);

  const loadRandomRecord = async () => {
    try {
      setLoading(true);
      setIsFlipped(false);
      const data = await fetchRandomRecord();
      setRecord(data);
    } catch (error) {
      toast.error("Failed to load a challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRandomRecord();
  }, []);

  const handleMastery = async (mastered: boolean) => {
    if (!record) return;
    try {
      const newLevel = mastered
        ? Math.min((record.masteryLevel || 0) + 20, 100)
        : Math.max((record.masteryLevel || 0) - 10, 0);

      await updateEnglishRecord(record.id, { masteryLevel: newLevel });
      setCompleted(p => p + 1);
      loadRandomRecord();
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const getTypeColor = (type: EnglishRecordType) => {
    switch (type) {
      case EnglishRecordType.WORD: return "text-blue-500 border-blue-500/20 bg-blue-500/10";
      case EnglishRecordType.PHRASE: return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
      case EnglishRecordType.GRAMMAR: return "text-violet-500 border-violet-500/20 bg-violet-500/10";
      case EnglishRecordType.SENTENCE: return "text-amber-500 border-amber-500/20 bg-amber-500/10";
      default: return "";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl h-[calc(100vh-120px)] flex flex-col justify-center gap-8">
      <div className="flex justify-between items-center">
        <Link href="/english-learning">
          <Button variant="ghost" size="sm" className="gap-2">
            <X className="w-4 h-4" />
            Exit Practice
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-full border border-primary/5">
          <Brain className="w-4 h-4 text-primary" />
          Sessions: {completed}
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center relative perspective-1000">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full aspect-[4/3] max-h-[400px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Picking a challenge...</p>
              </div>
            </motion.div>
          ) : !record ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Your library is empty!</h2>
              <p className="text-muted-foreground">Add some words first to start practicing.</p>
              <Link href="/english-learning">
                <Button>Go to Library</Button>
              </Link>
            </div>
          ) : (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="w-full w-full max-w-[500px] aspect-[1/1.2] lg:aspect-[4/5] perspective-1000 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>

                {/* Front Side */}
                <div className="absolute inset-0 [backface-visibility:hidden] w-full h-full">
                  <Card className="w-full h-full flex flex-col items-center justify-center p-8 gap-6 shadow-2xl border-primary/10 bg-gradient-to-br from-background to-muted/20 relative overflow-hidden group">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Volume2 className="w-6 h-6 text-primary" onClick={(e) => { e.stopPropagation(); speak(record.content); }} />
                    </div>

                    <Badge variant="outline" className={`px-4 py-1.5 text-sm uppercase tracking-wider font-bold mb-4 ${getTypeColor(record.type)}`}>
                      {record.type}
                    </Badge>

                    <h2 className="text-4xl md:text-5xl font-black text-center tracking-tight text-foreground leading-[1.1]">
                      {record.content}
                    </h2>

                    <div className="mt-8 flex items-center gap-1.5 text-sm text-muted-foreground bg-primary/5 px-3 py-1 rounded-full border border-primary/5">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Click to reveal meaning
                    </div>
                  </Card>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] w-full h-full">
                  <Card className="w-full h-full flex flex-col p-8 gap-4 shadow-2xl border-primary/10 bg-gradient-to-br from-background via-primary/5 to-muted/20">
                    <div className="flex-grow flex flex-col justify-center space-y-6">
                      <div className="space-y-4 text-center">
                        <Label className="text-primary text-xs font-bold uppercase tracking-widest">Meaning</Label>
                        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                          {record.translation || "No translation"}
                        </p>
                      </div>

                      {record.definition && (
                        <div className="space-y-2 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-black/5 shadow-inner">
                          <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Info className="w-3.5 h-3.5" /> Definition
                          </Label>
                          <p className="text-md leading-relaxed italic">{record.definition}</p>
                        </div>
                      )}

                      {record.example && (
                        <div className="space-y-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <Label className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
                            Example
                          </Label>
                          <p className="text-md font-medium text-foreground/90">"{record.example}"</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline"
          size="lg"
          className={`h-16 rounded-2xl gap-3 border-2 hover:bg-destructive/10 hover:border-destructive transition-all duration-300 w-32 ${!isFlipped ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => handleMastery(false)}
        >
          <X className="w-6 h-6 text-destructive" />
          Again
        </Button>
        <Button
          className={`h-16 rounded-2xl gap-3 text-lg px-12 shadow-xl shadow-primary/20 transition-all duration-300 ${!isFlipped ? 'opacity-50 pointer-events-none' : ''}`}
          onClick={() => handleMastery(true)}
        >
          <Check className="w-6 h-6" />
          Got it
        </Button>
      </div>
    </div>
  );
}
