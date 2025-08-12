"use client";
import { ProjectForm } from "../_ui/form/project-form";
import { createProject } from "../_lib/dal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { BaseProjectDto } from "../_lib/dto";

export function NewProjectForm() {
  const router = useRouter();
  const handleSubmit = async (project: BaseProjectDto) => {
    try {
      await createProject(project);
      toast.success("Project created successfully!");
      router.push("/projects");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to create project");
        return;
      }
      toast.error("Failed to create project");
    }
  };

  return (
    <ProjectForm
      onSubmit={handleSubmit}
      submitButtonText="Create Project"
      title="Create New Project"
      initialData={{}} // Pass empty object for new project
    />
  );
}
