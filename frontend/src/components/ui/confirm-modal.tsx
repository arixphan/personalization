"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogPortal,
  AlertDialogOverlay,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "destructive",
}: ConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="animate-none duration-0 transition-none bg-slate-500/10" />
        <AlertDialogContent className="rounded-[2rem] sm:rounded-[2.5rem] md:max-w-[400px] border-none shadow-2xl p-0 overflow-hidden animate-none duration-0">
          <div className="p-6 pt-8 space-y-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black text-xl uppercase tracking-tighter">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-muted-foreground/80">
                {description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 pt-2">
              <AlertDialogCancel onClick={onClose} className="rounded-xl font-bold border-primary/10 hover:bg-primary/5 h-11 px-6">
                {cancelText}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={onConfirm}
                className={cn(
                  "rounded-xl font-bold text-white transition-all shadow-lg h-11 px-6",
                  variant === "destructive" 
                    ? "bg-destructive hover:bg-destructive/90 shadow-destructive/20" 
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
              >
                {confirmText}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
}
