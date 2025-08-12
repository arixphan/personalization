import { isErrorResponse } from "@/lib/utils";

import { getProject } from "../_actions/project";
import { UpdateProjectForm } from "./update-project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const response = await getProject(id);

  if (isErrorResponse(response)) {
    return (
      <div>
        <h2>Sorry! Something went wrong!</h2>
        <p>Please refresh to try again</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit New Project
        </h1>
      </header>
      <UpdateProjectForm initialProject={response.data} />
    </div>
  );
}
