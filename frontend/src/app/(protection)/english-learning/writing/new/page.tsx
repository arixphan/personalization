"use client";

import { useState, useEffect } from "react";
import { createWriting } from "../../_lib/dal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { BookOpen, Sparkles, Loader2, ArrowLeft, PenTool, CheckCircle, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

export default function NewWritingPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const handleSubmit = async () => {
    if (wordCount < 10) {
      toast.error("Please write at least 10 words to get meaningful feedback.");
      return;
    }
    if (wordCount > 1000) {
      toast.error("Keep it under 1000 words for the best coaching results.");
      return;
    }

    setLoading(true);
    try {
      const result = await createWriting(content, title || "Untitled Writing Session");
      toast.success("Writing submitted! Your AI coach is analyzing...");
      router.push(`/english-learning/writing/${result.id}`);
    } catch (error) {
      toast.error("Failed to submit writing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/english-learning/writing">
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Writing session</h1>
          <p className="text-muted-foreground">Focus on expressing your thoughts. Don't worry about perfection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-primary/5 shadow-xl shadow-primary/5 bg-gradient-to-br from-background to-muted/10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 opacity-30" />
            <CardHeader className="pb-4">
              <Input 
                placeholder="Writing Topic / Title (Optional)" 
                className="text-2xl font-bold border-none bg-transparent placeholder:text-muted-foreground/30 focus-visible:ring-0 p-0 h-auto"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Start writing here... (e.g., 'Today I went to the park and saw many birds...')"
                className="min-h-[400px] text-lg leading-relaxed bg-transparent border-none focus-visible:ring-0 p-0 resize-none font-medium text-foreground/80 selection:bg-primary/10"
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card sticky top-8 border-primary/10 overflow-hidden">
            <CardHeader className="pb-3 border-b border-primary/5">
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> Session Info
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 space-y-8">
              <div className="space-y-4 text-center">
                 <div className="relative inline-flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle 
                        className="text-muted/30" 
                        strokeWidth="4" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="44" 
                        cx="48" 
                        cy="48" 
                      />
                      <circle 
                        className="text-primary transition-all duration-500 ease-out" 
                        strokeWidth="4" 
                        strokeDasharray={276}
                        strokeDashoffset={276 - (Math.min(wordCount, 500) / 500) * 276}
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="44" 
                        cx="48" 
                        cy="48" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black">{wordCount}</span>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest text-primary/60">Words</span>
                    </div>
                 </div>
                 <p className="text-xs text-muted-foreground">Aim for 100-300 words for the best practice session.</p>
              </div>

              <div className="space-y-3">
                 <div className="flex items-center gap-3 text-sm text-foreground/80 font-medium p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="leading-tight">Natural expression check</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-foreground/80 font-medium p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    <span className="leading-tight">Vocabulary booster</span>
                 </div>
                 <div className="flex items-center gap-3 text-sm text-foreground/80 font-medium p-3 rounded-lg bg-violet-500/5 border border-violet-500/10">
                    <PenTool className="w-4 h-4 text-violet-500" />
                    <span className="leading-tight">Full grammar audit</span>
                 </div>
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={loading || wordCount < 10} 
                className="w-full h-14 bg-primary text-lg font-bold shadow-lg shadow-primary/20 gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                Get AI Coaching
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
