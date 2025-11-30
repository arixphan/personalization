import Link from "next/link";

import { Button } from "@/components/ui/button";

import { findProjects } from "./_actions/project";
import { ProjectList } from "./_ui/project-list";
import { ErrorDisplay } from "./_ui/error-display";

export default async function ProjectsPage() {
  const response = await findProjects();

  // Check if response is an error
  if ("error" in response) {
    return (
      <ErrorDisplay message={response.error} statusCode={response.statusCode} />
    );
  }

  // Handle case where data might be missing
  if (!response.data || !response.meta) {
    return (
      <ErrorDisplay
        message="No projects data available. Please try again later."
        statusCode={500}
      />
    );
  }

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
      <ProjectList
        initialProjects={response.data}
        initialMeta={response.meta}
      />
    </div>
  );
}
