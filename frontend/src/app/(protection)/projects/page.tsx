import Link from "next/link";

import { Button } from "@/components/ui/button";

import { isErrorResponse } from "@/lib/utils";

import { findProjects } from "./_actions/project";
import { ProjectList } from "./_ui/project-list";

export default async function ProjectsPage() {
  const response = await findProjects();

  if (isErrorResponse(response)) {
    return (
      <div>
        <h2>Sorry! Something went wrong!</h2>
        <p>Please refresh to try again</p>
      </div>
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
