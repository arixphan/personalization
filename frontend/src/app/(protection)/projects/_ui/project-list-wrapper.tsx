import { findProjects } from "../_actions/project";
import { ProjectList } from "./project-list";
import { ErrorDisplay } from "./error-display";

export async function ProjectListWrapper() {
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
    <ProjectList
      initialProjects={response.data}
      initialMeta={response.meta}
    />
  );
}
