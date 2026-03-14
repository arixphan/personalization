import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { ProjectListWrapper } from "./_ui/project-list-wrapper";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  return (
    <div>
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage and track all your projects in one place
            </p>
          </div>

          <Link href="/projects/new">
            <Button variant="outline" className="text-lg">
              New Project
            </Button>
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        }
      >
        <ProjectListWrapper />
      </Suspense>
    </div>
  );
}
