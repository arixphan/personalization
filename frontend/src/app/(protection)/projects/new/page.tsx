import { NewProjectForm } from "./new-project-form";

export default function NewProjectPage() {
  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Project
        </h1>
      </header>
      <NewProjectForm />
    </div>
  );
}
