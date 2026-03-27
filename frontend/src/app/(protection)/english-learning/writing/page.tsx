"use client";

import { useEffect, useState } from "react";
import { fetchWritings } from "../_lib/dal";
import { EnglishWriting } from "../_types/english";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Plus, PenLine, ChevronRight, Calendar, BookOpen, Clock, Brain, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";

export default function WritingDashboard() {
  const [writings, setWritings] = useState<EnglishWriting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWritings();
  }, []);

  const loadWritings = async () => {
    try {
      const data = await fetchWritings();
      setWritings(data);
    } catch (error) {
      toast.error("Failed to load writing history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/english-learning">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Writing Corner
            </h1>
            <p className="text-muted-foreground mt-2">
              Practice expressing yourself. Get professional feedback from your AI coach.
            </p>
          </div>
        </div>
        <Link href="/english-learning/writing/new">
          <Button className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:scale-105 transition-transform h-12 px-6">
            <Plus className="w-5 h-5" />
            Start New Writing
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : writings.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-muted/5">
          <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
            <PenLine className="w-8 h-8 text-primary/40" />
          </div>
          <h3 className="text-xl font-semibold">No writings yet</h3>
          <p className="text-muted-foreground max-w-sm mt-2 mb-6">
            Consistency is key. Start by writing a short paragraph about your day or a topic you love.
          </p>
          <Link href="/english-learning/writing/new">
            <Button variant="outline">Write your first piece</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {writings.map((writing) => (
            <Link key={writing.id} href={`/english-learning/writing/${writing.id}`}>
              <motion.div
                whileHover={{ x: 5 }}
                className="group"
              >
                <Card className="flex items-center p-4 cursor-pointer hover:bg-muted/30 transition-all border-primary/5 hover:border-primary/20">
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">
                        {writing.title || `Writing session #${writing.id}`}
                      </h3>
                      {writing.feedback && (
                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          Score: {writing.feedback.score}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(writing.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {writing.wordCount} words
                      </div>
                      {!writing.feedback && (
                        <span className="flex items-center gap-1 text-primary animate-pulse">
                          <Brain className="w-3 h-3" />
                          Processing feedback...
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors ml-4" />
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
