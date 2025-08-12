"use client";
import { useState, useEffect } from "react";
import { Save, Code, Tag, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  CustomInput,
  CustomTextarea,
  CustomSelect,
} from "@/components/ui/input";
import { enumToSelectOptions } from "@/lib/utils";
import { zodErrorsToMap } from "@/lib/validation";

import { BaseProjectDto, BaseProjectSchema } from "../../_lib/dto";
import { ProjectType } from "../../_types/project";
import { ColumnInput } from "./column-input";
import { TagInput } from "./tag-input";

const projectTypes = enumToSelectOptions(ProjectType);

const predefinedTags = [
  "Backend",
  "Frontend",
  "API",
  "Database",
  "UI/UX",
  "Mobile",
  "Web",
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "AWS",
  "Docker",
  "Testing",
  "DevOps",
  "Analytics",
];

const defaultColumns = ["To Do", "In Progress", "Testing", "Done"];

export interface ProjectFormData extends BaseProjectDto {
  id?: string;
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  submitButtonText?: string;
  title?: string;
}

export const ProjectForm = ({
  initialData = {},
  onSubmit,
  submitButtonText = "Create Project",
  title = "Project Information",
}: ProjectFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    type: initialData.type || "",
    version: initialData.version || "1.0.0",
  });

  const [statusColumns, setStatusColumns] = useState<string[]>(
    initialData.columns || defaultColumns
  );

  const [projectTags, setProjectTags] = useState<string[]>(
    initialData.tags || []
  );

  const [errorMap, setErrorMap] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  // Update form when initialData changes (useful for editing mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || "",
        version: initialData.version || "1.0.0",
      });
      setStatusColumns(initialData.columns || defaultColumns);
      setProjectTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleInputChange = (field: string, value: string) => {
    if (errorMap.has(field)) {
      setErrorMap((prev) => {
        const newMap = new Map(prev);
        newMap.delete(field);
        return newMap;
      });
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const projectData: ProjectFormData = {
        ...formData,
        columns: statusColumns,
        tags: projectTags,
        ...(initialData.id && { id: initialData.id }),
      };

      BaseProjectSchema.parse(projectData);

      await onSubmit(projectData);

      setErrorMap(new Map());
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMap(zodErrorsToMap(error.errors));
        toast.error("Please fix the validation errors");
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomInput
            id="project-title"
            label="Project Title"
            value={formData.title}
            onChange={(value) => handleInputChange("title", value)}
            placeholder="Enter project title"
            required
            error={errorMap.get("title")}
          />

          <CustomInput
            id="project-version"
            label="Project Version"
            value={formData.version}
            onChange={(value) => handleInputChange("version", value)}
            placeholder="1.0.0"
            required
            error={errorMap.get("version")}
          />
        </div>

        <div className="mt-6">
          <CustomSelect
            id="project-type"
            label="Project Type"
            value={formData.type}
            onChange={(value) => handleInputChange("type", value)}
            placeholder="Select project type"
            required
            options={projectTypes}
            error={errorMap.get("type")}
          />
        </div>

        <div className="mt-6">
          <CustomTextarea
            id="project-description"
            label="Project Description"
            value={formData.description}
            onChange={(value) => handleInputChange("description", value)}
            placeholder="Describe your project..."
            maxLength={500}
            error={errorMap.get("description")}
          />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <List className="w-5 h-5 mr-2" />
          Kanban Board Columns
        </h2>

        <ColumnInput
          columns={statusColumns}
          onColumnsChange={setStatusColumns}
          placeholder="Add new column"
        />
      </div>

      {/* Project Tags */}
      <div className="p-6 rounded-lg border border-gray-200 bg-white dark:bg-gray-800/50 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Tag className="w-5 h-5 mr-2" />
          Project Tags
        </h2>

        <TagInput
          tags={projectTags}
          onTagsChange={setProjectTags}
          predefinedTags={predefinedTags}
          placeholder="Add custom tag"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          className="text-lg"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          className="text-lg bg-black text-white dark:bg-white dark:text-black"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </div>
  );
};
