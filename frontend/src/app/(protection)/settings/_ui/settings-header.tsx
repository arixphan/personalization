import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SettingsHeader() {
  return (
    <div className="flex items-center space-x-4">
      <Button variant="ghost" size="icon" asChild className="rounded-xl bg-muted/30">
        <Link href="/">
          <ArrowLeft size={20} />
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your preferences and profile</p>
      </div>
    </div>
  );
}
