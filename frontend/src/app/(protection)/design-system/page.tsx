"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  MousePointer2, 
  Baseline, 
  Layers, 
  Info,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Undo,
  Check,
  Trash2,
  PlusCircle,
  ArrowLeft,
  Layout
} from "lucide-react";

export default function DesignSystemPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-16">
      <header className="space-y-4 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
        <p className="text-muted-foreground text-lg">
          System design for UI components, typography, and common patterns used in the Personalization project.
        </p>
      </header>

      {/* Typography Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <Type className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Typography</h2>
        </div>
        
        <div className="grid gap-8 p-6 rounded-xl border bg-card/50">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Headline 1 / Geist Sans</span>
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">The quick brown fox jumps over the lazy dog</h1>
          </div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Headline 2 / Geist Sans</span>
            <h2 className="text-3xl font-semibold tracking-tight first:mt-0">The quick brown fox jumps over the lazy dog</h2>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Headline 3 / Geist Sans</span>
            <h3 className="text-2xl font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</h3>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Headline 4 / Geist Sans</span>
            <h4 className="text-xl font-semibold tracking-tight">The quick brown fox jumps over the lazy dog</h4>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Label / Geist Sans</span>
            <p className="text-sm font-medium leading-none">The quick brown fox jumps over the lazy dog</p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Body / Geist Sans</span>
            <p className="text-base text-muted-foreground leading-7">
              The quick brown fox jumps over the lazy dog. A versatile typeface designed for legibility and aesthetic balance. 
              Used for main content and descriptions.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Code / Geist Mono</span>
            <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
              const fox = "jumps"; // The quick brown fox
            </code>
          </div>
        </div>
      </section>

      {/* Buttons Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <MousePointer2 className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Buttons</h2>
        </div>

        <div className="grid gap-8 p-6 rounded-xl border bg-card/50">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Primary</span>
              <Button variant="default">Primary Action</Button>
            </div>
            <div className="space-y-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Secondary</span>
              <Button variant="secondary">Secondary Action</Button>
            </div>
            <div className="space-y-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Outline</span>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="space-y-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Ghost</span>
              <Button variant="ghost">Ghost Button</Button>
            </div>
            <div className="space-y-2 flex-1 min-w-[120px]">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Destructive</span>
              <Button variant="destructive">Delete Item</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 items-end pt-4 border-t">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Large</span>
              <Button size="lg">Large</Button>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Default</span>
              <Button size="default">Default</Button>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Small</span>
              <Button size="sm">Small</Button>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Icon</span>
              <Button size="icon" variant="outline">
                <CheckCircle2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <Baseline className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Inputs</h2>
        </div>

        <div className="grid gap-8 p-6 rounded-xl border bg-card/50">
          <div className="grid sm:grid-cols-2 gap-6 pb-6 border-b">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Normal Input</label>
              <Input placeholder="Enter placeholder text..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">With Value</label>
              <Input defaultValue="Pre-filled value" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">Disabled</label>
              <Input disabled placeholder="Can't type here" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none flex gap-1 items-center">
                Invalid State <AlertCircle className="size-3 text-destructive" />
              </label>
              <Input 
                aria-invalid="true" 
                placeholder="Invalid entry" 
                className="border-destructive focus-visible:ring-destructive/20"
              />
            </div>
          </div>

          <div className="space-y-4">
             <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Usage Example</span>
             <div className="max-w-sm space-y-4 p-4 rounded-lg bg-background border">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Contact Search</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Search users..." />
                    <Button size="sm">Search</Button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Common UI Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <Layers className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Common UI</h2>
        </div>

        <div className="grid gap-8 p-6 rounded-xl border bg-card/50">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Badges</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">New</Badge>
              <Badge variant="secondary">In Progress</Badge>
              <Badge variant="outline">Backlog</Badge>
              <Badge variant="destructive">Critical</Badge>
              <Badge variant="outline" className="gap-1 flex items-center">
                <Clock className="size-3" /> Due Soon
              </Badge>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Cards</span>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <div className="p-4 bg-muted/50 border-b flex justify-between items-center">
                  <h3 className="font-semibold">Project Card Header</h3>
                  <Badge variant="outline">v1.2</Badge>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground">
                    This is a standard card component used for grouping related information.
                  </p>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="sm">Cancel</Button>
                  <Button size="sm">Save</Button>
                </div>
              </div>

               <div className="rounded-xl border p-4 hover:border-primary/50 transition-colors cursor-pointer space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Clickable List Item</h4>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    A list item variant often seen in boards or dashboards with subtle hover states.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Project UI Patterns Section */}
      <section className="space-y-8 pb-10">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <Layers className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Project UI Patterns</h2>
        </div>

        <div className="grid gap-8 p-6 rounded-xl border bg-card/50">
          <div className="space-y-4">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Status Indicators</span>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-green-500 bg-green-100 dark:bg-green-900/20">
                <Play size={14} />
                <span>Active</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20">
                <Pause size={14} />
                <span>On Hold</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium text-blue-500 bg-blue-100 dark:bg-blue-900/20">
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Priority Badges</span>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">High</Badge>
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">Medium</Badge>
              <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Low</Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Semantic Rules & Guidelines Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-2 border-l-4 border-primary pl-4">
          <Layout className="size-6 text-primary" />
          <h2 className="text-2xl font-semibold italic">Semantic Rules & Guidelines</h2>
        </div>

        <div className="grid gap-10 p-6 rounded-xl border bg-card/50">
          {/* Typography Hierarchy */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Type className="size-4" /> Typography Hierarchy
            </h3>
            <div className="grid gap-4 border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/50 p-3 text-xs font-mono uppercase tracking-widest border-b">
                <div>Context</div>
                <div>Component / Style</div>
                <div>Usage Rule</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center border-b">
                <div className="font-medium">Main Page Title</div>
                <div className="text-2xl font-bold">H1 / 4xl</div>
                <div className="text-sm text-muted-foreground">Only one per page. Used at the top of the main content area.</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center border-b">
                <div className="font-medium">Section Heading</div>
                <div className="text-xl font-semibold">H2 / 2xl</div>
                <div className="text-sm text-muted-foreground">Used for major sections within a page (e.g., "Basic Information").</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center border-b">
                <div className="font-medium">Card Title</div>
                <div className="text-lg font-semibold">H3 / lg</div>
                <div className="text-sm text-muted-foreground">Used inside cards or distinct navigation blocks.</div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="font-medium">Input Labels</div>
                <div className="text-sm font-medium">Label / sm</div>
                <div className="text-sm text-muted-foreground">Standard size for form labels. Use font-medium for clarity.</div>
              </div>
            </div>
          </div>

          {/* Action Guidelines */}
          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Check className="size-4" /> Action Patterns (Buttons)
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-3 p-4 rounded-lg border bg-background">
                <div className="flex items-center gap-2 text-primary">
                  <PlusCircle className="size-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Creation</span>
                </div>
                <p className="text-xs text-muted-foreground">Always use Primary (variant="default") for the main positive outcome.</p>
                <Button className="w-full">Create Project</Button>
              </div>

              <div className="space-y-3 p-4 rounded-lg border bg-background">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Undo className="size-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Cancel / Back</span>
                </div>
                <p className="text-xs text-muted-foreground">Use Ghost or Outline variants. Avoid visual competition with Primary actions.</p>
                <div className="flex gap-2">
                  <Button variant="ghost" className="flex-1">Cancel</Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowLeft size={14} /> Back
                  </Button>
                </div>
              </div>

              <div className="space-y-3 p-4 rounded-lg border bg-destructive/10 border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <Trash2 className="size-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Destructive</span>
                </div>
                <p className="text-xs text-muted-foreground text-destructive/80">Use Destructive variant for deletion or irreversible actions.</p>
                <Button variant="destructive" className="w-full">Delete Project</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="pt-10 text-center text-sm text-muted-foreground border-t">
        <p>© 2026 Personal Management System. All rights reserved.</p>
      </footer>
    </div>
  );
}
