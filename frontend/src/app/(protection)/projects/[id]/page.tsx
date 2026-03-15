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
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-destructive">Sorry! Something went wrong!</h2>
        <p className="text-muted-foreground mt-2">Please refresh to try again</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Edit Project
        </h1>
      </header>
      <UpdateProjectForm initialProject={response.data} />
    </div>
  );
}
