"use client";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

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

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      submitButtonText="Update"
      title="Edit Project"
      initialData={initialProject}
    />
  );
}
