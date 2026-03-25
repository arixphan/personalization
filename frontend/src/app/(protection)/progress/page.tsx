import { Metadata } from "next";
import ProgressDashboard from "./_ui/progress-dashboard";

export const metadata: Metadata = {
  title: "Progress Tracking | Personalization",
  description: "Track your progress on books, courses, and projects.",
};

export default function ProgressPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Progress Tracking</h1>
        <p className="text-muted-foreground">
          Monitor your goals and milestones in one place.
        </p>
      </div>
      <ProgressDashboard />
    </div>
  );
}
