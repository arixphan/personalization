"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnglishRecordType } from "../_types/english";
import { createEnglishRecord, generateAiAssist } from "../_lib/dal";
import { toast } from "sonner";
import { Sparkles, Loader2, X } from "lucide-react";

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRecordModal({ isOpen, onClose, onSuccess }: AddRecordModalProps) {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: EnglishRecordType.WORD,
    content: "",
    definition: "",
    translation: "",
    example: "",
    note: "",
    tagsStr: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content) return;
    
    setLoading(true);
    try {
      await createEnglishRecord({
        ...formData,
        tags: formData.tagsStr.split(",").map(t => t.trim()).filter(Boolean),
      });
      toast.success("Added to library!");
      setFormData({
        type: EnglishRecordType.WORD,
        content: "",
        definition: "",
        translation: "",
        example: "",
        note: "",
        tagsStr: "",
      });
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to add word");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAssist = async () => {
    if (!formData.content) {
      toast.error("Please enter a word or phrase first");
      return;
    }
    setAiLoading(true);
    try {
      const assist = await generateAiAssist(formData.content, formData.type);
      setFormData(prev => ({
        ...prev,
        definition: assist.definition || prev.definition,
        translation: assist.translation || prev.translation,
        example: assist.example || prev.example,
        note: assist.note || prev.note,
      }));
      toast.success("AI magic applied!");
    } catch (error) {
      toast.error("AI assistant failed. Check your settings.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Add New Record
          </DialogTitle>
          <DialogDescription>
             Add words, phrases or grammar rules to your personal library.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1">
              <Label>Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v) => setFormData(p => ({ ...p, type: v as any }))}
              >
                <SelectTrigger className="bg-muted/30">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EnglishRecordType).map(v => (
                    <SelectItem key={v} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 col-span-1">
              <Label>Tags (sep by comma)</Label>
              <Input 
                placeholder="toefl, business..." 
                className="bg-muted/30"
                value={formData.tagsStr}
                onChange={e => setFormData(p => ({ ...p, tagsStr: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Word / Phrase / Rule</Label>
            <div className="flex gap-2">
              <Input 
                id="content"
                required
                placeholder="e.g., resilient" 
                className="bg-muted/30 font-semibold"
                value={formData.content}
                onChange={e => setFormData(p => ({ ...p, content: e.target.value }))}
              />
              <Button 
                type="button" 
                size="icon" 
                variant="outline"
                className="shrink-0 border-primary/20 text-primary hover:bg-primary/10"
                onClick={handleAiAssist}
                disabled={aiLoading}
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="translation">Meaning / Translation</Label>
            <Input 
              id="translation"
              placeholder="e.g., kiên cường, bền bỉ" 
              className="bg-muted/30"
              value={formData.translation}
              onChange={e => setFormData(p => ({ ...p, translation: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="definition">English Definition (Optional)</Label>
            <Textarea 
              id="definition"
              placeholder="Able to withstand or recover quickly from difficult conditions" 
              className="bg-muted/30 resize-none h-20"
              value={formData.definition}
              onChange={e => setFormData(p => ({ ...p, definition: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="example">Example Sentence</Label>
            <Textarea 
              id="example"
              placeholder="Babies are more resilient than we think." 
              className="bg-muted/30 resize-none h-20"
              value={formData.example}
              onChange={e => setFormData(p => ({ ...p, example: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Additional Notes</Label>
            <Textarea 
              id="note"
              placeholder="Often used with 'to'..." 
              className="bg-muted/30 resize-none h-20"
              value={formData.note}
              onChange={e => setFormData(p => ({ ...p, note: e.target.value }))}
            />
          </div>
        </form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !formData.content} className="shadow-lg shadow-primary/20">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save to library
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
