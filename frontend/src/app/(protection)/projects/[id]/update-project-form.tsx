"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";
import { ProjectStatus } from "@personalization/shared";
import { Button } from "@/components/ui/button";

import { updateProject } from "../_lib/dal";
import { BaseProjectDto } from "../_lib/dto";
import { Project } from "../_types/project";
import { ProjectForm } from "../_ui/form/project-form";

interface UpdateProjectFormProps {
  initialProject: Project;
}

export function UpdateProjectForm({ initialProject }: UpdateProjectFormProps) {
  const router = useRouter();

  const handleSubmit = async (project: BaseProjectDto) => {
    try {
      await updateProject(initialProject.id, project);
      toast.success("Project updated successfully!");
      router.push("/projects");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create project");
        return;
      }
      toast.error("Failed to update project");
    }
  };

  if (initialProject.status === ProjectStatus.completed) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h3 className="font-medium text-lg mb-1">Project is Completed</h3>
        <p>This project has been marked as completed and can no longer be edited.</p>
        <div className="mt-4">
          <Button onClick={() => router.push(`/projects/${initialProject.id}/board`)}>Return to Board</Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      submitButtonText="Update"
      title="Edit Project"
      initialData={initialProject}
    />
  );
}
