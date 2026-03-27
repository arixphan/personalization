"use client";

import { useEffect, useState, use } from "react";
import { fetchWritingDetail, createEnglishRecord } from "../../_lib/dal";
import { EnglishWriting, EnglishRecordType } from "../../_types/english";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, CheckCircle, Brain, BookOpen, MessageSquare, Lightbulb, Zap, TrendingUp, HelpCircle, PenTool, Gem, BookmarkPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "motion/react";

export default function WritingFeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [writing, setWriting] = useState<EnglishWriting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"coach" | "raw">("coach");

  useEffect(() => {
    loadWriting();
  }, [id]);

  const loadWriting = async () => {
    try {
      setLoading(true);
      const data = await fetchWritingDetail(Number(id));
      setWriting(data);
      
      // If feedback is still processing, retry once after 5s
      if (!data.feedback) {
        setTimeout(loadWriting, 5000);
      }
    } catch (error) {
      toast.error("Failed to load writing feedback");
    } finally {
      if (writing?.feedback) setLoading(false);
      else if (!loading) setLoading(false);
    }
  };

  const handleSaveGem = async (gem: any) => {
    try {
      await createEnglishRecord({
        content: gem.content,
        type: gem.type as any,
        definition: gem.definition,
        translation: gem.translation,
        example: gem.example,
        tags: ["from-writing-coach"]
      });
      toast.success(`"${gem.content}" added to your library!`);
    } catch (error) {
      toast.error("Failed to save to library");
    }
  };

  if (loading && !writing) {
    return (
      <div className="container mx-auto py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Your AI coach is analyzing your writing...</p>
      </div>
    );
  }

  if (!writing) return <div className="p-20 text-center">Writing not found</div>;

  const feedback = writing.feedback;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Link href="/english-learning/writing">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{writing.title || "Untitled Session"}</h1>
            <p className="text-muted-foreground">Session review from {new Date(writing.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        {feedback && (
          <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
            <div className="text-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Naturalness Score</p>
              <p className={`text-4xl font-black ${feedback.score >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {feedback.score}<span className="text-sm text-muted-foreground/60">/100</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        )}
      </div>

      {!feedback ? (
        <Card className="p-12 text-center border-dashed bg-muted/5 animate-pulse">
           <Brain className="w-12 h-12 mx-auto text-primary mb-4" />
           <CardTitle>Analysis in Progress</CardTitle>
           <CardDescription>This usually takes 10-15 seconds. Hold tight!</CardDescription>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Feedback Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Multi-version Tab Switcher */}
            <div className="flex gap-2 p-1 bg-muted/30 rounded-xl w-fit">
              <Button 
                variant={activeTab === "coach" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("coach")}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" /> Enhanced Version
              </Button>
              <Button 
                variant={activeTab === "raw" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("raw")}
                className="gap-2"
              >
                <PenTool className="w-4 h-4" /> Your Version
              </Button>
            </div>

            <Card className="border-primary/5 shadow-xl shadow-primary/5 min-h-[400px]">
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-lg leading-relaxed text-foreground/80 font-medium font-serif"
                  >
                    {activeTab === "coach" ? feedback.enhancedVersion : writing.content}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
            
            {/* Learning Gems Section */}
            {feedback.gems && feedback.gems.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                  <Gem className="w-5 h-5 text-primary" /> Learning Gems
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {feedback.gems.map((gem, i) => (
                    <Card key={i} className="border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.04] transition-colors relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 h-8 text-xs font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                          onClick={() => handleSaveGem(gem)}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" /> Save to Library
                        </Button>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {gem.type}
                          </Badge>
                          <h3 className="text-xl font-bold text-primary">{gem.content}</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                             <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-tighter w-16 pt-0.5">Meaning</span>
                             <p className="text-md font-medium">{gem.translation} <span className="text-muted-foreground font-normal">— {gem.definition}</span></p>
                          </div>
                          <div className="flex gap-2">
                             <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-tighter w-16 pt-0.5">Example</span>
                             <p className="text-sm italic text-foreground/70">"{gem.example}"</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Vocabulary Booster Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Vocabulary Booster
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedback.vocabulary?.map((v, i) => (
                  <Card key={i} className="border-primary/5 bg-gradient-to-br from-background to-amber-500/[0.02] relative group">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-amber-600 hover:bg-amber-500 hover:text-white rounded-full"
                        onClick={() => handleSaveGem({
                          content: v.suggestion,
                          type: 'WORD',
                          definition: v.definition,
                          translation: v.translation,
                          example: v.example
                        })}
                      >
                        <BookmarkPlus className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between pr-8">
                        <span className="text-xs font-bold uppercase text-muted-foreground line-through decoration-destructive/50">{v.original}</span>
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">{v.suggestion}</Badge>
                      </div>
                      <p className="text-sm text-foreground/80 italic">“{v.reason}”</p>
                      {v.translation && (
                        <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-widest">{v.translation}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

             {/* Corrections Logic */}
             <section className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" /> Detailed Corrections
              </h2>
              <div className="space-y-3">
                {feedback.corrections?.map((c, i) => (
                  <Card key={i} className="border-primary/5 group transition-colors hover:border-primary/20">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
                       <div className="flex flex-col gap-1 min-w-[200px]">
                         <span className="text-sm line-through text-destructive font-medium opacity-60 decoration-red-500/50">{c.original}</span>
                         <span className="text-md font-bold text-emerald-600 flex items-center gap-1.5 underline decoration-emerald-500/30 decoration-2 underline-offset-4">
                           {c.correction}
                         </span>
                       </div>
                       <div className="flex-grow flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-sm text-foreground/70 border border-black/[0.02]">
                         <MessageSquare className="w-4 h-4 text-primary/40 shrink-0" />
                         {c.reason}
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Tips */}
          <div className="lg:col-span-4 space-y-6">
             <Card className="glass-card sticky top-8 border-primary/5 shadow-2xl shadow-primary/5">
                <CardHeader>
                  <CardTitle className="text-md flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" /> Improvement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   {feedback.tips?.map((tip, i) => (
                     <div key={i} className="space-y-2 group">
                        <div className="flex items-center gap-2 text-xs font-black text-primary/40 group-hover:text-primary transition-colors">
                          <span className="w-4 h-[1px] bg-primary/20 group-hover:bg-primary transition-colors" />
                          TIP #{i+1}
                        </div>
                        <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors">{tip}</p>
                     </div>
                   ))}
                   
                   <div className="pt-6 border-t border-primary/5 flex flex-col gap-3">
                     <p className="text-xs text-muted-foreground font-medium text-center italic">
                        "Your thoughts are becoming clearer. Keep writing every day!"
                     </p>
                     <Link href="/english-learning/writing/new">
                        <Button className="w-full h-11 shadow-lg shadow-primary/10">Practice Again</Button>
                     </Link>
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
