"use client";

import { useEffect, useState, useRef } from "react";
import { fetchRandomBatch, updateEnglishRecord, fetchEnglishSettings, EnglishSettings, fetchEnglishRecords } from "../_lib/dal";
import { EnglishRecord, EnglishRecordType } from "../_types/english";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { X, Check, Brain, Volume2, Info, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";

type ChallengeMode = "flashcard" | "multiple-choice" | "matching";

export default function PracticePage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<EnglishRecord[]>([]); // Current loaded batch
  const [completed, setCompleted] = useState(0);
  const seenIdsRef = useRef<number[]>([]);
  const [settings, setSettings] = useState<EnglishSettings | null>(null);
  
  const [mode, setMode] = useState<ChallengeMode>("flashcard");
  const [currentChallengeData, setCurrentChallengeData] = useState<any>(null);

  // Load Initial Setup
  useEffect(() => {
    initPractice();
  }, []);

  const initPractice = async () => {
    try {
      setLoading(true);
      const conf = await fetchEnglishSettings();
      setSettings(conf);
      await loadMoreRecords([]);
    } catch (e) {
      toast.error("Failed to start practice session");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreRecords = async (currentQueue: EnglishRecord[]) => {
    const queueIds = currentQueue.map(r => r.id);
    const excludeIds = Array.from(new Set([...seenIdsRef.current, ...queueIds]));
    const data = await fetchRandomBatch(10, excludeIds);
    const newRecords = [...currentQueue, ...data];
    setRecords(newRecords);
    return newRecords;
  };

  const setupNextChallenge = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setCurrentChallengeData(null);
      
      let available = records;
      if (available.length < 5) {
        available = await loadMoreRecords(available);
      }

      if (available.length === 0) {
        return;
      }

      // Pick a random mode depending on available records length
      let newMode: ChallengeMode = "flashcard";
      const randomModeRoll = Math.random();
      if (available.length >= 4) {
        if (randomModeRoll < 0.33) newMode = "flashcard";
        else if (randomModeRoll < 0.66) newMode = "multiple-choice";
        else newMode = "matching";
      }

      setMode(newMode);

      let nextChallenge: any = null;
      let newRecords = available;

      if (newMode === "flashcard") {
        const item = available[0];
        seenIdsRef.current.push(item.id);
        nextChallenge = { target: item, all: [item] };
        newRecords = available.slice(1);
      } 
      else if (newMode === "multiple-choice") {
        const target = available[0];
        const others = available.slice(1, 4);
        seenIdsRef.current.push(target.id);
        const options = [target, ...others].sort(() => 0.5 - Math.random());
        nextChallenge = { target, options, all: [target] };
        newRecords = available.slice(1);
      }
      else if (newMode === "matching") {
        const targets = available.slice(0, 4);
        targets.forEach(t => seenIdsRef.current.push(t.id));
        const words = [...targets].sort(() => 0.5 - Math.random());
        const meanings = [...targets].sort(() => 0.5 - Math.random());
        nextChallenge = { words, meanings, targets, all: targets };
        newRecords = available.slice(4);
      }

      // Update everything together to ensure animation key matches data
      setRecords(newRecords);
      setCurrentChallengeData(nextChallenge);
      setCompleted(p => p + 1);

    } catch (e) {
      toast.error("Failed to prepare next challenge");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When setup initializes records for the first time, setup next challenge immediately if not set
    if (settings && records.length > 0 && !currentChallengeData) {
      setupNextChallenge();
    }
  }, [settings, records, currentChallengeData]);

  const handleMastery = async (recordId: number, mastered: boolean, record: EnglishRecord) => {
    if (!settings) return;
    try {
      const newLevel = mastered
        ? (record.masteryLevel || 0) + 1
        : settings.wrongOptionAction === 'RESET' ? 0 : Math.max((record.masteryLevel || 0) - 1, 0);

      await updateEnglishRecord(recordId, { masteryLevel: newLevel });
    } catch (e) {
      toast.error("Failed to sync progress");
    }
  };

  const onChallengeComplete = async (results: { id: number, mastered: boolean, record: EnglishRecord, requeue?: boolean }[]) => {
    // Background sync
    Promise.all(results.map(r => handleMastery(r.id, r.mastered, r.record)));
    
    // Add skipped/failed words back to the end of the queue
    const wordsToRequeue = results.filter(r => r.requeue).map(r => r.record);
    if (wordsToRequeue.length > 0) {
      setRecords(prev => [...prev, ...wordsToRequeue]);
    }

    setTimeout(() => {
      setupNextChallenge();
    }, 400); 
  };

  if (!settings) return null;

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
          {loading && !currentChallengeData ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <p className="text-muted-foreground animate-pulse">Loading challenges...</p>
            </motion.div>
          ) : !currentChallengeData ? (
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">You've mastered everything!</h2>
              <p className="text-muted-foreground">Or your library doesn't have enough words. Add more to keep practicing.</p>
              <Link href="/english-learning">
                <Button>Go to Library</Button>
              </Link>
            </div>
          ) : (
            <motion.div
              key={`challenge-${completed}`} // re-animate on every challenge
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="w-full"
            >
              <div className="text-center mb-6 h-8 text-primary font-medium tracking-wide flex justify-center items-center gap-2">
                {mode === "flashcard" && "Flashcard Memory"}
                {mode === "multiple-choice" && "Select the Meaning"}
                {mode === "matching" && "Match the Pairs"}
              </div>

              {mode === "flashcard" && (
                <Flashcard modeData={currentChallengeData} onComplete={onChallengeComplete} />
              )}
              {mode === "multiple-choice" && (
                <MultipleChoice modeData={currentChallengeData} onComplete={onChallengeComplete} />
              )}
              {mode === "matching" && (
                <Matching gameData={currentChallengeData} onComplete={onChallengeComplete} />
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ========================
// CHALLENGE SUB-COMPONENTS
// ========================

// Add text-to-speech helper
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

function Flashcard({ modeData, onComplete }: any) {
  const [isFlipped, setIsFlipped] = useState(false);
  const record = modeData.target as EnglishRecord;

  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div 
        className="w-full max-w-[500px] aspect-[1/1.2] lg:aspect-[4/5] perspective-1000 cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
          
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] w-full h-full">
            <Card className="w-full h-full flex flex-col items-center justify-center p-8 gap-6 shadow-2xl border-primary/10 bg-gradient-to-br from-background to-muted/20 relative overflow-hidden group">
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
                <Lightbulb className="w-4 h-4 text-primary" /> Click to reveal meaning
              </div>
            </Card>
          </div>

          {/* Back */}
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
      </div>

      <div className="flex justify-center items-center gap-4">
        <Button
          variant="outline" size="lg"
          className="h-16 rounded-2xl gap-3 border-2 hover:bg-destructive/10 hover:border-destructive transition-all duration-300 w-32"
          onClick={() => onComplete([{ id: record.id, mastered: false, record, requeue: true }])}
        >
          <X className="w-6 h-6 text-destructive" /> Skip It
        </Button>
        <Button
          className="h-16 rounded-2xl gap-3 text-lg px-12 shadow-xl shadow-primary/20 transition-all duration-300"
          onClick={() => onComplete([{ id: record.id, mastered: true, record }])}
        >
          <Check className="w-6 h-6" /> Got it
        </Button>
      </div>
    </div>
  );
}

function MultipleChoice({ modeData, onComplete }: any) {
  const { target, options } = modeData;
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    if (selectedId !== null) return; // Prevent double clicking
    setSelectedId(id);
    const isCorrect = id === target.id;
    if (isCorrect) speak(target.content);
    
    // Give user brief time to see selection color
    setTimeout(() => {
      onComplete([{ id: target.id, mastered: isCorrect, record: target }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto">
      <Card className="w-full text-center p-8 bg-gradient-to-br from-background to-muted/20 relative shadow-lg">
        <div className="absolute top-0 right-0 p-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          <Volume2 className="w-6 h-6 text-primary" onClick={() => speak(target.content)} />
        </div>
        <Badge variant="outline" className={`px-4 py-1.5 text-sm uppercase tracking-wider font-bold mb-4 ${getTypeColor(target.type)}`}>
          {target.type}
        </Badge>
        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-foreground">
          {target.content}
        </h2>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {options.map((opt: EnglishRecord) => {
          let btnClass = "h-auto py-6 px-4 text-lg border-2 whitespace-normal break-words h-full rounded-2xl transition-all duration-300 ";
          
          if (selectedId !== null) {
            if (opt.id === target.id) {
              btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-bold scale-105 shadow-xl shadow-emerald-500/20";
            } else if (opt.id === selectedId) {
              btnClass += "border-destructive bg-destructive/10 text-destructive scale-95 opacity-50";
            } else {
              btnClass += "opacity-50 border-muted";
            }
          } else {
            btnClass += "hover:border-primary/50 hover:bg-primary/5";
          }

          return (
            <Button
              key={opt.id}
              variant="outline"
              className={btnClass}
              onClick={() => handleSelect(opt.id)}
              disabled={selectedId !== null}
            >
              {opt.translation || opt.definition || opt.content}
            </Button>
          )
        })}
      </div>
    </div>
  );
}

function Matching({ gameData, onComplete }: any) {
  const { words, meanings, targets } = gameData;
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<Set<number>>(new Set());
  const [wrongPairs, setWrongPairs] = useState<{w: number, m: number} | null>(null);
  
  // Track mastery status for each target. Assumed true, flipped to false if error made.
  const masteryStatus = useRef<Record<number, boolean>>({});
  
  useEffect(() => {
    // Initialize mastery tracker
    targets.forEach((t: any) => masteryStatus.current[t.id] = true);
  }, []);

  useEffect(() => {
    if (selectedWord && selectedMeaning) {
      if (selectedWord === selectedMeaning) {
        // Correct match!
        speak(targets.find((t:any) => t.id === selectedWord).content);
        setMatchedIds(prev => new Set(prev).add(selectedWord));
        setSelectedWord(null);
        setSelectedMeaning(null);
        
        // Are we completely done?
        if (matchedIds.size + 1 === targets.length) {
          setTimeout(() => {
            const results = targets.map((t: any) => ({
              id: t.id,
              mastered: masteryStatus.current[t.id],
              record: t
            }));
            onComplete(results);
          }, 800);
        }
      } else {
        // Wrong match
        masteryStatus.current[selectedWord] = false;
        masteryStatus.current[selectedMeaning] = false;
        
        setWrongPairs({ w: selectedWord, m: selectedMeaning });
        setTimeout(() => {
          setWrongPairs(null);
          setSelectedWord(null);
          setSelectedMeaning(null);
        }, 800);
      }
    }
  }, [selectedWord, selectedMeaning]);

  return (
    <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-3xl mx-auto">
      {/* Left Column (Words) */}
      <div className="flex flex-col gap-3">
        {words.map((w: EnglishRecord) => {
          const isMatched = matchedIds.has(w.id);
          const isSelected = selectedWord === w.id;
          const isWrong = wrongPairs?.w === w.id;

          let btnClass = "h-auto py-5 px-4 md:text-lg border-2 shadow-sm rounded-xl transition-all duration-300 w-full whitespace-normal break-words";
          if (isMatched) btnClass += " opacity-0 pointer-events-none scale-90";
          else if (isWrong) btnClass += " border-destructive bg-destructive/10 text-destructive animate-shake";
          else if (isSelected) btnClass += " border-primary bg-primary/10 text-primary scale-105 font-bold shadow-primary/20";
          else btnClass += " hover:border-primary/50 hover:bg-muted/50 text-foreground";

          return (
            <Button 
              key={`w-${w.id}`} variant="outline" className={btnClass}
              onClick={() => setSelectedWord(isSelected ? null : w.id)}
            >
              {w.content}
            </Button>
          );
        })}
      </div>

      {/* Right Column (Meanings) */}
      <div className="flex flex-col gap-3">
        {meanings.map((m: EnglishRecord) => {
          const isMatched = matchedIds.has(m.id);
          const isSelected = selectedMeaning === m.id;
          const isWrong = wrongPairs?.m === m.id;

          let btnClass = "h-auto py-5 px-4 md:text-lg border-2 shadow-sm rounded-xl transition-all duration-300 w-full whitespace-normal break-words";
          if (isMatched) btnClass += " opacity-0 pointer-events-none scale-90";
          else if (isWrong) btnClass += " border-destructive bg-destructive/10 text-destructive animate-shake";
          else if (isSelected) btnClass += " border-primary bg-primary/10 text-primary scale-105 font-bold shadow-primary/20";
          else btnClass += " hover:border-primary/50 hover:bg-muted/50 text-foreground/80";

          return (
            <Button 
              key={`m-${m.id}`} variant="outline" className={btnClass}
              onClick={() => setSelectedMeaning(isSelected ? null : m.id)}
            >
              {m.translation || m.definition || m.content}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
