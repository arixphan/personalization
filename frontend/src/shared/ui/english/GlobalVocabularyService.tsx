"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";
import { AddRecordModal } from "@/app/(protection)/english-learning/_ui/AddRecordModal";
import { EnglishRecordType } from "@/app/(protection)/english-learning/_types/english";

/**
 * GlobalVocabularyService provides a floating action button whenever text is selected
 * anywhere in the application, allowing users to quickly add the selected text
 * to their English learning library.
 */
export default function GlobalVocabularyService() {
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [initialData, setInitialData] = useState<{ content: string; type: EnglishRecordType } | null>(null);

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Wait a bit for the selection to be finalized
      setTimeout(() => {
        const activeSelection = window.getSelection();
        const text = activeSelection?.toString().trim();

        if (text && text.length > 0) {
          try {
            const range = activeSelection?.getRangeAt(0);
            const rects = range?.getClientRects();
            
            if (rects && rects.length > 0) {
              // Get the last rect of the selection for placement
              const rect = rects[rects.length - 1];
              
              setSelection({
                text,
                x: rect.left + rect.width / 2,
                y: rect.top - 45, // Above selection
              });
            }
          } catch (err) {
            console.warn("Selection coordinate calculation failed", err);
          }
        }
      }, 10);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside selection tool, clear it
      if (!(e.target as HTMLElement).closest(".selection-tool")) {
        setSelection(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (selection) {
      setInitialData({
        content: selection.text,
        type: selection.text.split(" ").length > 3 ? EnglishRecordType.PHRASE : EnglishRecordType.WORD,
      });
      setSelection(null);
      setModalOpen(true);
      
      // Clear browser selection
      window.getSelection()?.removeAllRanges();
    }
  };

  return (
    <>
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="fixed z-[9999] selection-tool pointer-events-none"
            style={{
              left: selection.x,
              top: selection.y,
            }}
          >
            <button
              onClick={handleAddClick}
              className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full shadow-xl hover:bg-primary/90 transition-all active:scale-95 text-xs font-semibold -translate-x-1/2 border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add Word</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AddRecordModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {}}
        initialData={initialData || undefined}
        autoAi={true}
      />
    </>
  );
}
